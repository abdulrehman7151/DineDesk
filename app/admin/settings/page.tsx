import { notFound } from "next/navigation";
import { requireRole } from "@/lib/authtoke";
import { requireActiveSubscription } from "@/lib/subscriptionGate";
import { prisma } from "@/lib/prisma";
import SettingsForm from "./SettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
    const user = await requireRole(["admin"]);

    if (!user) {
        notFound();
    }

    await requireActiveSubscription(user.restaurantId);

    const restaurant = await prisma.restaurant.findUnique({
        where: { id: user.restaurantId },
        select: {
            name: true,
            city: true,
            address: true,
            phone: true,
            openingTime: true,
            closingTime: true,
            servedAutoCloseMinutes: true,
        },
    });

    if (!restaurant) {
        notFound();
    }

    return (
        <SettingsForm
            initial={{
                name: restaurant.name,
                city: restaurant.city,
                address: restaurant.address,
                phone: restaurant.phone,
                openingTime: restaurant.openingTime ?? "",
                closingTime: restaurant.closingTime ?? "",
                servedAutoCloseMinutes: String(
                    restaurant.servedAutoCloseMinutes
                ),
            }}
        />
    );
}
