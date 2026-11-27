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
    tableId: number,
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

    if (!Number.isSafeInteger(tableId) || tableId <= 0) {
        throw new Error("Invalid table.");
    }

    if (!Number.isInteger(tableNumber) || tableNumber <= 0) {
        throw new Error("Invalid table number.");
    }

    return await prisma.$transaction(async (tx) => {
        // Create the order shell and mark the table in use. These do not
        // depend on each other, so they run together instead of one
        // after the other.
        const [order] = await Promise.all([
            tx.order.create({
                data: {
                    restaurantId,
                    tableId,
                    tableNumber,
                    status: "PENDING",
                },
            }),
            // The table is now in use until its order is served.
            tx.table.update({
                where: { id: tableId },
                data: { status: "OCCUPIED" },
            }),
        ]);

        // Fetch every distinct menu item in ONE query instead of one
        // round trip per cart line. Only integer ids are sent, so a bad
        // cart line still fails below with "Invalid cart line." rather
        // than a database error.
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
            include: {
                sizes: true,
            },
        });
        const menuItemById = new Map(
            menuItems.map((item) => [item.id, item])
        );

        let total = 0;
        const orderItemsData: {
            orderId: number;
            productName: string;
            menuItemId: number;
            menuItemSizeId: number | null;
            quantity: number;
            unitPrice: number;
            notes: string | null;
        }[] = [];

        // Validate every line in cart order (same errors, same order as
        // before) and build the rows to insert. No database I/O here:
        // prices come from the map fetched above.
        for (const line of cart) {
            if (
                !Number.isInteger(line.itemId) ||
                !Number.isInteger(line.quantity) ||
                line.quantity <= 0
            ) {
                throw new Error("Invalid cart line.");
            }

            // Enforce that the menu item belongs to this restaurant
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

            orderItemsData.push({
                orderId: order.id,
                productName: menuItem.ProductName,
                menuItemId: menuItem.id,
                menuItemSizeId: line.sizeId,
                quantity: line.quantity,
                unitPrice,
                notes: line.note ?? null,
            });
        }

        // Insert every line in one round trip.
        await tx.orderItem.createMany({ data: orderItemsData });

        // =========================
        // Finalize total
        // =========================
        // The caller only needs id/total/status, so no order items are
        // fetched back.
        const updatedOrder = await tx.order.update({
            where: { id: order.id },
            data: { total },
            select: { id: true, total: true, status: true },
        });

        return updatedOrder;
    }, {
        maxWait: 30000,
        timeout: 60000,
    });
};