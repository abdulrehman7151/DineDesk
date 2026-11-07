"use server";

import { revalidatePath } from "next/cache";
import { PlacingOrderServices } from "@/services/OrderServices";

type CartLine = {
    itemId: number;
    sizeId: number | null;
    quantity: number;
    note?: string;
};

type PlaceOrderResult =
    | { success: true; orderId: number; total: number }
    | { success: false; message: string };

export const PlacingOrderAction = async (
    cart: CartLine[],
    restaurantId: number,
    tableNumber: number
): Promise<PlaceOrderResult> => {
    // =========================
    // Basic guardrails
    // =========================
    if (!Array.isArray(cart) || cart.length === 0) {
        return { success: false, message: "Your order is empty." };
    }

    if (!Number.isInteger(restaurantId) || restaurantId <= 0) {
        return { success: false, message: "Invalid restaurant." };
    }

    if (!Number.isInteger(tableNumber) || tableNumber <= 0) {
        return { success: false, message: "Invalid table number." };
    }

    // =========================
    // Place order
    // =========================
    try {
        const order = await PlacingOrderServices(
            cart,
            restaurantId,
            tableNumber
        );

        // Refresh admin/kitchen views so the new order shows up immediately
        revalidatePath("/admin/orders");
        revalidatePath("/admin/kitchen");
        revalidatePath("/kitchen");

        return {
            success: true,
            orderId: order.id,
            total: order.total,
        };
    } catch (error) {
        console.error("PlacingOrderAction failed:", error);

        return {
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to place order. Please try again.",
        };
    }
};