"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getActiveStaff } from "@/lib/staffAuth";
import { completeOrder, expireStaleOrders, freeTableIfIdle } from "@/lib/orderLifecycle";
import {
    REQUIRED_CURRENT,
    canSetStatus,
    isUpdatableStatus,
} from "@/lib/orderPermissions";

type UpdateResult =
    | { success: true }
    | { success: false; message: string; code?: "UNAUTHORIZED" };

const UNAUTHORIZED: UpdateResult = {
    success: false,
    message: "Your session has expired. Please sign in again.",
    code: "UNAUTHORIZED",
};

export async function updateOrderStatus(
    orderId: number,
    newStatus: string
): Promise<UpdateResult> {
    const staff = await getActiveStaff();
    if (!staff) return UNAUTHORIZED;

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
        data: {
            status: newStatus,
            // Serving starts the auto-close timer: if no new items come
            // in for the restaurant's auto-close minutes, the order
            // closes itself and frees the table.
            ...(newStatus === "SERVED" ? { servedAt: new Date() } : {}),
            // Once the order is ready/served, the "items added" alert is done
            ...(newStatus !== "PREPARING" ? { hasNewAdditions: false } : {}),
        },
    });

    if (result.count === 0) {
        return {
            success: false,
            message: "This order was already updated by someone else.",
        };
    }

    // The "ADDED" badges belong to the alert above: once the order moves
    // forward, the added items have been seen by the kitchen.
    if (newStatus !== "PREPARING") {
        await prisma.orderItem.updateMany({
            where: { orderId },
            data: { isAddition: false },
        });
    }

    // NOTE: a SERVED order does not free its table — the tab stays open
    // until the order is completed (by hand, or by the auto-close timer),
    // so guests can still add items to it.

    // A terminal status frees the table, but only when no other active
    // order is still running on it. The kitchen can only move orders to
    // PREPARING / READY / SERVED, so this never fires today; it is here
    // so the release rule holds at the status-change layer no matter how
    // a terminal status is ever reached.
    // NOTE: newStatus was narrowed to UpdatableOrderStatus
    // ("PREPARING" | "READY" | "SERVED") by isUpdatableStatus above, so a
    // direct === against a terminal status is a type error (TS2367 — the
    // two types have no overlap). Compare through a plain string array
    // instead, which keeps the safety net without the type error.
    const TERMINAL_STATUSES: string[] = ["COMPLETED", "EXPIRED", "CANCELLED"];
    if (TERMINAL_STATUSES.includes(newStatus)) {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            select: { tableId: true },
        });
        if (order?.tableId) {
            await freeTableIfIdle(order.tableId);
        }
    }

    revalidatePath("/kitchen");
    revalidatePath("/admin/kitchen");
    revalidatePath("/admin/orders");
    revalidatePath("/admin/tables");
    revalidatePath("/admin");

    return { success: true };
}

export type KitchenOrderDTO = {
    id: number;
    tableNumber: number | null;
    status: "PENDING" | "PREPARING" | "READY";
    createdAt: string;
    hasNewAdditions: boolean;
    orderItems: {
        id: number;
        productName: string;
        quantity: number;
        notes?: string;
        isAddition: boolean;
    }[];
};

/**
 * Fresh kitchen orders for the current staff's restaurant, in the same
 * shape the kitchen page passes in as initialOrders. The kitchen display
 * calls this after every status change and every few seconds, so the list
 * updates without a page reload — it does not rely on router.refresh(),
 * which was not picking up the new list.
 */
export async function getKitchenOrders(): Promise<
    | { success: true; orders: KitchenOrderDTO[] }
    | { success: false; message: string; code?: "UNAUTHORIZED" }
> {
    const staff = await getActiveStaff();
    if (!staff) return UNAUTHORIZED;

    // Close anything stale first, same as the kitchen page.
    await expireStaleOrders(staff.restaurantId);

    // Only active orders (not SERVED, not CANCELLED)
    const orders = await prisma.order.findMany({
        where: {
            restaurantId: staff.restaurantId,
            status: { in: ["PENDING", "PREPARING", "READY"] },
        },
        include: { orderItems: true },
        orderBy: { createdAt: "asc" },
    });

    return {
        success: true,
        orders: orders.map((o) => ({
            id: o.id,
            tableNumber: o.tableNumber,
            status: o.status as "PENDING" | "PREPARING" | "READY",
            createdAt: o.createdAt.toISOString(),
            hasNewAdditions: o.hasNewAdditions,
            orderItems: o.orderItems.map((i) => ({
                id: i.id,
                productName: i.productName,
                quantity: i.quantity,
                notes: i.notes ?? undefined,
                isAddition: i.isAddition,
            })),
        })),
    };
}

/** The chef confirms they have seen the items the customer added. */
export async function acknowledgeAdditions(
    orderId: number
): Promise<UpdateResult> {
    const staff = await getActiveStaff();
    if (!staff) return UNAUTHORIZED;

    if (!canSetStatus(staff.role, "PREPARING")) {
        return {
            success: false,
            message: "Your role is not allowed to make this change.",
        };
    }

    if (!Number.isInteger(orderId) || orderId <= 0) {
        return { success: false, message: "Invalid order." };
    }

    await prisma.order.updateMany({
        where: { id: orderId, restaurantId: staff.restaurantId },
        data: { hasNewAdditions: false },
    });

    // The chef has seen the added items: clear their "ADDED" badges too.
    await prisma.orderItem.updateMany({
        where: { orderId },
        data: { isAddition: false },
    });

    revalidatePath("/kitchen");
    revalidatePath("/admin/kitchen");

    return { success: true };
}

/** Staff close an active order by hand: the bill is done and the table frees. */
export async function completeOrderAction(
    orderId: number
): Promise<UpdateResult> {
    const staff = await getActiveStaff();
    if (!staff) return UNAUTHORIZED;

    if (!canSetStatus(staff.role, "PREPARING")) {
        return {
            success: false,
            message: "Your role is not allowed to make this change.",
        };
    }

    if (!Number.isInteger(orderId) || orderId <= 0) {
        return { success: false, message: "Invalid order." };
    }

    const done = await completeOrder(staff.restaurantId, orderId);

    if (!done) {
        return {
            success: false,
            message: "This order was already closed.",
        };
    }

    revalidatePath("/kitchen");
    revalidatePath("/admin/kitchen");
    revalidatePath("/admin/orders");
    revalidatePath("/admin/tables");
    revalidatePath("/admin");

    return { success: true };
}