import "server-only";

import { prisma } from "@/lib/prisma";
import type { Prisma, SubscriptionStatus } from "@prisma/client";
import { verifyPaddleWebhookSignature } from "@/lib/payments/paddle-webhook";
import { getPriceTierByPriceId } from "@/lib/payments/paddle";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 64 * 1024;

type JsonRecord = Record<string, unknown>;

type PaddleWebhookEvent = {
    event_id: string;
    event_type: string;
    data: JsonRecord;
};

function isRecord(value: unknown): value is JsonRecord {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isPaddleWebhookEvent(value: unknown): value is PaddleWebhookEvent {
    return (
        isRecord(value) &&
        typeof value.event_id === "string" &&
        value.event_id.length > 0 &&
        value.event_id.length <= 191 &&
        typeof value.event_type === "string" &&
        value.event_type.length > 0 &&
        value.event_type.length <= 191 &&
        isRecord(value.data)
    );
}

function text(value: unknown) {
    return typeof value === "string" && value.length > 0 && value.length <= 191
        ? value
        : null;
}

function integer(value: unknown) {
    if (typeof value === "number" && Number.isSafeInteger(value)) {
        return value;
    }
    // Paddle reports money as strings in minor units (e.g. "500" for $5.00).
    if (typeof value === "string" && /^-?\d+$/.test(value)) {
        const parsed = Number(value);
        return Number.isSafeInteger(parsed) ? parsed : null;
    }
    return null;
}

// Paddle dates are RFC 3339 strings, e.g. "2024-10-12T07:20:50.52Z".
function isoDate(value: unknown) {
    if (typeof value !== "string") return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}

// The billing period Paddle sends on subscriptions
// (`current_billing_period`) and transactions (`billing_period`).
function periodDates(data: JsonRecord) {
    const period = isRecord(data.current_billing_period)
        ? data.current_billing_period
        : isRecord(data.billing_period)
          ? data.billing_period
          : null;
    if (!period) return {};
    const start = isoDate(period.starts_at);
    const end = isoDate(period.ends_at);
    return {
        ...(start ? { currentPeriodStart: start } : {}),
        ...(end ? { currentPeriodEnd: end } : {}),
    };
}

// Paddle's subscription status strings. PAUSED has no matching value in our
// enum, so it maps to null and the stored status is left untouched (the
// event is still recorded).
function mapSubscriptionStatus(status: string | null): SubscriptionStatus | null {
    switch (status) {
        case "active":
            return "ACTIVE";
        case "canceled":
            return "CANCELLED";
        case "past_due":
            return "PAST_DUE";
        case "trialing":
            return "PENDING";
        default:
            return null;
    }
}

// Our own reference, sent as custom data when the checkout was opened.
// Paddle copies custom data onto the subscription and every renewal
// transaction, so this links events back to the local subscription row.
function customReference(data: JsonRecord) {
    if (!isRecord(data.custom_data)) return null;
    return text(data.custom_data.reference);
}

async function applyEvent(event: PaddleWebhookEvent) {
    const data = event.data;
    const eventType = event.event_type;
    const reference = customReference(data);
    // Subscription events carry the Paddle subscription id in `data.id`;
    // transaction events carry it in `data.subscription_id`.
    const providerSubscriptionId =
        eventType.startsWith("subscription.")
            ? text(data.id)
            : text(data.subscription_id);
    const period = periodDates(data);

    // Find the local subscription for this event. Prefer the reference we
    // sent at checkout, or the Paddle subscription id once known.
    async function resolveSubscription(tx: Prisma.TransactionClient) {
        const OR = [
            ...(reference ? [{ reference }] : []),
            ...(providerSubscriptionId
                ? [{ paddleSubscriptionId: providerSubscriptionId }]
                : []),
        ];
        if (!OR.length) return null;
        return tx.subscription.findFirst({
            where: { OR },
            include: { plan: true, payments: true },
        });
    }

    await prisma.$transaction(async (transaction) => {
        // Store only a small safe subset of the payload, never card data.
        const safeData: Record<string, string | number> = {};
        for (const key of [
            "id",
            "status",
            "customer_id",
            "subscription_id",
            "transaction_id",
            "currency_code",
            "origin",
        ]) {
            const value = data[key];
            if (
                typeof value === "string" ||
                (typeof value === "number" && Number.isFinite(value))
            ) {
                safeData[key] = value;
            }
        }
        if (reference) safeData.reference = reference;
        const totals = isRecord(data.details)
            ? isRecord(data.details.totals)
                ? data.details.totals
                : null
            : null;
        if (totals) {
            const total = integer(totals.total);
            if (total !== null) safeData.amount = total;
        }

        const eventRecord = await transaction.webhookEvent.create({
            data: {
                eventId: event.event_id,
                eventType,
                payload: {
                    event_id: event.event_id,
                    event_type: eventType,
                    data: safeData,
                },
            },
        });

        if (eventType === "subscription.created") {
            const linkData = {
                ...(providerSubscriptionId
                    ? { paddleSubscriptionId: providerSubscriptionId }
                    : {}),
                ...period,
            };
            if (Object.keys(linkData).length > 0) {
                let linked = false;
                if (reference) {
                    const result = await transaction.subscription.updateMany({
                        where: { reference },
                        data: linkData,
                    });
                    linked = result.count > 0;
                }
                if (!linked) {
                    const subscription =
                        await resolveSubscription(transaction);
                    if (subscription) {
                        await transaction.subscription.update({
                            where: { id: subscription.id },
                            data: linkData,
                        });
                    }
                }
            }
        }

        if (eventType === "subscription.activated") {
            const subscription = await resolveSubscription(transaction);
            if (subscription) {
                await transaction.subscription.update({
                    where: { id: subscription.id },
                    data: {
                        status: "ACTIVE",
                        cancelledAt: null,
                        ...(providerSubscriptionId
                            ? {
                                  paddleSubscriptionId:
                                      providerSubscriptionId,
                              }
                            : {}),
                        ...period,
                    },
                });
                // Paddle only activates a subscription once its payment
                // has gone through. If the matching transaction.completed
                // event was missed, the pending payment would otherwise
                // stay PENDING forever even though the subscription is
                // ACTIVE. Mark it paid (the amount stays the tier price;
                // transaction.completed overwrites it with the real
                // charged total when it runs).
                const pendingPayment = subscription.payments.find(
                    (payment) => payment.status === "PENDING"
                );
                if (pendingPayment) {
                    await transaction.payment.update({
                        where: { id: pendingPayment.id },
                        data: { status: "SUCCEEDED", paidAt: new Date() },
                    });
                }
            }
        }

        if (eventType === "subscription.resumed") {
            const subscription = await resolveSubscription(transaction);
            if (subscription) {
                await transaction.subscription.update({
                    where: { id: subscription.id },
                    data: {
                        status: "ACTIVE",
                        cancelledAt: null,
                        ...(providerSubscriptionId
                            ? {
                                  paddleSubscriptionId:
                                      providerSubscriptionId,
                              }
                            : {}),
                        ...period,
                    },
                });
            }
        }

        if (eventType === "subscription.updated") {
            const subscription = await resolveSubscription(transaction);
            if (subscription) {
                const mapped = mapSubscriptionStatus(text(data.status));
                const updateData = {
                    ...(providerSubscriptionId
                        ? { paddleSubscriptionId: providerSubscriptionId }
                        : {}),
                    ...(mapped ? { status: mapped } : {}),
                    ...period,
                };
                if (Object.keys(updateData).length > 0) {
                    await transaction.subscription.update({
                        where: { id: subscription.id },
                        data: updateData,
                    });
                }
            }
        }

        if (eventType === "subscription.canceled") {
            const subscription = await resolveSubscription(transaction);
            if (subscription) {
                await transaction.subscription.update({
                    where: { id: subscription.id },
                    data: { status: "CANCELLED", cancelledAt: new Date() },
                });
            }
        }

        if (eventType === "subscription.past_due") {
            const subscription = await resolveSubscription(transaction);
            if (subscription) {
                await transaction.subscription.update({
                    where: { id: subscription.id },
                    data: { status: "PAST_DUE", ...period },
                });
            }
        }

        if (eventType === "transaction.completed") {
            const transactionId = text(data.id);
            const currency = text(data.currency_code)?.toUpperCase();
            const total = totals ? integer(totals.total) : null;

            // The transaction must be for one of our prices, in USD, and at
            // least the list price of that tier (tax can push the charged
            // total above it). Paddle always sends the items for a
            // subscription checkout; if it ever sends none, fall back to
            // the cheapest tier's amount as the floor.
            const items = Array.isArray(data.items) ? data.items : [];
            // Paddle sends the price id nested as `price.id` on each
            // item (e.g. { price: { id: "pri_..." }, quantity: 1 });
            // accept a top-level `price_id` too for older payloads.
            // Reading only `price_id` matched nothing, so no payment
            // ever activated a subscription.
            const matchedTier =
                items
                    .map((item) => {
                        if (!isRecord(item)) return null;
                        const priceId =
                            typeof item.price_id === "string"
                                ? item.price_id
                                : isRecord(item.price) &&
                                    typeof item.price.id === "string"
                                  ? item.price.id
                                  : null;
                        return priceId
                            ? getPriceTierByPriceId(priceId)
                            : null;
                    })
                    .find((tier) => tier !== null) ?? null;
            const priceMatches = items.length === 0 || matchedTier !== null;
            const minimumAmount = matchedTier ? matchedTier.amountMinor : 900;

            if (
                transactionId &&
                currency === "USD" &&
                total !== null &&
                total >= minimumAmount &&
                priceMatches
            ) {
                const subscription = await resolveSubscription(transaction);
                if (
                    subscription &&
                    ["PENDING", "ACTIVE", "PAST_DUE"].includes(
                        subscription.status
                    )
                ) {
                    const recordedPayment =
                        await transaction.payment.findUnique({
                            where: { paddleTransactionId: transactionId },
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
                                    amount: total,
                                    currency,
                                    status: "SUCCEEDED",
                                    paddleTransactionId: transactionId,
                                    paidAt: new Date(),
                                },
                            });
                        } else if (data.origin === "subscription_recurring") {
                            await transaction.payment.create({
                                data: {
                                    subscriptionId: subscription.id,
                                    amount: total,
                                    currency,
                                    status: "SUCCEEDED",
                                    paddleTransactionId: transactionId,
                                    paidAt: new Date(),
                                },
                            });
                        }

                        await transaction.subscription.update({
                            where: { id: subscription.id },
                            data: {
                                status: "ACTIVE",
                                ...(providerSubscriptionId
                                    ? {
                                          paddleSubscriptionId:
                                              providerSubscriptionId,
                                      }
                                    : {}),
                                ...period,
                            },
                        });
                    }
                }
            } else if (transactionId) {
                console.error(
                    "Paddle payment did not match the expected price.",
                    {
                        eventId: event.event_id,
                        receivedAmount: total,
                        receivedCurrency: currency,
                        priceMatches,
                        matchedPriceId: matchedTier?.paddlePriceId ?? null,
                    }
                );
            }
        }

        // A failed renewal payment: the subscription stays on file but is
        // marked past due so the admin can see it and resubscribe.
        if (
            (eventType === "transaction.payment_failed" ||
                eventType === "transaction.past_due") &&
            data.origin === "subscription_recurring"
        ) {
            const subscription = await resolveSubscription(transaction);
            if (subscription) {
                await transaction.subscription.update({
                    where: { id: subscription.id },
                    data: { status: "PAST_DUE", ...period },
                });
                const pendingPayment = subscription.payments.find(
                    (payment) => payment.status === "PENDING"
                );
                if (pendingPayment) {
                    await transaction.payment.update({
                        where: { id: pendingPayment.id },
                        data: { status: "FAILED" },
                    });
                }
            }
        }

        await transaction.webhookEvent.update({
            where: { id: eventRecord.id },
            data: { processed: true, processedAt: new Date() },
        });
    });
}

export async function POST(request: Request) {
    // No fallback: the Paddle webhook secret belongs to this notification
    // destination only. Create it in Paddle (Developer Tools >
    // Notifications) after registering the endpoint, and set it as
    // PADDLE_WEBHOOK_SECRET in Vercel.
    const secret = process.env.PADDLE_WEBHOOK_SECRET;
    if (!secret) {
        console.error("Paddle webhook secret is not configured.");
        return Response.json(
            { error: "Webhook is not configured." },
            { status: 503 }
        );
    }

    const rawBody = await request.text();
    if (Buffer.byteLength(rawBody, "utf8") > MAX_BODY_BYTES) {
        return Response.json(
            { error: "Request body is too large." },
            { status: 413 }
        );
    }

    if (
        !verifyPaddleWebhookSignature(
            rawBody,
            request.headers.get("paddle-signature"),
            secret
        )
    ) {
        return Response.json(
            { error: "Invalid webhook signature." },
            { status: 401 }
        );
    }

    let event: unknown;
    try {
        event = JSON.parse(rawBody);
    } catch {
        return Response.json(
            { error: "Invalid webhook payload." },
            { status: 400 }
        );
    }

    if (!isPaddleWebhookEvent(event)) {
        return Response.json(
            { error: "Invalid webhook payload." },
            { status: 400 }
        );
    }

    const eventId = event.event_id;

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
            (await prisma.webhookEvent.findUnique({
                where: { eventId },
            }))
        ) {
            return Response.json({ received: true });
        }

        console.error("Paddle webhook processing failed:", error);
        return Response.json(
            { error: "Webhook processing failed." },
            { status: 500 }
        );
    }
}
