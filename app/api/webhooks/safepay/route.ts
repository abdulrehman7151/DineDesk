import "server-only";
import { prisma } from "@/lib/prisma";
import { verifySafepayWebhookSignature } from "@/lib/payments/safepay-webhook";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 64 * 1024;

type JsonRecord = Record<string, unknown>;

type SafepayWebhookEvent = {
    token: string;
    type: string;
    data: JsonRecord;
};

function isRecord(value: unknown): value is JsonRecord {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isSafepayWebhookEvent(value: unknown): value is SafepayWebhookEvent {
    return (
        isRecord(value) &&
        typeof value.token === "string" &&
        value.token.length > 0 &&
        value.token.length <= 191 &&
        typeof value.type === "string" &&
        value.type.length > 0 &&
        value.type.length <= 191 &&
        isRecord(value.data)
    );
}

function text(value: unknown) {
    return typeof value === "string" && value.length > 0 && value.length <= 191
        ? value
        : null;
}

function integer(value: unknown) {
    return typeof value === "number" && Number.isSafeInteger(value)
        ? value
        : null;
}

function subscriptionIdentity(reference: string | null, providerId: string | null) {
    const OR = [
        ...(reference ? [{ reference }] : []),
        ...(providerId ? [{ safepaySubscriptionId: providerId }] : []),
    ];

    return OR.length ? { OR } : null;
}

async function applyEvent(event: SafepayWebhookEvent) {
    const data = event.data;
    const eventType = event.type;
    const reference = text(data.reference);
    const tracker = text(data.tracker);
    const providerSubscriptionId =
        text(data.subscription_id) ??
        (eventType.startsWith("subscription.") ? text(data.token) : null);

    await prisma.$transaction(async (transaction) => {
        const safeData: Record<string, string | number> = {};
        for (const key of [
            "reference",
            "tracker",
            "amount",
            "currency",
            "state",
            "subscription_id",
            "token",
        ]) {
            const value = data[key];
            if (
                typeof value === "string" ||
                (typeof value === "number" && Number.isFinite(value))
            ) {
                safeData[key] = value;
            }
        }

        const eventRecord = await transaction.webhookEvent.create({
            data: {
                eventId: event.token,
                eventType,
                payload: {
                    token: event.token,
                    type: eventType,
                    data: safeData,
                },
            },
        });

        if (eventType === "subscription.created" && reference && providerSubscriptionId) {
            await transaction.subscription.updateMany({
                where: { reference },
                data: { safepaySubscriptionId: providerSubscriptionId },
            });
        }

        if (
            (eventType === "payment.succeeded" ||
                eventType === "subscription.payment.succeeded") &&
            tracker &&
            (eventType === "subscription.payment.succeeded" ||
                data.state === undefined ||
                data.state === "TRACKER_ENDED")
        ) {
            const identity = subscriptionIdentity(reference, providerSubscriptionId);
            const subscription = identity
                ? await transaction.subscription.findFirst({
                      where: identity,
                      include: { plan: true, payments: true },
                  })
                : null;
            const amount = integer(data.amount);
            const currency = text(data.currency)?.toUpperCase();

            if (
                subscription &&
                amount === subscription.plan.price &&
                currency === subscription.plan.currency.toUpperCase() &&
                ["PENDING", "ACTIVE"].includes(subscription.status)
            ) {
                const recordedPayment = await transaction.payment.findUnique({
                    where: { safepayTransactionId: tracker },
                });

                if (!recordedPayment) {
                    const pendingPayment = subscription.payments.find(
                        (payment) =>
                            payment.status === "PENDING" ||
                            payment.status === "FAILED"
                    );

                    if (pendingPayment) {
                        await transaction.payment.update({
                            where: { id: pendingPayment.id },
                            data: {
                                amount,
                                currency,
                                status: "SUCCEEDED",
                                safepayTransactionId: tracker,
                                paidAt: new Date(),
                            },
                        });
                    } else if (eventType === "subscription.payment.succeeded") {
                        await transaction.payment.create({
                            data: {
                                subscriptionId: subscription.id,
                                amount,
                                currency,
                                status: "SUCCEEDED",
                                safepayTransactionId: tracker,
                                paidAt: new Date(),
                            },
                        });
                    }

                    await transaction.subscription.update({
                        where: { id: subscription.id },
                        data: { status: "ACTIVE" },
                    });
                }
            } else if (subscription) {
                console.error("Safepay payment did not match the stored plan.", {
                    eventId: event.token,
                    subscriptionId: subscription.id,
                    expectedAmount: subscription.plan.price,
                    receivedAmount: amount,
                    expectedCurrency: subscription.plan.currency,
                    receivedCurrency: currency,
                });
            }
        }

        if (eventType === "payment.failed" && tracker) {
            const identity = subscriptionIdentity(reference, providerSubscriptionId);
            const subscription = identity
                ? await transaction.subscription.findFirst({
                      where: identity,
                      include: { payments: true },
                  })
                : null;
            const pendingPayment = subscription?.payments.find(
                (payment) => payment.status === "PENDING"
            );

            if (pendingPayment) {
                await transaction.payment.update({
                    where: { id: pendingPayment.id },
                    data: {
                        status: "FAILED",
                        safepayTransactionId: tracker,
                    },
                });
            }
        }

        if (
            eventType === "subscription.canceled" ||
            eventType === "subscription.ended" ||
            eventType === "subscription.resumed"
        ) {
            const identity = subscriptionIdentity(reference, providerSubscriptionId);
            const subscription = identity
                ? await transaction.subscription.findFirst({ where: identity })
                : null;

            if (subscription) {
                await transaction.subscription.update({
                    where: { id: subscription.id },
                    data:
                        eventType === "subscription.canceled"
                            ? {
                                  status: "CANCELLED",
                                  cancelledAt: new Date(),
                              }
                            : eventType === "subscription.ended"
                              ? { status: "EXPIRED" }
                              : { status: "ACTIVE", cancelledAt: null },
                });
            }
        }

        await transaction.webhookEvent.update({
            where: { id: eventRecord.id },
            data: { processed: true, processedAt: new Date() },
        });
    });
}

export async function POST(request: Request) {
    const secret = process.env.SAFEPAY_WEBHOOK_SECRET;
    if (!secret) {
        console.error("Safepay webhook secret is not configured.");
        return Response.json({ error: "Webhook is not configured." }, { status: 503 });
    }

    const rawBody = await request.text();
    if (Buffer.byteLength(rawBody, "utf8") > MAX_BODY_BYTES) {
        return Response.json({ error: "Request body is too large." }, { status: 413 });
    }

    if (
        !verifySafepayWebhookSignature(
            rawBody,
            request.headers.get("x-sfpy-signature"),
            secret
        )
    ) {
        return Response.json({ error: "Invalid webhook signature." }, { status: 401 });
    }

    let event: unknown;
    try {
        event = JSON.parse(rawBody);
    } catch {
        return Response.json({ error: "Invalid webhook payload." }, { status: 400 });
    }

    if (!isSafepayWebhookEvent(event)) {
        return Response.json({ error: "Invalid webhook payload." }, { status: 400 });
    }

    const eventId = event.token;

    try {
        const existingEvent = await prisma.webhookEvent.findUnique({
            where: { eventId },
        });
        if (existingEvent) {
            return Response.json({ received: true });
        }

        await applyEvent(event);
        return Response.json({ received: true });
    } catch (error) {
        if (
            isRecord(error) &&
            error.code === "P2002" &&
            await prisma.webhookEvent.findUnique({
                where: { eventId },
            })
        ) {
            return Response.json({ received: true });
        }

        console.error("Safepay webhook processing failed:", error);
        return Response.json({ error: "Webhook processing failed." }, { status: 500 });
    }
}
