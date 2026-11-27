import { notFound } from "next/navigation";
import { requireRole } from "@/lib/authtoke";
import { prisma } from "@/lib/prisma";
import { getPakistanDayRange } from "@/lib/pakistanTime";
import { expireStaleOrders } from "@/lib/orderLifecycle";
import AnalyticsClient from "./AnalyticsClient";
import { requireActiveSubscription } from "@/lib/subscriptionGate";

export const dynamic = "force-dynamic";

export default async function AdminAnalytics() {
    const user = await requireRole(["admin"]);

    if (!user) {
        notFound();
    }

    await requireActiveSubscription(user.restaurantId);

    await expireStaleOrders(user.restaurantId);

    const now = new Date();
    // Last 90 Pakistan days, starting at PKT midnight 89 days ago.
    const { start } = getPakistanDayRange(now, 89);

    const orders = await prisma.order.findMany({
        where: {
            restaurantId: user.restaurantId,
            // Served and completed orders are both sales.
            status: { in: ["SERVED", "COMPLETED"] },
            createdAt: {
                gte: start,
                lte: now,
            },
        },
        select: {
            id: true,
            total: true,
            createdAt: true,
            orderItems: {
                select: {
                    productName: true,
                    quantity: true,
                    unitPrice: true,
                    menuItem: {
                        select: {
                            id: true,
                            category: true,
                        },
                    },
                },
            },
        },
        orderBy: {
            createdAt: "asc",
        },
    });

    const serializedOrders = orders.map((order) => ({
        id: order.id,
        total: order.total,
        createdAt: order.createdAt.toISOString(),
        orderItems: order.orderItems.map((item) => ({
            productName: item.productName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            category: item.menuItem?.category ?? "Other",
            // null when the menu item was deleted (SetNull) — the client
            // skips these in best-selling items.
            menuItemId: item.menuItem?.id ?? null,
        })),
    }));

    return <AnalyticsClient orders={serializedOrders} />;
}
