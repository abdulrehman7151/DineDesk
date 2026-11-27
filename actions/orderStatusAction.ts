"use server";

import { prisma } from "@/lib/prisma";

export type OrderStatusResult =
    | {
          success: true;
          status: "PENDING" | "PREPARING" | "READY" | "SERVED" | "CANCELLED";
          total: number;
          itemCount: number;
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
        select: {
            status: true,
            total: true,
            orderItems: { select: { quantity: true } },
        },
    });

    if (!order) return { success: false };

    // The tracker only knows the guest-facing statuses: a completed order
    // reads as served ("Enjoy your meal!") and an expired one as
    // cancelled, so the popup closes cleanly either way.
    const status =
        order.status === "COMPLETED"
            ? "SERVED"
            : order.status === "EXPIRED"
              ? "CANCELLED"
              : order.status;

    return {
        success: true,
        status,
        total: order.total,
        itemCount: order.orderItems.reduce((sum, i) => sum + i.quantity, 0),
    };
}