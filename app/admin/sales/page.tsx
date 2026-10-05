import { prisma } from "@/lib/prisma";
import { getUserFromToken } from "@/lib/authtoke";
import SalesClient from "./SalesClient";

export default async function AdminSales() {
    const user = await getUserFromToken();

    if (!user?.restaurantId) {
        return null;
    }

    // Load the last 12 months of served orders ONCE.
    // The client filters/aggregates by period locally.
    const now = new Date();
    const oneYearAgo = new Date(now);
    oneYearAgo.setMonth(oneYearAgo.getMonth() - 11);
    oneYearAgo.setDate(1);
    oneYearAgo.setHours(0, 0, 0, 0);

    const orders = await prisma.order.findMany({
        where: {
            restaurantId: user.restaurantId,
            status: "SERVED",
            createdAt: { gte: oneYearAgo },
        },
        include: {
            orderItems: {
                include: {
                    menuItem: {
                        select: { category: true },
                    },
                },
            },
        },
        orderBy: { createdAt: "asc" },
    });

    // Serialize dates to strings so they survive the
    // server → client component boundary.
    const serialized = orders.map((order) => ({
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

    return <SalesClient orders={serialized} />;
}