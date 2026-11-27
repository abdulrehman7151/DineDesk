import "server-only";

import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { pendingCheckoutCutoff } from "@/lib/orderLifecycle";
import type { PriceTier } from "@/lib/payments/paddle";

// Creates the local PENDING subscription (and its PENDING payment) for a
// Paddle checkout. This does not call out to Paddle: the browser opens
// the Paddle.js overlay checkout directly with the catalog price id, and
// the reference created here is passed as custom data so the Paddle
// webhook can link the payment back to this row.
export async function startPaddleSubscriptionCheckoutService(
    restaurantId: number,
    customerEmail: string,
    tier: PriceTier
) {
    const plan = await prisma.subscriptionPlan.findUnique({
        where: { productId: "dinedesk-basic" },
    });

    if (!plan || !plan.isActive) {
        throw new Error("Basic subscription plan is unavailable.");
    }

    const activeSubscription = await prisma.subscription.findFirst({
        where: {
            restaurantId,
            status: "ACTIVE",
        },
    });

    if (activeSubscription) {
        throw new Error(
            "Your restaurant already has an active subscription."
        );
    }

    // Only a checkout started in the last day blocks a new one. A PENDING
    // row older than that was abandoned (the customer closed the payment
    // page) and must not stop the restaurant from subscribing.
    const pendingSubscription = await prisma.subscription.findFirst({
        where: {
            restaurantId,
            status: "PENDING",
            createdAt: { gte: pendingCheckoutCutoff() },
        },
    });

    if (pendingSubscription) {
        throw new Error(
            "A subscription checkout is already in progress. Finish it, or wait a day for it to lapse, before starting another."
        );
    }

    const reference = `dinedesk_${randomUUID()}`;

    // The pending payment records the tier being bought (USD amount), not
    // the plan row's old PKR price. The webhook overwrites it with the
    // real charged total when the payment completes.
    await prisma.subscription.create({
        data: {
            restaurantId,
            planId: plan.id,
            reference,
            status: "PENDING",
            payments: {
                create: {
                    amount: tier.amountMinor,
                    currency: tier.currency,
                    status: "PENDING",
                },
            },
        },
    });

    return { success: true, reference, customerEmail };
}
