LINES: 445
import "server-only";
import { prisma } from "@/lib/prisma";
import type { Prisma, SubscriptionStatus } from "@prisma/client";
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

// SafePay subscription payloads carry period bounds as { seconds, nanos }.
function periodDate(value: unknown) {
    if (!isRecord(value)) return null;
    const seconds = integer(value.seconds);
    if (seconds === null) return null;
    const date = new Date(seconds * 1000);
    return Number.isNaN(date.getTime()) ? null : date;
}

// Map a SafePay subscription status string to our SubscriptionStatus.
// PAUSED has no matching value in our enum, so it maps to null and the
// stored status is left untouched (the event is still recorded).
function mapSubscriptionStatus(status: string | null): SubscriptionStatus | null {
    switch (status) {
        case "ACTIVE":
            return "ACTIVE";
        case "CANCELED":
            return "CANCELLED";
        case "ENDED":
            return "EXPIRED";
        case "UNPAID":
            return "PAST_DUE";
        case "INCOMPLETE":
            return "PENDING";
        default:
            return null;
    }
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
    // Subscription payloads carry the SafePay subscription id in `data.id`
    // (e.g. "sub_..."). The event `token` is the webhook delivery id, not
    // the subscription id, so it must never be used as the subscription id.
    const providerSubscriptionId =
        text(data.subscription_id) ??
        (eventType.startsWith("subscription.") ? text(data.id) : null);
    const periodStart = periodDate(data.current_period_start_date);
    const periodEnd = periodDate(data.current_period_end_date);
    const periodDates = {
        ...(periodStart ? { currentPeriodStart: periodStart } : {}),
        ...(periodEnd ? { currentPeriodEnd: periodEnd } : {}),
    };

    // Find the local subscription for this event. Prefer the reference we
    // sent at checkout (or the SafePay subscription id once known). The
    // documented SafePay payloads do not echo our reference back, so fall
    // back to matching the plan + the restaurant owner's email, which every
    // subscription payload includes as `customer_email`.
    async function resolveSubscription(tx: Prisma.TransactionClient) {
        const identity = subscriptionIdentity(reference, providerSubscriptionId);
        if (identity) {
            const found = await tx.subscription.findFirst({
                where: identity,
                include: { plan: true, payments: true },
            });
            if (found) return found;
        }

        const planId = text(data.plan_id);
        const email = text(data.customer_email);
        if (!planId || !email) return null;

        return tx.subscription.findFirst({
            where: {
                status: { in: ["PENDING", "ACTIVE", "PAST_DUE"] },
                plan: { safepayPlanId: planId },
                restaurant: { owner: { email } },
            },
            orderBy: { createdAt: "desc" },
            include: { plan: true, payments: true },
        });
    }

    await prisma.$transaction(async (transaction) => {
        const safeData: Record<string, string | number> = {};
        for (const key of [
            "reference",
            "tracker",
            "amount",
            "currency",
            "state",
            "status",
            "subscription_id",
            "plan_id",
            "customer_email",
            "transaction_id",
            "id",
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

        if (eventType === "subscription.created") {
            const linkData = {
                ...(providerSubscriptionId
                    ? { safepaySubscriptionId: providerSubscriptionId }
                    : {}),
                ...periodDates,
            };
            let linked = false;
            if (reference && Object.keys(linkData).length > 0) {
                const result = await transaction.subscription.updateMany({
                    where: { reference },
                    data: linkData,
                });
                linked = result.count > 0;
            }
            if (!linked && Object.keys(linkData).length > 0) {
                const subscription = await resolveSubscription(transaction);
                if (subscription) {
                    await transaction.subscription.update({
                        where: { id: subscription.id },
                        data: linkData,
                    });
                }
            }
        }

        if (eventType === "subscription.updated") {
            const subscription = await resolveSubscription(transaction);
            if (subscription) {
                const mapped = mapSubscriptionStatus(text(data.status));
                const updateData = {
                    ...(providerSubscriptionId
                        ? { safepaySubscriptionId: providerSubscriptionId }
                        : {}),
                    ...(mapped ? { status: mapped } : {}),
                    ...periodDates,
                };
                if (Object.keys(updateData).length > 0) {
                    await transaction.subscription.update({
                        where: { id: subscription.id },
                        data: updateData,
                    });
                }
            }
        }

        // Subscription renewal payments carry a transaction_id (txn_...),
        // not a tracker. One-off checkout payments carry a tracker.
        const transactionId =
            eventType === "subscription.payment.succeeded"
                ? text(data.transaction_id)
                : tracker;

        if (
            (eventType === "payment.succeeded" ||
                eventType === "subscription.payment.succeeded") &&
            transactionId &&
            (eventType === "subscription.payment.succeeded" ||
                data.state === undefined ||
                data.state === "TRACKER_ENDED")
        ) {
            const subscription = await resolveSubscription(transaction);
            const amount = integer(data.amount);
            const currency = text(data.currency)?.toUpperCase();

            if (
                subscription &&
                amount === subscription.plan.price &&
                currency === subscription.plan.currency.toUpperCase() &&
                ["PENDING", "ACTIVE", "PAST_DUE"].includes(subscription.status)
            ) {
                const recordedPayment = await transaction.payment.findUnique({
                    where: { safepayTransactionId: transactionId },
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
                                safepayTransactionId: transactionId,
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
                                safepayTransactionId: transactionId,
                                paidAt: new Date(),
                            },
                        });
                    }

                    await transaction.subscription.update({
                        where: { id: subscription.id },
                        data: {
                            status: "ACTIVE",
                            ...(providerSubscriptionId
                                ? { safepaySubscriptionId: providerSubscriptionId }
                                : {}),
                            ...periodDates,
                        },
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
            const subscription = await resolveSubscription(transaction);
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

        // A failed or unpaid billing cycle: the subscription stays on file
        // but is marked past due so the admin can see it and resubscribe.
        // subscription.payment.failed carries a transaction_id (txn_...),
        // not a tracker.
        if (
            eventType === "subscription.unpaid" ||
            eventType === "subscription.payment.failed"
        ) {
            const subscription = await resolveSubscription(transaction);
            if (subscription) {
                await transaction.subscription.update({
                    where: { id: subscription.id },
                    data: { status: "PAST_DUE", ...periodDates },
                });

                const pendingPayment = subscription.payments.find(
                    (payment) => payment.status === "PENDING"
                );
                if (pendingPayment) {
                    const failedTransactionId =
                        text(data.transaction_id) ?? tracker;
                    await transaction.payment.update({
                        where: { id: pendingPayment.id },
                        data: {
                            status: "FAILED",
                            ...(failedTransactionId
                                ? { safepayTransactionId: failedTransactionId }
                                : {}),
                        },
                    });
                }
            }
        }

        if (
            eventType === "subscription.canceled" ||
            eventType === "subscription.ended" ||
            eventType === "subscription.resumed"
        ) {
            const subscription = await resolveSubscription(transaction);

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
                              : {
                                    status: "ACTIVE",
                                    cancelledAt: null,
                                    ...periodDates,
                                },
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
    // A dedicated webhook secret is preferred. When it is not set, fall back
    // to the merchant secret key (SafePay signs webhooks with it by default).
    const secret =
        process.env.SAFEPAY_WEBHOOK_SECRET || process.env.SAFEPAY_SECRET_KEY;
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

