import "server-only";

import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";

// Creates the local PENDING subscription (and its PENDING payment) for a
// Paddle checkout. Unlike the SafePay service, this does not call out to
// Paddle: the browser opens the Paddle.js overlay checkout directly with
// the catalog price id, and the reference created here is passed as custom
// data so the Paddle webhook can link the payment back to this row.
export async function startPaddleSubscriptionCheckoutService(
    restaurantId: number,
    customerEmail: string
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

    const pendingSubscription = await prisma.subscription.findFirst({
        where: {
            restaurantId,
            status: "PENDING",
        },
    });

    if (pendingSubscription) {
        throw new Error(
            "A subscription checkout is already in progress. Finish or cancel it before starting another."
        );
    }

    const reference = `dinedesk_${randomUUID()}`;

    await prisma.subscription.create({
        data: {
            restaurantId,
            planId: plan.id,
            reference,
            status: "PENDING",
            payments: {
                create: {
                    amount: plan.price,
                    currency: plan.currency,
                    status: "PENDING",
                },
            },
        },
    });

    return { success: true, reference, customerEmail };
}
