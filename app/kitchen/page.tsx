// app/kitchen/page.tsx
import { redirect } from "next/navigation";
import { getUserFromToken } from "@/lib/authtoke";
import { prisma } from "@/lib/prisma";
import KitchenClient from "./KitchenClient";

export const dynamic = "force-dynamic";

export default async function KitchenPage() {
    const user = await getUserFromToken();
    if (!user) redirect("/signin");

    // Convert restaurantId to number for the Prisma query
    const restaurantId = Number(user.restaurantId);

    // Only load active orders (not SERVED, not CANCELLED)
    const orders = await prisma.order.findMany({
        where: {
            restaurantId: restaurantId,
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

    // Convert Date objects to strings for the client
    const serialized = orders.map((o) => ({
        id: o.id,
        tableNumber: o.tableNumber,
        status: o.status as "PENDING" | "PREPARING" | "READY",
        createdAt: o.createdAt.toISOString(),
        orderItems: o.orderItems.map((i) => ({
            id: i.id,
            productName: i.productName,
            quantity: i.quantity,
            notes: i.notes ?? undefined,
        })),
    }));

    return <KitchenClient initialOrders={serialized} />;
}