import React from "react";
import Link from "next/link";
import { headers } from "next/headers";
import { requireRole } from "@/lib/authtoke";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getPakistanDayRange } from "@/lib/pakistanTime";
import { getPriceTier } from "@/lib/payments/paddle";
import { expireStaleOrders } from "@/lib/orderLifecycle";
import { requireActiveSubscription } from "@/lib/subscriptionGate";
import { METRIC_TONE, orderStatusTone, type MetricToneKey } from "@/lib/orderStatusColors";

const quickActions = [
    {
        label: "Add Menu Item",
        href: "/admin/menu",
    },
    {
        label: "Add Table",
        href: "/admin/tables",
    },
    {
        label: "New Order",
        href: "/admin/orders/new",
    },
    {
        label: "View Reports",
        href: "/admin/analytics",
    },
    {
        label: "Subscription",
        href: "/admin/subscription",
    },
];

export default async function AdminDashboard() {
    const user = await requireRole(["admin"]);

    if (!user) {
        notFound();
    }

    await requireActiveSubscription(user.restaurantId);

    // Close anything stale first, so the stats and table counts below are
    // never stuck on orders that should already have been completed.
    await expireStaleOrders(user.restaurantId);

    // The price shown depends on where the visitor is.
    const priceTier = getPriceTier(
        (await headers()).get("x-vercel-ip-country")
    );

    // Who to greet: the admin's own name when it is known, otherwise the
    // restaurant name, otherwise the email as a last resort.
    const [owner, restaurant] = await Promise.all([
        prisma.user.findUnique({
            where: { id: user.userId },
            select: { name: true },
        }),
        prisma.restaurant.findUnique({
            where: { id: user.restaurantId },
            select: { name: true },
        }),
    ]);
    const greetingName =
        owner?.name?.trim() || restaurant?.name || user.email;

    // The gate above already redirected restaurants without an ACTIVE
    // subscription, so this lookup only ever comes back empty for the
    // exempt test restaurant — it drives the reminder banner there.
    const activeSubscription = await prisma.subscription.findFirst({
        where: {
            restaurantId: user.restaurantId,
            status: "ACTIVE",
        },
        select: { id: true },
    });

    const now = new Date();

    const recentOrders = await prisma.order.findMany({
        where: {
            restaurantId: user.restaurantId,
        },
        include: {
            orderItems: true,
        },
        orderBy: {
            createdAt: "desc",
        },
        take: 5,
    });

    // Top sellers: items sold in the last 7 days on orders that were
    // actually served or completed. Counted by when the item was ordered
    // (not when the order was created), and over a rolling 7 days — the
    // old midnight-anchored window dropped sales from the first day.
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const soldItems = await prisma.orderItem.findMany({
        where: {
            createdAt: { gte: sevenDaysAgo },
            order: {
                restaurantId: user.restaurantId,
                status: { in: ["SERVED", "COMPLETED"] },
            },
        },
        select: {
            productName: true,
            quantity: true,
        },
    });

    const soldByProduct = new Map<string, number>();
    for (const item of soldItems) {
        soldByProduct.set(
            item.productName,
            (soldByProduct.get(item.productName) ?? 0) + item.quantity
        );
    }

    const topSellingItems = [...soldByProduct.entries()]
        .map(([name, sold]) => ({ name, sold }))
        .sort((a, b) => b.sold - a.sold || a.name.localeCompare(b.name))
        .slice(0, 4);
    const highestQuantity = topSellingItems[0]?.sold ?? 0;

    // "Today" means the current day in the restaurant's timezone
    // (Asia/Karachi), not all time and not the server's UTC day.
    const { start: todayStart, end: todayEnd } = getPakistanDayRange(
        new Date(),
        0
    );

    // Today's sales count by when the item was ordered, not when the
    // order was created: items added to an old order count today, and an
    // order placed today but served tomorrow counts today too. Cancelled
    // and expired orders never count.
    const todaysItems = await prisma.orderItem.findMany({
        where: {
            createdAt: {
                gte: todayStart,
                lt: todayEnd,
            },
            order: {
                restaurantId: user.restaurantId,
                status: { notIn: ["CANCELLED", "EXPIRED"] },
            },
        },
        select: {
            orderId: true,
            quantity: true,
            unitPrice: true,
        },
    });

    const Revenue = todaysItems.reduce(
        (acc, item) => acc + item.unitPrice * item.quantity,
        0
    );
    const todaysOrderCount = new Set(
        todaysItems.map((item) => item.orderId)
    ).size;

    const tables = await prisma.table.findMany({
        where: {
            restaurantId: user.restaurantId
        }
    });
    const occupiedTables = tables.filter((i) => i.status === "OCCUPIED")
        const averageOrderValue =
        todaysOrderCount > 0 ? Math.round(Revenue / todaysOrderCount) : 0;

    const stats: { label: string; value: string; tone: MetricToneKey }[] = [
        {
            label: "Today's Revenue",
            value: `Rs. ${Revenue.toLocaleString()}`,
            tone: "revenue",
        },
        {
            label: "Orders Today",
            value: `${todaysOrderCount}`,
            tone: "orders",
        },
        {
            label: "Active Tables",
            value: `${occupiedTables.length}/${tables.length}`,
            tone: "tables",
        },
        {
            label: "Avg. Order Value",
            value: `Rs. ${averageOrderValue.toLocaleString()}`,
            tone: "average",
        },
    ];


    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight">
                    Dashboard
                </h1>

                <p className="mt-1 text-sm text-ink-soft">
                    Welcome back, {greetingName}. Overview of your restaurant
                    today.
                </p>
            </div>

            {/* Subscription reminder — informational only, never blocks admin */}
            {!activeSubscription ? (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-hairline bg-brand-soft p-4 shadow-soft">
                    <p className="text-sm font-semibold text-ink">
                        Your restaurant does not have an active subscription yet.
                        <span className="ml-1 font-normal text-ink-soft">
                            Subscribe for {priceTier.displayCurrency}{" "}
                            {priceTier.displayAmount}/month to keep billing up
                            to date.
                        </span>
                    </p>
                    <Link
                        href="/admin/subscription"
                        className="rounded-full bg-brand px-4 py-2 text-xs font-bold text-white transition hover:bg-brand-deep"
                    >
                        View subscription →
                    </Link>
                </div>
            ) : null}

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((s) => (
                    <div
                        key={s.label}
                        className="overflow-hidden rounded-card border border-hairline bg-surface shadow-soft"
                    >
                        <div className={`h-1.5 ${METRIC_TONE[s.tone].bar}`} />
                        <div className="p-5">
                            <p className="text-xs font-medium text-ink-soft">
                                {s.label}
                            </p>

                            <p className={`mt-2 text-2xl font-bold tracking-tight ${METRIC_TONE[s.tone].value}`}>
                                {s.value}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Orders */}
            <div className="rounded-card border border-hairline bg-surface shadow-soft">
                <div className="flex items-center justify-between border-b border-hairline px-6 py-4">
                    <div>
                        <h2 className="text-base font-bold text-ink">
                            Recent Orders
                        </h2>

                        <p className="text-xs text-ink-soft">
                            Latest activity from your tables
                        </p>
                    </div>

                    <Link
                        href="/admin/orders"
                        className="text-sm font-semibold text-brand hover:text-brand-deep"
                    >
                        View all →
                    </Link>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-hairline text-left text-xs font-bold uppercase tracking-wider text-ink-muted">
                                <th className="px-6 py-3">Order</th>
                                <th className="px-6 py-3">Table</th>
                                <th className="px-6 py-3">Items</th>
                                <th className="px-6 py-3">Total</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3" />
                            </tr>
                        </thead>

                        <tbody>
                            {recentOrders.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-6 py-10 text-center text-sm text-ink-soft"
                                    >
                                        No orders yet.
                                    </td>
                                </tr>
                            ) : (
                                recentOrders.map((o) => {
                                    const itemCount = o.orderItems.reduce(
                                        (sum, item) => sum + item.quantity,
                                        0
                                    );

                                    return (
                                        <tr
                                            key={o.id}
                                            className="border-b border-hairline last:border-0"
                                        >
                                            <td className="px-6 py-3.5 font-semibold text-ink">
                                                #{o.id}
                                            </td>

                                            <td className="px-6 py-3.5 text-ink-soft">
                                                {o.tableNumber ?? "—"}
                                            </td>

                                            <td className="px-6 py-3.5 text-ink-soft">
                                                {itemCount} item
                                                {itemCount === 1 ? "" : "s"}
                                            </td>

                                            <td className="px-6 py-3.5 font-bold text-price">
                                                Rs. {o.total}
                                            </td>

                                            <td className="px-6 py-3.5">
                                                <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${orderStatusTone(o.status)}`}>
                                                    {o.status}
                                                </span>
                                            </td>


                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Two Column */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Top Selling Items */}
                <div className="rounded-card border border-hairline bg-surface p-6 shadow-soft">
                    <h2 className="text-base font-bold text-ink">
                        Top Selling Items
                    </h2>

                    <p className="text-xs text-ink-soft">
                        Based on the last 7 days
                    </p>

                    <div className="mt-4 space-y-3">
                        {topSellingItems.length === 0 ? (
                            <p className="py-4 text-sm text-ink-soft">
                                No completed sales in the last 7 days.
                            </p>
                        ) : topSellingItems.map((item) => (
                            <div key={item.name}>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-semibold text-ink">
                                        {item.name}
                                    </span>

                                    <span className="text-ink-soft">
                                        {item.sold} sold
                                    </span>
                                </div>

                                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-warm">
                                    <div
                                        className="h-full rounded-full bg-brand"
                                        style={{
                                            width: `${Math.round((item.sold / highestQuantity) * 100)}%`,
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="rounded-card border border-hairline bg-surface p-6 shadow-soft">
                    <h2 className="text-base font-bold text-ink">
                        Quick Actions
                    </h2>

                    <p className="text-xs text-ink-soft">
                        Common tasks
                    </p>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                        {quickActions.map((action) => (
                            <Link
                                key={action.label}
                                href={action.href}
                                className="rounded-xl border border-hairline bg-surface-tint px-4 py-3 text-center text-sm font-semibold text-ink transition hover:border-brand hover:text-brand"
                            >
                                {action.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
