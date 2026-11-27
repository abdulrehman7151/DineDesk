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

            // Fetch every distinct menu item in ONE query instead of one
            // round trip per cart line. Only integer ids are sent, so a
            // bad cart line still fails below with "Invalid cart line."
            // rather than a database error.
            const itemIds = [
                ...new Set(
                    cart
                        .filter((line) => Number.isInteger(line.itemId))
                        .map((line) => line.itemId)
                ),
            ];
            const menuItems = await tx.menuItem.findMany({
                where: {
                    id: { in: itemIds },
                    restaurantId,
                },
                include: { sizes: true },
            });
            const menuItemById = new Map(
                menuItems.map((item) => [item.id, item])
            );

            let addedTotal = 0;
            const orderItemsData: {
                orderId: number;
                productName: string;
                menuItemId: number;
                menuItemSizeId: number | null;
                quantity: number;
                unitPrice: number;
                notes: string | null;
                isAddition: boolean;
            }[] = [];

            // Validate every line in cart order (same errors, same order
            // as before) and build the rows to insert. No database I/O
            // here: prices come from the map fetched above.
            for (const line of cart) {
                if (
                    !Number.isInteger(line.itemId) ||
                    !Number.isInteger(line.quantity) ||
                    line.quantity <= 0
                ) {
                    throw new Error("Invalid cart line.");
                }

                const menuItem = menuItemById.get(line.itemId);

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

                orderItemsData.push({
                    orderId: order.id,
                    productName: menuItem.ProductName,
                    menuItemId: menuItem.id,
                    menuItemSizeId: line.sizeId,
                    quantity: line.quantity,
                    unitPrice,
                    notes: line.note ?? null,
                    isAddition: true,
                });
            }

            // Insert every line in one round trip.
            await tx.orderItem.createMany({ data: orderItemsData });

            // The order update and the table update do not depend on each
            // other, so they run together.
            const [updated] = await Promise.all([
                tx.order.update({
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
                }),
                // Adding to an existing order also means the table is in use.
                tx.table.update({
                    where: { id: tableId },
                    data: { status: "OCCUPIED" },
                }),
            ]);

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
