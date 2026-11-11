// app/r/[restaurantSlug]/page.tsx
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import HomeClient from "@/app/Homeclinet";

export const dynamic = "force-dynamic";

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

    const tableQrId =
        typeof tableIdParam === "string" && /^[a-f0-9]{32}$/i.test(tableIdParam)
            ? tableIdParam.toLowerCase()
            : null;

    const table = tableQrId
        ? await prisma.table.findFirst({
              where: {
                  qrToken: tableQrId,
                  restaurantId: restaurant.id,
              },
              select: { id: true, number: true, qrToken: true },
          })
        : null;

    // The table's current order, until it is marked as served
    const activeOrder = table
        ? await prisma.order.findFirst({
              where: {
                  restaurantId: restaurant.id,
                  tableId: table.id,
                  status: { in: ["PENDING", "PREPARING", "READY"] },
              },
              orderBy: { createdAt: "desc" },
              select: { id: true, status: true },
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
            tableId={table?.qrToken ?? null}
            tableNumber={table?.number ?? null}
            activeOrder={
                activeOrder
                    ? {
                          id: activeOrder.id,
                          status: activeOrder.status as
                              | "PENDING"
                              | "PREPARING"
                              | "READY",
                      }
                    : null
            }
        />
    );
}