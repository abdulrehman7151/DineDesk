import React from "react";
import Link from "next/link";
import { requireRole } from "@/lib/authtoke";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

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
];

export default async function AdminDashboard() {
    const user = await requireRole(["admin"]);

    if (!user) {
        notFound();
    }

    const now = new Date();
    const topSellingStart = new Date(now);
    topSellingStart.setDate(topSellingStart.getDate() - 6);
    topSellingStart.setHours(0, 0, 0, 0);

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

    const servedOrders = await prisma.order.findMany({
        where: {
            restaurantId: user.restaurantId,
            status: "SERVED",
            createdAt: {
                gte: topSellingStart,
                lte: now,
            },
        },
        select: {
            orderItems: {
                select: {
                    productName: true,
                    quantity: true,
                },
            },
        },
    });

    const soldByProduct = new Map<string, number>();
    for (const order of servedOrders) {
        for (const item of order.orderItems) {
            soldByProduct.set(
                item.productName,
                (soldByProduct.get(item.productName) ?? 0) + item.quantity
            );
        }
    }

    const topSellingItems = [...soldByProduct.entries()]
        .map(([name, sold]) => ({ name, sold }))
        .sort((a, b) => b.sold - a.sold || a.name.localeCompare(b.name))
        .slice(0, 4);
    const highestQuantity = topSellingItems[0]?.sold ?? 0;

    const orders = await prisma.order.findMany({
        where: {
            restaurantId: user.restaurantId,
        }
    });


    const filterd = orders.filter((i) => i.status === "SERVED")

    const Revenue = filterd.reduce((acc, current) => {
        return acc + current.total;
    }, 0)

    const tables = await prisma.table.findMany({
        where: {
            restaurantId: user.restaurantId
        }
    });
    const occupiedTables = tables.filter((i) => i.status === "OCCUPIED")
    const stats = [
        {
            label: "Today's Revenue",
            value: `Rs. ${Revenue}`,
            change: "+12.4%",
            up: true,
        },
        {
            label: "Orders Today",
            value: `${orders.length}`,
            change: "+8.1%",
            up: true,
        },
        {
            label: "Active Tables",
            value: `${occupiedTables.length}/${tables.length}`,
            change: "75%",
            up: true,
        },
        {
            label: "Avg. Order Value",
            value: `Rs. ${Revenue / orders.length}`,
            change: "-2.3%",
            up: false,
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
                    Welcome back, {user.email}. Overview of your restaurant
                    today.
                </p>
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((s) => (
                    <div
                        key={s.label}
                        className="rounded-card border border-hairline bg-surface p-5 shadow-soft"
                    >
                        <p className="text-xs font-medium text-ink-soft">
                            {s.label}
                        </p>

                        <p className="mt-2 text-2xl font-bold tracking-tight text-ink">
                            {s.value}
                        </p>

                        <p
                            className={`mt-1 text-xs font-semibold ${s.up ? "text-success-text" : "text-brand"
                                }`}
                        >
                            {s.change} vs yesterday
                        </p>
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
                                                <span className="rounded-full bg-brand-soft px-2.5 py-1 text-xs font-bold text-brand">
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