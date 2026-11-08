// app/r/[restaurantSlug]/page.tsx
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import HomeClient from "@/app/Homeclinet";

type Props = {
    params: Promise<{ restaurantSlug: string }>;
    searchParams: Promise<{ tableId?: string | string[] }>;
};

export default async function RestaurantPage({ params, searchParams }: Props) {
    const { restaurantSlug } = await params;
    const { tableId: tableIdParam } = await searchParams;

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

    const parsedTableId =
        typeof tableIdParam === "string" && /^\d+$/.test(tableIdParam)
            ? Number(tableIdParam)
            : null;
    const table =
        parsedTableId !== null &&
        Number.isSafeInteger(parsedTableId) &&
        parsedTableId > 0
            ? await prisma.table.findFirst({
                  where: {
                      id: parsedTableId,
                      restaurantId: restaurant.id,
                  },
                  select: { id: true, number: true },
              })
            : null;

    return (
        <HomeClient
            items={restaurant.menuItems}
            restaurant={{
                id: restaurant.id,
                name: restaurant.name,
                slug: restaurant.slug,
                city: restaurant.city,
                address: restaurant.address,
                phone: restaurant.phone,
            }}
            tableId={table?.id ?? null}
            tableNumber={table?.number ?? null}
        />
    );
}