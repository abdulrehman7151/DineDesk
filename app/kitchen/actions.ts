"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getActiveStaff } from "@/lib/staffAuth";
import {
    REQUIRED_CURRENT,
    canSetStatus,
    isUpdatableStatus,
} from "@/lib/orderPermissions";

type UpdateResult =
    | { success: true }
    | { success: false; message: string; code?: "UNAUTHORIZED" };

export async function updateOrderStatus(
    orderId: number,
    newStatus: string
): Promise<UpdateResult> {
    const staff = await getActiveStaff();
    if (!staff) {
        return {
            success: false,
            message: "Your session has expired. Please sign in again.",
            code: "UNAUTHORIZED",
        };
    }

    if (!isUpdatableStatus(newStatus)) {
        return { success: false, message: "Invalid status." };
    }

    if (!Number.isInteger(orderId) || orderId <= 0) {
        return { success: false, message: "Invalid order." };
    }

    if (!canSetStatus(staff.role, newStatus)) {
        return {
            success: false,
            message: "Your role is not allowed to make this change.",
        };
    }

    // Only move forward one step, and only if the order is still in the
    // expected status (protects against two people clicking at once).
    const result = await prisma.order.updateMany({
        where: {
            id: orderId,
            restaurantId: staff.restaurantId,
            status: REQUIRED_CURRENT[newStatus],
        },
        data: { status: newStatus },
    });

    if (result.count === 0) {
        return {
            success: false,
            message: "This order was already updated by someone else.",
        };
    }

    revalidatePath("/kitchen");
    revalidatePath("/admin/kitchen");
    revalidatePath("/admin/orders");

    return { success: true };
}