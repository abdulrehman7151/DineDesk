
"use server";

import { requireRole } from "@/lib/authtoke";
import { getPriceTierByPriceId } from "@/lib/payments/paddle";
import { startPaddleSubscriptionCheckoutService } from "@/services/PaddleSubscriptionservices";

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
            "A subscription checkout is already in progress. Finish it, or wait a day for it to lapse, before starting another.",
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
