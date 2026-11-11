import { prisma } from "@/lib/prisma";
import { PlacingOrderServices } from "@/services/OrderServices";

export type CartLine = {
    itemId: number;
    sizeId: number | null;
    quantity: number;
    note?: string;
};

const ACTIVE_STATUSES = ["PENDING", "PREPARING", "READY"] as const;

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
                    status: { in: [...ACTIVE_STATUSES] },
                },
            });

            if (!order) return null;

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

            return tx.order.update({
                where: { id: order.id },
                data: {
                    total: { increment: addedTotal },
                    hasNewAdditions: true,
                    // Food that was already ready needs cooking again
                    status: order.status === "READY" ? "PREPARING" : order.status,
                },
            });
        },
        { maxWait: 30000, timeout: 60000 }
    );
}

/**
 * If the table already has an unserved order, add to it.
 * Otherwise create a new order.
 */
export async function submitTableOrder(
    cart: CartLine[],
    restaurantId: number,
    tableId: number,
    tableNumber: number
) {
    const existing = await prisma.order.findFirst({
        where: {
            restaurantId,
            tableId,
            status: { in: [...ACTIVE_STATUSES] },
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