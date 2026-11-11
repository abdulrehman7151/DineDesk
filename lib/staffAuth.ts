import { getUserFromToken } from "@/lib/authtoke";
import { prisma } from "@/lib/prisma";

export async function getActiveStaff() {
    const user = await getUserFromToken();
    if (!user) return null;

    const userId = Number(user.userId);
    const restaurantId = Number(user.restaurantId);
    if (!Number.isInteger(userId) || !Number.isInteger(restaurantId)) return null;

    const membership = await prisma.restaurantUser.findUnique({
        where: { userId_restaurantId: { userId, restaurantId } },
        select: {
            role: true,
            isActive: true,
            user: { select: { name: true } },
        },
    });

    if (!membership || !membership.isActive) return null;

    return {
        userId,
        restaurantId,
        role: membership.role,
        name: membership.user.name,
    };
}