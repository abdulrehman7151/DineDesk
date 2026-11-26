// app/r/[restaurantSlug]/page.tsx
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import HomeClient from "@/app/Homeclinet";
import { hasActiveSubscriptionOrExempt } from "@/lib/subscriptionGate";

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
        select: {
            id: true,
            name: true,
            slug: true,
            city: true,
            address: true,
            phone: true,
        },
    });

    if (!restaurant) {
        notFound();
    }

    // No active subscription, no ordering: the guest menu is only served
    // to restaurants that have paid (or the free test restaurant). The QR
    // link itself keeps working — it lands here — but no menu is shown
    // and no order can be placed.
    if (!(await hasActiveSubscriptionOrExempt(restaurant.id))) {
        return (
            <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center p-8 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand text-lg font-bold text-white">
                    D
                </span>
                <h1 className="mt-4 text-2xl font-bold tracking-tight">
                    {restaurant.name}
                </h1>
                <p className="mt-3 text-sm text-ink-soft">
                    Online ordering for this restaurant is currently
                    unavailable. The restaurant needs an active DineDesk
                    subscription to take orders — please contact the
                    restaurant directly to order.
                </p>
            </main>
        );
    }

    const menuItems = await prisma.menuItem.findMany({
        where: { restaurantId: restaurant.id },
        include: { sizes: true },
        orderBy: { createdAt: "desc" },
    });

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
            items={menuItems}
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
