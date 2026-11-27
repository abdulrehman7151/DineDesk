import "server-only";

import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

// Order lifecycle: a table must never stay occupied forever.
//
// - PENDING / PREPARING / READY: the order is still being worked on.
// - SERVED: the food is on the table and the tab is still open. Guests
//   may add more items, which moves the order back to PREPARING.
// - COMPLETED: the bill is closed. The table is free. Counts as a sale.
// - EXPIRED: the order was abandoned before it was served. It never
//   counts as a sale. The table is free.
// - CANCELLED: the old manual void, kept for compatibility.
//
// Expiry runs lazily: every server path that loads orders for a restaurant
// calls expireStaleOrders(restaurantId) first, so no cron job or other
// background infrastructure is needed. The kitchen display refreshes every
// few seconds while it is open, so expiry is picked up promptly during
// service.

export const ACTIVE_ORDER_STATUSES = [
    "PENDING",
    "PREPARING",
    "READY",
    "SERVED",
] as const;

export type ActiveOrderStatus = (typeof ACTIVE_ORDER_STATUSES)[number];

// Orders left untouched this long before being served are abandoned.
export const STALE_UNSERVED_MS = 24 * 60 * 60 * 1000;

// A PENDING checkout only blocks a new checkout for a day: after that the
// checkout was abandoned (the customer closed the payment page) and must
// not stop the restaurant from subscribing.
export const PENDING_CHECKOUT_STALE_MS = 24 * 60 * 60 * 1000;

export function pendingCheckoutCutoff(now = new Date()): Date {
    return new Date(now.getTime() - PENDING_CHECKOUT_STALE_MS);
}

async function freeTablesIfIdle(
    tx: Prisma.TransactionClient,
    tableIds: number[]
): Promise<void> {
    const uniqueTableIds = [...new Set(tableIds)];

    for (const tableId of uniqueTableIds) {
        const stillActive = await tx.order.count({
            where: {
                tableId,
                status: { in: [...ACTIVE_ORDER_STATUSES] },
            },
        });

        if (stillActive === 0) {
            await tx.table.update({
                where: { id: tableId },
                data: { status: "AVAILABLE" },
            });
        }
    }
}

/**
 * Release one table when no active (non-terminal) order remains on it.
 * Terminal = COMPLETED, EXPIRED, CANCELLED. SERVED still counts as
 * active — the food is on the table and the tab is open, so the table
 * stays occupied until the order is completed or expires.
 */
export async function freeTableIfIdle(tableId: number): Promise<void> {
    await prisma.$transaction(async (tx) => {
        await freeTablesIfIdle(tx, [tableId]);
    });
}

/**
 * Close orders that should no longer keep a table occupied:
 * - SERVED orders with no new items for the restaurant's auto-close
 *   minutes (default 30) become COMPLETED.
 * - PENDING / PREPARING / READY orders with no activity for 24 hours
 *   become EXPIRED (abandoned, never a sale).
 *
 * "Activity" is the order's updatedAt, which refreshes on every change
 * (status moves and added items). A SERVED order whose servedAt is missing
 * (created before servedAt existed) falls back to its updatedAt.
 */
export async function expireStaleOrders(
    restaurantId: number
): Promise<void> {
    const now = new Date();

    const restaurant = await prisma.restaurant.findUnique({
        where: { id: restaurantId },
        select: { servedAutoCloseMinutes: true },
    });
    const servedMinutes = restaurant?.servedAutoCloseMinutes ?? 30;
    const servedCutoff = new Date(
        now.getTime() - servedMinutes * 60 * 1000
    );
    const staleCutoff = new Date(now.getTime() - STALE_UNSERVED_MS);

    const [served, stale] = await Promise.all([
        prisma.order.findMany({
            where: {
                restaurantId,
                status: "SERVED",
                OR: [
                    { servedAt: { lte: servedCutoff } },
                    { servedAt: null, updatedAt: { lte: servedCutoff } },
                ],
            },
            select: { id: true, tableId: true },
        }),
        prisma.order.findMany({
            where: {
                restaurantId,
                status: { in: ["PENDING", "PREPARING", "READY"] },
                updatedAt: { lte: staleCutoff },
            },
            select: { id: true, tableId: true },
        }),
    ]);

    if (served.length === 0 && stale.length === 0) return;

    await prisma.$transaction(async (tx) => {
        if (served.length > 0) {
            await tx.order.updateMany({
                where: {
                    id: { in: served.map((order) => order.id) },
                    status: "SERVED",
                },
                data: { status: "COMPLETED" },
            });
        }

        if (stale.length > 0) {
            await tx.order.updateMany({
                where: {
                    id: { in: stale.map((order) => order.id) },
                    status: { in: ["PENDING", "PREPARING", "READY"] },
                },
                data: { status: "EXPIRED" },
            });
        }

        await freeTablesIfIdle(
            tx,
            [...served, ...stale]
                .map((order) => order.tableId)
                .filter((tableId): tableId is number => tableId !== null)
        );
    });
}

/**
 * Close one active order by hand (kitchen / admin "Complete order").
 * Marks it COMPLETED and frees its table when no other active order is
 * still running on that table. Returns false when the order was already
 * closed (or does not belong to this restaurant).
 */
export async function completeOrder(
    restaurantId: number,
    orderId: number
): Promise<boolean> {
    return prisma.$transaction(async (tx) => {
        const updated = await tx.order.updateMany({
            where: {
                id: orderId,
                restaurantId,
                status: { in: [...ACTIVE_ORDER_STATUSES] },
            },
            data: { status: "COMPLETED", hasNewAdditions: false },
        });

        if (updated.count === 0) return false;

        const order = await tx.order.findUnique({
            where: { id: orderId },
            select: { tableId: true },
        });

        if (order?.tableId) {
            await freeTablesIfIdle(tx, [order.tableId]);
        }

        return true;
    });
}
