// app/kitchen/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getUserFromToken } from "@/lib/authtoke";
import { prisma } from "@/lib/prisma";

export async function updateOrderStatus(orderId: number, newStatus: string) {
    // 1. Check user is logged in
    const user = await getUserFromToken();
    if (!user) redirect("/signin");

    // 2. Only allow these statuses
    const allowed = ["PENDING", "PREPARING", "READY", "SERVED"];
    if (!allowed.includes(newStatus)) {
        throw new Error("Invalid status");
    }

    // 3. Make sure restaurantId is a number (JWT might return a string)
    const restaurantId = Number(user.restaurantId);
    if (!Number.isInteger(restaurantId) || restaurantId <= 0) {
        throw new Error("Invalid restaurant");
    }

    // 4. Make sure orderId is valid
    if (!Number.isInteger(orderId) || orderId <= 0) {
        throw new Error("Invalid order id");
    }

    // 5. Find the order (must belong to this restaurant)
    const order = await prisma.order.findFirst({
        where: {
            id: orderId,
            restaurantId: restaurantId,
        },
    });

    if (!order) {
        throw new Error("Order not found");
    }

    // 6. Update the status
    await prisma.order.update({
        where: { id: orderId },
        data: { status: newStatus },
    });

    // 7. Refresh the kitchen page so new data loads
    revalidatePath("/kitchen");
}