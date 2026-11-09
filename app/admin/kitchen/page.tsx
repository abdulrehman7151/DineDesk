import { redirect } from "next/navigation";
import { getUserFromToken } from "@/lib/authtoke";
import { prisma } from "@/lib/prisma";
import KitchenClient from "@/app/kitchen/KitchenClient";

export const dynamic = "force-dynamic";

export default async function AdminKitchenPage() {
    const user = await getUserFromToken();
    if (!user) redirect("/signin");

    const restaurantId = Number(user.restaurantId);
    if (!Number.isInteger(restaurantId) || restaurantId <= 0) {
        throw new Error("Invalid restaurant");
    }

    const orders = await prisma.order.findMany({
        where: {
            restaurantId,
            status: {
                in: ["PENDING", "PREPARING", "READY"],
            },
        },
        include: {
            orderItems: true,
        },
        orderBy: {
            createdAt: "asc",
        },
    });

    const serialized = orders.map((order) => ({
        id: order.id,
        tableNumber: order.tableNumber,
        status: order.status as "PENDING" | "PREPARING" | "READY",
        createdAt: order.createdAt.toISOString(),
        orderItems: order.orderItems.map((item) => ({
            id: item.id,
            productName: item.productName,
            quantity: item.quantity,
            notes: item.notes ?? undefined,
        })),
    }));

      return <KitchenClient initialOrders={serialized} role="admin" />;
}
