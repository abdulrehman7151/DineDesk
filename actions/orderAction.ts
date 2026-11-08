"use server";

import { revalidatePath } from "next/cache";
import { PlacingOrderServices } from "@/services/OrderServices";
import { prisma } from "@/lib/prisma";

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
    restaurantSlug: string,
    tableId: string
): Promise<PlaceOrderResult> => {
    // =========================
    // Basic guardrails
    // =========================
    if (!Array.isArray(cart) || cart.length === 0) {
        return { success: false, message: "Your order is empty." };
    }

    if (typeof restaurantSlug !== "string" || restaurantSlug.length === 0) {
        return { success: false, message: "Invalid restaurant." };
    }

    if (typeof tableId !== "string" || !/^[a-f0-9]{32}$/i.test(tableId)) {
        return {
            success: false,
            message: "Scan the QR code at your table to place an order.",
        };
    }

    // =========================
    // Place order
    // =========================
    try {
        const restaurant = await prisma.restaurant.findUnique({
            where: { slug: restaurantSlug },
            select: { id: true },
        });

        if (!restaurant) {
            return { success: false, message: "Invalid restaurant." };
        }

        const table = await prisma.table.findFirst({
            where: {
                qrToken: tableId.toLowerCase(),
                restaurantId: restaurant.id,
            },
            select: {
                id: true,
                number: true,
            },
        });

        if (!table) {
            return {
                success: false,
                message: "This table QR code is no longer valid.",
            };
        }

        const order = await PlacingOrderServices(
            cart,
            restaurant.id,
            table.id,
            table.number
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