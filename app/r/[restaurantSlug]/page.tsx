// app/r/[restaurantSlug]/page.tsx
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import HomeClient from "@/app/Homeclinet";
import { ACTIVE_ORDER_STATUSES, expireStaleOrders } from "@/lib/orderLifecycle";
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
            openingTime: true,
            closingTime: true,
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

    // "Popular" ranking: total quantity ordered per menu item, only for
    // this restaurant's orders that were not cancelled or abandoned.
    // When the restaurant has no orders yet, fall back to the first
    // available items in menu order so the section still shows.
    // Only available items can be popular.
    const popularItemIds = await (async () => {
        const availableIds = new Set(
            menuItems.filter((item) => item.isAvailable).map((item) => item.id)
        );
        const orderedLines = await prisma.orderItem.findMany({
            where: {
                menuItemId: { not: null },
                order: {
                    restaurantId: restaurant.id,
                    status: { notIn: ["CANCELLED", "EXPIRED"] },
                },
            },
            select: { menuItemId: true, quantity: true },
        });
        const totals = new Map<number, number>();
        for (const line of orderedLines) {
            if (line.menuItemId === null) continue;
            totals.set(
                line.menuItemId,
                (totals.get(line.menuItemId) ?? 0) + line.quantity
            );
        }
        const fromOrders = [...totals.entries()]
            .filter(([id]) => availableIds.has(id))
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8)
            .map(([id]) => id);
        if (fromOrders.length > 0) {
            // Pad with the next available dishes in menu order so the
            // carousel always shows up to 8 cards: a restaurant may have
            // orders for only a couple of dishes, and the ranked list
            // alone would leave the carousel with nothing to slide to.
            // Most-selling dishes stay first, in rank order.
            const ranked = new Set(fromOrders);
            for (const item of menuItems) {
                if (fromOrders.length >= 8) break;
                if (item.isAvailable && !ranked.has(item.id)) {
                    fromOrders.push(item.id);
                }
            }
            return fromOrders;
        }
        return menuItems
            .filter((item) => item.isAvailable)
            .slice(0, 8)
            .map((item) => item.id);
    })();

    // Close anything stale first, so a new guest never gets attached to
    // an order that should already have been completed or expired.
    await expireStaleOrders(restaurant.id);

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

    // The table's current order, including SERVED: the food is on the
    // table and the tab is still open, so a guest who reloads must still
    // see it. It only leaves once it is COMPLETED, EXPIRED or CANCELLED.
    const activeOrder = table
        ? await prisma.order.findFirst({
              where: {
                  restaurantId: restaurant.id,
                  tableId: table.id,
                  status: { in: [...ACTIVE_ORDER_STATUSES] },
              },
              orderBy: { createdAt: "desc" },
              select: { id: true, status: true },
          })
        : null;

    return (
        <HomeClient
            items={menuItems}
            popularItemIds={popularItemIds}
            restaurant={{
                id: restaurant.id,
                name: restaurant.name,
                slug: restaurant.slug,
                city: restaurant.city,
                address: restaurant.address,
                phone: restaurant.phone,
                openingTime: restaurant.openingTime,
                closingTime: restaurant.closingTime,
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
                              | "READY"
                              | "SERVED",
                      }
                    : null
            }
        />
    );
}
