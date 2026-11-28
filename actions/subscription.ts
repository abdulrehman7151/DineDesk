
"use server";

import { requireRole } from "@/lib/authtoke";
import { getPriceTierByPriceId } from "@/lib/payments/paddle";
import {
    cancelPendingSubscriptionCheckoutService,
    startPaddleSubscriptionCheckoutService,
} from "@/services/PaddleSubscriptionservices";

export async function startPaddleSubscriptionCheckout(priceId: string) {
    try {
        const user = await requireRole(["admin"]);

        if (!user) {
            return {
                success: false,
                message: "Unauthorized. Admin access required.",
            };
        }

        // Never trust the price id from the browser: only the prices
        // we sell can start a checkout.
        const tier = getPriceTierByPriceId(priceId);
        if (!tier) {
            return {
                success: false,
                message: "That subscription price is not available.",
            };
        }

        const result = await startPaddleSubscriptionCheckoutService(
            user.restaurantId,
            user.email,
            tier
        );

        return result;
    } catch (error) {
        console.error("Paddle subscription action error:", error);
        const safeMessages = new Set([
            "Basic subscription plan is unavailable.",
            "Your restaurant already has an active subscription.",
            "A subscription checkout is already in progress. Cancel it on the subscription page and try again — no payment has been taken.",
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

// Cancel a checkout that was started but never paid for, so the
// restaurant can subscribe again immediately instead of being blocked
// for a day. Only PENDING checkouts are cancelled; active or paid
// subscriptions are never touched.
export async function cancelPendingSubscriptionCheckout() {
    try {
        const user = await requireRole(["admin"]);

        if (!user) {
            return {
                success: false,
                message: "Unauthorized. Admin access required.",
            };
        }

        return await cancelPendingSubscriptionCheckoutService(
            user.restaurantId
        );
    } catch (error) {
        console.error("Paddle cancel pending checkout action error:", error);
        return {
            success: false,
            message: "Unable to cancel the pending checkout. Please try again.",
        };
    }
}
