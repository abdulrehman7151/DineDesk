import { prisma } from "@/lib/prisma";

type CartLine = {
    itemId: number;
    sizeId: number | null;
    quantity: number;
    note?: string;
};

export const PlacingOrderServices = async (
    cart: CartLine[],
    restaurantId: number,
    tableNumber: number
) => {
    // =========================
    // Validate inputs
    // =========================
    if (!Array.isArray(cart) || cart.length === 0) {
        throw new Error("Cannot place an empty order.");
    }

    if (!Number.isInteger(restaurantId) || restaurantId <= 0) {
        throw new Error("Invalid restaurant.");
    }

    if (!Number.isInteger(tableNumber) || tableNumber <= 0) {
        throw new Error("Invalid table number.");
    }

    return await prisma.$transaction(async (tx) => {
        // =========================
        // Create the order shell
        // =========================
        const order = await tx.order.create({
            data: {
                restaurantId,
                tableNumber,
                status: "PENDING",
            },
        });

        let total = 0;

        // =========================
        // Process each cart line
        // =========================
        for (const line of cart) {
            if (
                !Number.isInteger(line.itemId) ||
                !Number.isInteger(line.quantity) ||
                line.quantity <= 0
            ) {
                throw new Error("Invalid cart line.");
            }

            // Enforce that the menu item belongs to this restaurant
            const menuItem = await tx.menuItem.findFirst({
                where: {
                    id: line.itemId,
                    restaurantId,
                },
                include: {
                    sizes: true,
                },
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

            // =========================
            // Determine unit price
            // =========================
            let unitPrice: number;

            if (line.sizeId !== null) {
                const size = menuItem.sizes.find(
                    (s) => s.id === line.sizeId
                );

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

            const lineTotal = unitPrice * line.quantity;
            total += lineTotal;

            // =========================
            // Persist the order line
            // =========================
            await tx.orderItem.create({
                data: {
                    orderId: order.id,
                    productName: menuItem.ProductName,
                    menuItemId: menuItem.id,
                    menuItemSizeId: line.sizeId,
                    quantity: line.quantity,
                    unitPrice,
                    notes: line.note ?? null,
                },
            });
        }

        // =========================
        // Finalize total
        // =========================
        const updatedOrder = await tx.order.update({
            where: { id: order.id },
            data: { total },
            include: {
                orderItems: true,
            },
        });

        return updatedOrder;
    }, {
        maxWait: 30000,
        timeout: 60000,
    });
};