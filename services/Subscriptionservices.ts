
import "server-only";

import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { createSafepaySubscriptionCheckout } from "@/lib/payments/safepay";

export async function startBasicSubscriptionCheckoutService(
    restaurantId: number
) {
    const plan = await prisma.subscriptionPlan.findUnique({
        where: {
            productId: "dinedesk-basic",
        },
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

    const subscription = await prisma.subscription.create({
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

    try {
        const checkout = await createSafepaySubscriptionCheckout(
            reference,
            plan.safepayPlanId
        );

        return {
            success: true,
            checkoutUrl: checkout.checkoutUrl,
            reference,
        };
    } catch (error) {
        console.error("Safepay checkout creation failed:", error);
        await prisma.$transaction([
            prisma.subscription.update({
                where: {
                    id: subscription.id,
                },
                data: {
                    status: "CANCELLED",
                },
            }),

            prisma.payment.updateMany({
                where: {
                    subscriptionId: subscription.id,
                    status: "PENDING",
                },
                data: {
                    status: "FAILED",
                },
            }),
        ]);

        // Keep the specific SafePay reason so the admin sees what is
        // actually wrong (missing keys vs wrong keys) instead of a
        // generic message. SafePay's own error text carries no secrets.
        const detail = error instanceof Error ? error.message : "";
        const knownConfigError =
            detail.startsWith("Safepay") ||
            detail.startsWith("APP_URL") ||
            detail === "Subscription reference is required";
        throw new Error(
            knownConfigError
                ? detail
                : "Unable to start checkout. Please try again later."
        );
    }
}

