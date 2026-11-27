LINES: 160
import { prisma } from "@/lib/prisma";
import {
    ACTIVE_ORDER_STATUSES,
    expireStaleOrders,
} from "@/lib/orderLifecycle";
import { PlacingOrderServices } from "@/services/OrderServices";

export type CartLine = {
    itemId: number;
    sizeId: number | null;
    quantity: number;
    note?: string;
};

/**
 * Adds items to an existing, unserved order.
 * Returns null if the order is no longer active.
 */
async function addItemsToOrder(
    orderId: number,
    cart: CartLine[],
    restaurantId: number,
    tableId: number
) {
    return prisma.$transaction(
        async (tx) => {
            const order = await tx.order.findFirst({
                where: {
                    id: orderId,
                    restaurantId,
                    tableId,
                    status: { in: [...ACTIVE_ORDER_STATUSES] },
                },
            });

            if (!order) return null;

            // "ADDED" marks only the newest batch: clear the flag on the
            // lines already on the order before adding the new ones.
            await tx.orderItem.updateMany({
                where: { orderId: order.id },
                data: { isAddition: false },
            });

            let addedTotal = 0;

            for (const line of cart) {
                if (
                    !Number.isInteger(line.itemId) ||
                    !Number.isInteger(line.quantity) ||
                    line.quantity <= 0
                ) {
                    throw new Error("Invalid cart line.");
                }

                const menuItem = await tx.menuItem.findFirst({
                    where: { id: line.itemId, restaurantId },
                    include: { sizes: true },
                });

                if (!menuItem) {
                    throw new Error(
                        `Menu item ${line.itemId} not found for this restaurant.`
                    );
                }

                if (!menuItem.isAvailable) {
                    throw new Error(
                        `${menuItem.ProductName} is currently unavailable.`
                    );
                }

                let unitPrice: number;

                if (line.sizeId !== null) {
                    const size = menuItem.sizes.find((s) => s.id === line.sizeId);
                    if (!size) {
                        throw new Error(
                            `Selected size for ${menuItem.ProductName} is no longer available.`
                        );
                    }
                    unitPrice = size.price;
                } else {
                    if (menuItem.sizes.length > 0) {
                        throw new Error(
                            `Please choose a size for ${menuItem.ProductName}.`
                        );
                    }
                    if (menuItem.basePrice === null) {
                        throw new Error(
                            `No price found for ${menuItem.ProductName}.`
                        );
                    }
                    unitPrice = menuItem.basePrice;
                }

                addedTotal += unitPrice * line.quantity;

                await tx.orderItem.create({
                    data: {
                        orderId: order.id,
                        productName: menuItem.ProductName,
                        menuItemId: menuItem.id,
                        menuItemSizeId: line.sizeId,
                        quantity: line.quantity,
                        unitPrice,
                        notes: line.note ?? null,
                        isAddition: true,
                    },
                });
            }

            const updated = await tx.order.update({
                where: { id: order.id },
                data: {
                    total: { increment: addedTotal },
                    hasNewAdditions: true,
                    // Food that was already ready — or already served —
                    // needs cooking again, so the order goes back to the
                    // kitchen. Adding items also resets the served timer:
                    // servedAt is cleared and only set again when the
                    // order is served next. updatedAt refreshes on this
                    // update, which is what the stale-order expiry counts.
                    ...(order.status === "SERVED"
                        ? { status: "PREPARING", servedAt: null }
                        : order.status === "READY"
                          ? { status: "PREPARING" }
                          : {}),
                },
            });

            // Adding to an existing order also means the table is in use.
            await tx.table.update({
                where: { id: tableId },
                data: { status: "OCCUPIED" },
            });

            return updated;
        },
        { maxWait: 30000, timeout: 60000 }
    );
}

/**
 * If the table already has an open order, add to it.
 * Otherwise create a new order.
 */
export async function submitTableOrder(
    cart: CartLine[],
    restaurantId: number,
    tableId: number,
    tableNumber: number
) {
    // Close anything stale first, so a new order never gets appended to
    // an order that should already have been completed or expired.
    await expireStaleOrders(restaurantId);

    const existing = await prisma.order.findFirst({
        where: {
            restaurantId,
            tableId,
            status: { in: [...ACTIVE_ORDER_STATUSES] },
        },
        orderBy: { createdAt: "desc" },
        select: { id: true },
    });

    if (existing) {
        const updated = await addItemsToOrder(
            existing.id,
            cart,
            restaurantId,
            tableId
        );

        if (updated) {
            return { mode: "added" as const, order: updated };
        }
        // The order was served/cancelled a moment ago: start a new one
    }

    const created = await PlacingOrderServices(
        cart,
        restaurantId,
        tableId,
        tableNumber
    );

    return { mode: "created" as const, order: created };
}
