"use client";

import React, { useMemo, useState } from "react";

type Period = "today" | "week" | "month" | "year";

type OrderItem = {
    productName: string;
    quantity: number;
    unitPrice: number;
    category: string;
};

type Order = {
    id: number;
    total: number;
    createdAt: string; // ISO
    orderItems: OrderItem[];
};

type Props = {
    orders: Order[];
};

function formatMoney(value: number) {
    return `Rs. ${value.toLocaleString()}`;
}

/* -------------------------------- */
/* Date helpers */
/* -------------------------------- */

function getDateRange(period: Period) {
    const now = new Date();
    const start = new Date(now);
    const end = new Date(now);

    if (period === "today") {
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
    }

    if (period === "week") {
        // Last 7 days including today
        start.setDate(now.getDate() - 6);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
    }

    if (period === "month") {
        // Current month
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        end.setMonth(now.getMonth() + 1, 0);
        end.setHours(23, 59, 59, 999);
    }

    if (period === "year") {
        // Current year
        start.setMonth(0, 1);
        start.setHours(0, 0, 0, 0);
        end.setMonth(11, 31);
        end.setHours(23, 59, 59, 999);
    }

    return { start, end };
}

function formatDay(date: Date) {
    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
    });
}

function getDayKey(date: Date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

/* -------------------------------- */
/* Aggregations (run on filtered orders) */
/* -------------------------------- */

function getDailyRevenue(orders: Order[], start: Date, end: Date) {
    const revenueMap: Record<string, number> = {};
    const current = new Date(start);

    while (current <= end) {
        revenueMap[getDayKey(current)] = 0;
        current.setDate(current.getDate() + 1);
    }

    orders.forEach((order) => {
        const key = getDayKey(new Date(order.createdAt));
        if (revenueMap[key] !== undefined) {
            revenueMap[key] += order.total;
        }
    });

    return Object.entries(revenueMap).map(([date, revenue]) => ({
        date,
        label: formatDay(new Date(`${date}T00:00:00`)),
        revenue,
    }));
}

function getCategoryData(orders: Order[]) {
    const map: Record<string, number> = {};

    orders.forEach((order) => {
        order.orderItems.forEach((item) => {
            const revenue = item.quantity * item.unitPrice;
            map[item.category] = (map[item.category] || 0) + revenue;
        });
    });

    return Object.entries(map)
        .map(([category, revenue]) => ({ category, revenue }))
        .sort((a, b) => b.revenue - a.revenue);
}

function getProductData(orders: Order[]) {
    const map: Record<string, number> = {};

    orders.forEach((order) => {
        order.orderItems.forEach((item) => {
            const revenue = item.quantity * item.unitPrice;
            map[item.productName] = (map[item.productName] || 0) + revenue;
        });
    });

    return Object.entries(map)
        .map(([product, revenue]) => ({ product, revenue }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);
}

/* -------------------------------- */
/* Main component */
/* -------------------------------- */

export default function SalesClient({ orders }: Props) {
    const [period, setPeriod] = useState<Period>("week");
    const [breakdown, setBreakdown] = useState<"category" | "product">("category");

    // Everything below recalculates locally — no DB hits.
    const filteredOrders = useMemo(() => {
        const { start, end } = getDateRange(period);
        return orders.filter((order) => {
            const d = new Date(order.createdAt);
            return d >= start && d <= end;
        });
    }, [orders, period]);

    const revenue = useMemo(
        () => filteredOrders.reduce((sum, o) => sum + o.total, 0),
        [filteredOrders]
    );

    const orderCount = filteredOrders.length;

    const averageOrder = orderCount > 0 ? Math.round(revenue / orderCount) : 0;

    const dailyRevenue = useMemo(() => {
        const { start, end } = getDateRange(period);
        return getDailyRevenue(filteredOrders, start, end);
    }, [filteredOrders, period]);

    const categoryRevenue = useMemo(() => getCategoryData(filteredOrders), [filteredOrders]);
    const productRevenue = useMemo(() => getProductData(filteredOrders), [filteredOrders]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Sales</h1>
                    <p className="mt-1 text-sm text-ink-soft">
                        Track your restaurant revenue and sales.
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    {(
                        [
                            { value: "today", label: "Today" },
                            { value: "week", label: "Last 7 Days" },
                            { value: "month", label: "This Month" },
                            { value: "year", label: "This Year" },
                        ] as const
                    ).map((item) => (
                        <button
                            key={item.value}
                            type="button"
                            onClick={() => setPeriod(item.value)}
                            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${period === item.value
                                    ? "bg-brand text-white"
                                    : "border border-hairline bg-surface text-ink-soft hover:bg-surface-tint"
                                }`}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Summary */}
            <div className="grid gap-4 sm:grid-cols-3">
                <SummaryCard label="Total Revenue" value={formatMoney(revenue)} />
                <SummaryCard label="Served Orders" value={String(orderCount)} />
                <SummaryCard label="Average Order" value={formatMoney(averageOrder)} />
            </div>

            {/* Revenue Line Chart */}
            <div className="rounded-card border border-hairline bg-surface p-6 shadow-soft">
                <div className="mb-6">
                    <h2 className="text-base font-bold text-ink">Revenue Trend</h2>
                    <p className="text-xs text-ink-soft">Revenue over the selected period</p>
                </div>
                <RevenueLineChart data={dailyRevenue} />
            </div>

            {/* Revenue Breakdown */}
            <div className="rounded-card border border-hairline bg-surface p-6 shadow-soft">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-base font-bold text-ink">Revenue Breakdown</h2>
                        <p className="text-xs text-ink-soft">
                            See which categories or products generate the most revenue.
                        </p>
                    </div>

                    <div className="flex rounded-lg border border-hairline p-1">
                        <button
                            type="button"
                            onClick={() => setBreakdown("category")}
                            className={`rounded-md px-4 py-2 text-xs font-bold ${breakdown === "category" ? "bg-brand text-white" : "text-ink-soft"
                                }`}
                        >
                            Category
                        </button>
                        <button
                            type="button"
                            onClick={() => setBreakdown("product")}
                            className={`rounded-md px-4 py-2 text-xs font-bold ${breakdown === "product" ? "bg-brand text-white" : "text-ink-soft"
                                }`}
                        >
                            Products
                        </button>
                    </div>
                </div>

                <div className="mt-6">
                    {breakdown === "category" ? (
                        <RevenueBarChart
                            data={categoryRevenue.map((i) => ({
                                name: i.category,
                                revenue: i.revenue,
                            }))}
                        />
                    ) : (
                        <RevenueBarChart
                            data={productRevenue.map((i) => ({
                                name: i.product,
                                revenue: i.revenue,
                            }))}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-card border border-hairline bg-surface p-5 shadow-soft">
            <p className="text-xs font-medium text-ink-soft">{label}</p>
            <p className="mt-2 text-2xl font-bold tracking-tight text-ink">{value}</p>
        </div>
    );
}

/* -------------------------------- */
/* Revenue Line Chart */
/* -------------------------------- */

function RevenueLineChart({
    data,
}: {
    data: { date: string; label: string; revenue: number }[];
}) {
    if (data.length === 0) {
        return (
            <div className="flex h-64 items-center justify-center">
                <p className="text-sm text-ink-soft">No sales data available.</p>
            </div>
        );
    }

    const maxRevenue = Math.max(...data.map((i) => i.revenue), 1);
    const width = 900;
    const height = 300;
    const paddingLeft = 55;
    const paddingRight = 20;
    const paddingTop = 20;
    const paddingBottom = 45;
    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    const points = data.map((item, index) => {
        const x =
            data.length === 1
                ? paddingLeft + chartWidth / 2
                : paddingLeft + (index / (data.length - 1)) * chartWidth;
        const y = paddingTop + chartHeight - (item.revenue / maxRevenue) * chartHeight;
        return { ...item, x, y };
    });

    const linePoints = points.map((p) => `${p.x},${p.y}`).join(" ");

    // Only show every Nth x-label if there are many days (e.g. year view)
    const labelStep = Math.max(1, Math.ceil(points.length / 12));

    return (
        <div className="w-full overflow-x-auto">
            <svg viewBox={`0 0 ${width} ${height}`} className="h-72 w-full min-w-[600px]">
                {[0, 25, 50, 75, 100].map((pct) => {
                    const y = paddingTop + chartHeight - (pct / 100) * chartHeight;
                    return (
                        <line
                            key={pct}
                            x1={paddingLeft}
                            x2={width - paddingRight}
                            y1={y}
                            y2={y}
                            stroke="currentColor"
                            className="text-hairline"
                            strokeWidth="1"
                        />
                    );
                })}

                {[0, 25, 50, 75, 100].map((pct) => {
                    const value = Math.round((maxRevenue * pct) / 100);
                    const y = paddingTop + chartHeight - (pct / 100) * chartHeight;
                    return (
                        <text
                            key={pct}
                            x={paddingLeft - 10}
                            y={y + 4}
                            textAnchor="end"
                            className="fill-ink-soft text-[10px]"
                        >
                            {Math.round(value / 1000)}k
                        </text>
                    );
                })}

                <polyline
                    points={linePoints}
                    fill="none"
                    stroke="currentColor"
                    className="text-brand"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {points.map((p) => (
                    <circle
                        key={p.date}
                        cx={p.x}
                        cy={p.y}
                        r="5"
                        fill="currentColor"
                        className="text-brand"
                    />
                ))}

                {points.map((p, i) => {
                    // For year view: only label every Nth point
                    if (i % labelStep !== 0 && i !== points.length - 1) return null;
                    return (
                        <text
                            key={`${p.date}-label`}
                            x={p.x}
                            y={height - 15}
                            textAnchor="middle"
                            className="fill-ink-soft text-[10px]"
                        >
                            {p.label}
                        </text>
                    );
                })}
            </svg>
        </div>
    );
}

/* -------------------------------- */
/* Revenue Bar Chart */
/* -------------------------------- */

function RevenueBarChart({
    data,
}: {
    data: { name: string; revenue: number }[];
}) {
    if (data.length === 0) {
        return (
            <div className="flex h-48 items-center justify-center">
                <p className="text-sm text-ink-soft">No revenue data available.</p>
            </div>
        );
    }

    const maxRevenue = Math.max(...data.map((i) => i.revenue), 1);

    return (
        <div className="space-y-5">
            {data.map((item) => {
                const percentage = (item.revenue / maxRevenue) * 100;
                return (
                    <div key={item.name}>
                        <div className="mb-1.5 flex items-center justify-between gap-4">
                            <span className="truncate text-sm font-semibold text-ink">
                                {item.name}
                            </span>
                            <span className="shrink-0 text-sm font-bold text-price">
                                Rs. {item.revenue.toLocaleString()}
                            </span>
                        </div>
                        <div className="h-3 overflow-hidden rounded-full bg-surface-warm">
                            <div
                                className="h-full rounded-full bg-brand transition-all duration-500"
                                style={{ width: `${percentage}%` }}
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}