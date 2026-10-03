// app/r/[restaurantSlug]/page.tsx
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import HomeClient from "@/app/Homeclinet";

type Props = {
    params: Promise<{ restaurantSlug: string }>;
};

export default async function RestaurantPage({ params }: Props) {
    const { restaurantSlug } = await params;

    const restaurant = await prisma.restaurant.findUnique({
        where: { slug: restaurantSlug },
        include: {
            menuItems: {
                include: { sizes: true },
                orderBy: { createdAt: "desc" },
            },
        },
    });

    if (!restaurant) {
        notFound();
    }

    return (
        <HomeClient
            items={restaurant.menuItems}
            restaurantSlug={restaurant.slug}
            restaurant={{
                id: restaurant.id,
                name: restaurant.name,
                slug: restaurant.slug,
                city: restaurant.city,
                address: restaurant.address,
                phone: restaurant.phone,
            }}
        />
    );
}