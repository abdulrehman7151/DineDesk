"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { submitTableOrder, type CartLine } from "@/services/TableOrderServices";

type SubmitResult =
    | {
          success: true;
          orderId: number;
          total: number;
          mode: "created" | "added";
          status: string;
      }
    | { success: false; message: string };

export const SubmitTableOrderAction = async (
    cart: CartLine[],
    restaurantSlug: string,
    tableId: string
): Promise<SubmitResult> => {
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
            select: { id: true, number: true },
        });

        if (!table) {
            return {
                success: false,
                message: "This table QR code is no longer valid.",
            };
        }

        const result = await submitTableOrder(
            cart,
            restaurant.id,
            table.id,
            table.number
        );

        revalidatePath("/admin/orders");
        revalidatePath("/admin/kitchen");
        revalidatePath("/kitchen");

        return {
            success: true,
            orderId: result.order.id,
            total: result.order.total,
            mode: result.mode,
            status: result.order.status,
        };
    } catch (error) {
        console.error("SubmitTableOrderAction failed:", error);

        return {
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to place order. Please try again.",
        };
    }
};