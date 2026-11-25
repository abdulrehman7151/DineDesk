
"use server";

import { requireRole } from "@/lib/authtoke";
import { prisma } from "@/lib/prisma";
import { startBasicSubscriptionCheckoutService } from "@/services/Subscriptionservices";

export async function startBasicSubscriptionCheckout() {
    try {
        const user = await requireRole(["admin"]);

        if (!user) {
            return {
                success: false,
                message: "Unauthorized. Admin access required.",
            };
        }

        const result = await startBasicSubscriptionCheckoutService(user.restaurantId);

        return result;
    } catch (error) {
        console.error("Subscription action error:", error);
        const safeMessages = new Set([
            "Basic subscription plan is unavailable.",
            "Your restaurant already has an active subscription.",
            "A subscription checkout is already in progress. Finish or cancel it before starting another.",
        ]);

        return {
            success: false,
            message:
                error instanceof Error && safeMessages.has(error.message)
                    ? error.message
                    : "Unable to start checkout. Please try again.",
        };
    }
}

export async function cancelPendingSubscriptionCheckout() {
    try {
        const user = await requireRole(["admin"]);
        if (!user) {
            return {
                success: false,
                message: "Unauthorized. Admin access required.",
            };
        }

        const pendingSubscription = await prisma.subscription.findFirst({
            where: {
                restaurantId: user.restaurantId,
                status: "PENDING",
            },
            orderBy: { createdAt: "desc" },
            select: { id: true },
        });

        if (!pendingSubscription) {
            return {
                success: false,
                message: "No unfinished checkout was found.",
            };
        }

        const cancelled = await prisma.$transaction(async (transaction) => {
            const result = await transaction.subscription.updateMany({
                where: {
                    id: pendingSubscription.id,
                    status: "PENDING",
                },
                data: {
                    status: "CANCELLED",
                    cancelledAt: new Date(),
                },
            });

            if (result.count === 0) {
                return false;
            }

            await transaction.payment.updateMany({
                where: {
                    subscriptionId: pendingSubscription.id,
                    status: "PENDING",
                },
                data: { status: "FAILED" },
            });

            return true;
        });

        return cancelled
            ? { success: true }
            : {
                  success: false,
                  message: "The subscription status changed. Refresh and try again.",
              };
    } catch (error) {
        console.error("Subscription checkout cancellation failed:", error);
        return {
            success: false,
            message: "Unable to cancel checkout. Please try again.",
        };
    }
}
