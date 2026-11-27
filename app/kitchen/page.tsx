import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getActiveStaff } from "@/lib/staffAuth";
import { expireStaleOrders } from "@/lib/orderLifecycle";
import KitchenClient from "./KitchenClient";

export const dynamic = "force-dynamic";

export default async function KitchenPage() {
    const staff = await getActiveStaff();
    if (!staff) redirect("/signin");

    // Close anything stale first, so the kitchen never works off orders
    // that should already have been completed or expired.
    await expireStaleOrders(staff.restaurantId);

    // Only active orders (not SERVED, not CANCELLED)
    const orders = await prisma.order.findMany({
        where: {
            restaurantId: staff.restaurantId,
            status: { in: ["PENDING", "PREPARING", "READY"] },
        },
        include: { orderItems: true },
        orderBy: { createdAt: "asc" },
    });

    const serialized = orders.map((o) => ({
        id: o.id,
        tableNumber: o.tableNumber,
        status: o.status as "PENDING" | "PREPARING" | "READY",
        createdAt: o.createdAt.toISOString(),
        hasNewAdditions: o.hasNewAdditions,
        orderItems: o.orderItems.map((i) => ({
            id: i.id,
            productName: i.productName,
            quantity: i.quantity,
            notes: i.notes ?? undefined,
            isAddition: i.isAddition,
        })),
    }));

    return (
        <KitchenClient
            initialOrders={serialized}
            role={staff.role}
            staffName={staff.name}
            showSignOut
        />
    );
}