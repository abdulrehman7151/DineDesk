"use server";

import { prisma } from "@/lib/prisma";

export type OrderStatusResult =
    | {
          success: true;
          status: "PENDING" | "PREPARING" | "READY" | "SERVED" | "CANCELLED";
      }
    | { success: false };

export async function getOrderStatusAction(
    orderId: number,
    restaurantSlug: string,
    tableId: string
): Promise<OrderStatusResult> {
    if (
        !Number.isInteger(orderId) ||
        orderId <= 0 ||
        typeof restaurantSlug !== "string" ||
        typeof tableId !== "string" ||
        !/^[a-f0-9]{32}$/i.test(tableId)
    ) {
        return { success: false };
    }

    const order = await prisma.order.findFirst({
        where: {
            id: orderId,
            restaurant: { slug: restaurantSlug },
            table: { qrToken: tableId.toLowerCase() },
        },
        select: { status: true },
    });

    if (!order) return { success: false };

    return { success: true, status: order.status };
}