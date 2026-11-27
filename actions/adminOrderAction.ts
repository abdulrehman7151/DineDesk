"use server";

import { revalidatePath } from "next/cache";
import { getUserFromToken } from "@/lib/authtoke";
import { prisma } from "@/lib/prisma";
import { completeOrder } from "@/lib/orderLifecycle";
import { submitTableOrder, type CartLine } from "@/services/TableOrderServices";

type SubmitResult =
    | {
          success: true;
          orderId: number;
          total: number;
          mode: "created" | "added";
      }
    | { success: false; message: string };

/**
 * Places an order from the admin dashboard (e.g. a walk-in or phone order).
 * If the table already has an unserved order, the items are added to it —
 * the same behaviour as a guest ordering from the table's QR code.
 */
export async function submitAdminOrderAction(
    tableId: number,
    cart: CartLine[]
): Promise<SubmitResult> {
    const user = await getUserFromToken();

    if (!user || user.role !== "admin") {
        return { success: false, message: "Please sign in again." };
    }

    if (!Number.isInteger(tableId) || tableId <= 0) {
        return { success: false, message: "Choose a table." };
    }

    if (!Array.isArray(cart) || cart.length === 0) {
        return { success: false, message: "Add at least one item." };
    }

    try {
        const table = await prisma.table.findFirst({
            where: {
                id: tableId,
                restaurantId: user.restaurantId,
            },
            select: { id: true, number: true },
        });

        if (!table) {
            return { success: false, message: "That table does not exist." };
        }

        const result = await submitTableOrder(
            cart,
            user.restaurantId,
            table.id,
            table.number
        );

        revalidatePath("/admin/orders");
        revalidatePath("/admin/kitchen");
        revalidatePath("/admin/tables");
        revalidatePath("/kitchen");
        revalidatePath("/admin");

        return {
            success: true,
            orderId: result.order.id,
            total: result.order.total,
            mode: result.mode,
        };
    } catch (error) {
        console.error("submitAdminOrderAction failed:", error);

        return {
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to place the order. Please try again.",
        };
    }
}

/**
 * Close an active order by hand from the admin orders list: the bill is
 * done and the table frees at once.
 */
export async function completeAdminOrderAction(
    orderId: number
): Promise<{ success: boolean; message?: string }> {
    const user = await getUserFromToken();

    if (!user || user.role !== "admin") {
        return { success: false, message: "Please sign in again." };
    }

    if (!Number.isInteger(orderId) || orderId <= 0) {
        return { success: false, message: "Invalid order." };
    }

    const done = await completeOrder(user.restaurantId, orderId);

    if (!done) {
        return { success: false, message: "That order was already closed." };
    }

    revalidatePath("/admin/orders");
    revalidatePath("/admin/kitchen");
    revalidatePath("/admin/tables");
    revalidatePath("/kitchen");
    revalidatePath("/admin");

    return { success: true };
}
