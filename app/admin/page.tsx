import React from "react";
import Link from "next/link";
import { requireRole } from "@/lib/authtoke";
import { notFound } from "next/navigation";

const stats = [
    {
        label: "Today's Revenue",
        value: "Rs. 84,320",
        change: "+12.4%",
        up: true,
    },
    {
        label: "Orders Today",
        value: "142",
        change: "+8.1%",
        up: true,
    },
    {
        label: "Active Tables",
        value: "18 / 24",
        change: "75%",
        up: true,
    },
    {
        label: "Avg. Order Value",
        value: "Rs. 1,240",
        change: "-2.3%",
        up: false,
    },
];

const recentOrders = [
    {
        id: "#1042",
        table: "Table 12",
        items: "3 items",
        total: "Rs. 2,450",
        status: "Preparing",
    },
    {
        id: "#1041",
        table: "Table 8",
        items: "5 items",
        total: "Rs. 3,120",
        status: "Served",
    },
    {
        id: "#1040",
        table: "Table 3",
        items: "2 items",
        total: "Rs. 890",
        status: "Pending",
    },
    {
        id: "#1039",
        table: "Table 17",
        items: "4 items",
        total: "Rs. 2,100",
        status: "Served",
    },
    {
        id: "#1038",
        table: "Table 5",
        items: "6 items",
        total: "Rs. 4,280",
        status: "Preparing",
    },
];

const topSellingItems = [
    {
        name: "Classic Beef Burger",
        sold: 142,
        pct: 92,
    },
    {
        name: "Pepperoni Pizza",
        sold: 118,
        pct: 76,
    },
    {
        name: "Chicken Alfredo",
        sold: 96,
        pct: 62,
    },
    {
        name: "Margherita Pizza",
        sold: 74,
        pct: 48,
    },
];

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
                            className={`mt-1 text-xs font-semibold ${s.up
                                ? "text-success-text"
                                : "text-brand"
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
                            {recentOrders.map((o) => (
                                <tr
                                    key={o.id}
                                    className="border-b border-hairline last:border-0"
                                >
                                    <td className="px-6 py-3.5 font-semibold text-ink">
                                        {o.id}
                                    </td>

                                    <td className="px-6 py-3.5 text-ink-soft">
                                        {o.table}
                                    </td>

                                    <td className="px-6 py-3.5 text-ink-soft">
                                        {o.items}
                                    </td>

                                    <td className="px-6 py-3.5 font-bold text-price">
                                        {o.total}
                                    </td>

                                    <td className="px-6 py-3.5">
                                        <span className="rounded-full bg-brand-soft px-2.5 py-1 text-xs font-bold text-brand">
                                            {o.status}
                                        </span>
                                    </td>

                                    <td className="px-6 py-3.5 text-right">
                                        <Link
                                            href={`/admin/orders/${o.id.replace(
                                                "#",
                                                ""
                                            )}`}
                                            className="text-xs font-semibold text-brand hover:text-brand-deep"
                                        >
                                            View
                                        </Link>
                                    </td>
                                </tr>
                            ))}
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
                        {topSellingItems.map((item) => (
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
                                            width: `${item.pct}%`,
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