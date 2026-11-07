import { notFound } from "next/navigation";
import { requireRole } from "@/lib/authtoke";
import { prisma } from "@/lib/prisma";
import AnalyticsClient from "./AnalyticsClient";

export const dynamic = "force-dynamic";

export default async function AdminAnalytics() {
    const user = await requireRole(["admin"]);

    if (!user) {
        notFound();
    }

    const now = new Date();
    const start = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
    );
    start.setUTCDate(start.getUTCDate() - 89);

    const orders = await prisma.order.findMany({
        where: {
            restaurantId: user.restaurantId,
            status: "SERVED",
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
        })),
    }));

    return <AnalyticsClient orders={serializedOrders} />;
}
