"use client";

import { useMemo, useState } from "react";

type Period = 7 | 30 | 90;

type AnalyticsOrder = {
    id: number;
    total: number;
    createdAt: string;
    orderItems: {
        productName: string;
        quantity: number;
        unitPrice: number;
        category: string;
    }[];
};

type Props = {
    orders: AnalyticsOrder[];
};

const PERIODS: { value: Period; label: string }[] = [
    { value: 7, label: "7 days" },
    { value: 30, label: "30 days" },
    { value: 90, label: "90 days" },
];

function getRange(period: Period, now = new Date()) {
    const end = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
    );
    const start = new Date(end);
    start.setUTCDate(start.getUTCDate() - period + 1);
    return { start, end };
}

function getDayKey(date: Date) {
    return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

function formatMoney(value: number) {
    return `Rs. ${Math.round(value).toLocaleString("en-PK")}`;
}

function formatDate(date: Date, options: Intl.DateTimeFormatOptions = {}) {
    return date.toLocaleDateString("en-PK", {
        timeZone: "UTC",
        month: "short",
        day: "numeric",
        ...options,
    });
}

function getDailyStats(orders: AnalyticsOrder[], period: Period) {
    const { start } = getRange(period);
    const days = Array.from({ length: period }, (_, index) => {
        const date = new Date(start);
        date.setUTCDate(start.getUTCDate() + index);
        return {
            key: getDayKey(date),
            date,
            revenue: 0,
            orders: 0,
        };
    });
    const dayMap = new Map(days.map((day) => [day.key, day]));

    for (const order of orders) {
        const day = dayMap.get(getDayKey(new Date(order.createdAt)));
        if (day) {
            day.revenue += order.total;
            day.orders += 1;
        }
    }

    return days;
}

function getRevenueBuckets(
    dailyStats: ReturnType<typeof getDailyStats>,
    period: Period
) {
    const groupSize = period === 7 ? 1 : period === 30 ? 5 : 7;

    return Array.from(
        { length: Math.ceil(dailyStats.length / groupSize) },
        (_, index) => {
            const days = dailyStats.slice(index * groupSize, (index + 1) * groupSize);
            const first = days[0];
            const last = days[days.length - 1];

            return {
                label:
                    groupSize === 1
                        ? formatDate(first.date)
                        : `${formatDate(first.date)}–${formatDate(last.date)}`,
                revenue: days.reduce((sum, day) => sum + day.revenue, 0),
                orders: days.reduce((sum, day) => sum + day.orders, 0),
            };
        }
    );
}

function getHourlyStats(orders: AnalyticsOrder[]) {
    const hours = Array.from({ length: 24 }, (_, hour) => ({
        hour,
        orders: 0,
    }));

    for (const order of orders) {
        hours[new Date(order.createdAt).getUTCHours()].orders += 1;
    }

    return hours
        .filter((entry) => entry.orders > 0)
        .sort((a, b) => b.orders - a.orders || a.hour - b.hour)
        .slice(0, 8);
}

function formatHour(hour: number) {
    const date = new Date(Date.UTC(2020, 0, 1, hour));
    return date.toLocaleTimeString("en-PK", {
        timeZone: "UTC",
        hour: "numeric",
        hour12: true,
    });
}

export default function AnalyticsClient({ orders }: Props) {
    const [period, setPeriod] = useState<Period>(7);

    const filteredOrders = useMemo(() => {
        const { start, end } = getRange(period);
        const endOfToday = new Date(end);
        endOfToday.setUTCHours(23, 59, 59, 999);

        return orders.filter((order) => {
            const date = new Date(order.createdAt);
            return date >= start && date <= endOfToday;
        });
    }, [orders, period]);

    const dailyStats = useMemo(
        () => getDailyStats(filteredOrders, period),
        [filteredOrders, period]
    );
    const buckets = useMemo(
        () => getRevenueBuckets(dailyStats, period),
        [dailyStats, period]
    );
    const peakHours = useMemo(
        () => getHourlyStats(filteredOrders),
        [filteredOrders]
    );

    const revenue = filteredOrders.reduce((sum, order) => sum + order.total, 0);
    const averageOrder = filteredOrders.length
        ? revenue / filteredOrders.length
        : 0;
    const bestDay = dailyStats.reduce(
        (best, day) => (day.revenue > best.revenue ? day : best),
        dailyStats[0]
    );

    const topItems = useMemo(() => {
        const totals = new Map<
            string,
            { quantity: number; revenue: number }
        >();

        for (const order of filteredOrders) {
            for (const item of order.orderItems) {
                const current = totals.get(item.productName) ?? {
                    quantity: 0,
                    revenue: 0,
                };
                current.quantity += item.quantity;
                current.revenue += item.quantity * item.unitPrice;
                totals.set(item.productName, current);
            }
        }

        return Array.from(totals, ([name, values]) => ({ name, ...values }))
            .sort((a, b) => b.quantity - a.quantity || b.revenue - a.revenue)
            .slice(0, 8);
    }, [filteredOrders]);

    const categories = useMemo(() => {
        const totals = new Map<string, number>();

        for (const order of filteredOrders) {
            for (const item of order.orderItems) {
                totals.set(
                    item.category,
                    (totals.get(item.category) ?? 0) +
                        item.quantity * item.unitPrice
                );
            }
        }

        return Array.from(totals, ([name, amount]) => ({ name, amount })).sort(
            (a, b) => b.amount - a.amount
        );
    }, [filteredOrders]);

    const maxBucketRevenue = Math.max(...buckets.map((bucket) => bucket.revenue), 1);
    const maxHourOrders = Math.max(...peakHours.map((hour) => hour.orders), 1);
    const maxItemQuantity = Math.max(...topItems.map((item) => item.quantity), 1);
    const maxCategoryRevenue = Math.max(
        ...categories.map((category) => category.amount),
        1
    );
    const categoryRevenueTotal = categories.reduce(
        (sum, category) => sum + category.amount,
        0
    );

    return (
        <div className="space-y-6">
            <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
                    <p className="mt-1 text-sm text-ink-soft">
                        Sales and menu performance from served orders.
                    </p>
                </div>
                <div
                    className="flex w-fit gap-1 rounded-full border border-hairline bg-surface p-1"
                    aria-label="Analytics date range"
                >
                    {PERIODS.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            aria-pressed={period === option.value}
                            onClick={() => setPeriod(option.value)}
                            className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                                period === option.value
                                    ? "bg-brand text-white shadow-soft"
                                    : "text-ink-soft hover:bg-surface-tint hover:text-ink"
                            }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </header>

            <section
                className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
                aria-label="Sales summary"
            >
                <SummaryCard label="Revenue" value={formatMoney(revenue)} />
                <SummaryCard
                    label="Served orders"
                    value={filteredOrders.length.toLocaleString()}
                />
                <SummaryCard label="Average order" value={formatMoney(averageOrder)} />
                <SummaryCard
                    label="Best sales day"
                    value={
                        revenue > 0
                            ? formatDate(bestDay.date, { weekday: "short" })
                            : "—"
                    }
                    detail={
                        revenue > 0
                            ? `${formatDate(bestDay.date)} · ${formatMoney(bestDay.revenue)}`
                            : "No served orders in this period"
                    }
                />
            </section>

            <section className="rounded-card border border-hairline bg-surface p-5 shadow-soft sm:p-6">
                <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <h2 className="text-base font-bold text-ink">Revenue and order trend</h2>
                        <p className="mt-1 text-xs text-ink-soft">
                            {period === 90
                                ? "Revenue grouped by week"
                                : period === 30
                                  ? "Revenue grouped into 5-day periods"
                                  : "Revenue by day"}
                        </p>
                    </div>
                    <p className="text-xs font-semibold text-ink-soft">
                        {formatDate(dailyStats[0].date)} –{" "}
                        {formatDate(dailyStats[dailyStats.length - 1].date, {
                            year: "numeric",
                        })}
                    </p>
                </div>
                {filteredOrders.length > 0 ? (
                    <>
                        <div
                            role="img"
                            aria-label="Revenue chart; each bar shows revenue and order count for its date range"
                            className="flex h-56 items-end gap-2 overflow-x-auto border-b border-hairline pb-2 sm:gap-3"
                        >
                            {buckets.map((bucket) => (
                                <div
                                    key={bucket.label}
                                    title={`${bucket.label}: ${formatMoney(bucket.revenue)}, ${bucket.orders} orders`}
                                    className="flex h-full min-w-8 flex-1 flex-col items-center justify-end gap-2"
                                >
                                    <span className="text-[9px] font-semibold text-ink-muted">
                                        {bucket.orders}
                                    </span>
                                    <div className="flex h-[78%] w-full items-end">
                                        <div
                                            className="mx-auto w-3/4 min-w-2 rounded-t-md bg-brand transition-all"
                                            style={{
                                                height: `${Math.max(
                                                    (bucket.revenue / maxBucketRevenue) * 100,
                                                    bucket.revenue > 0 ? 3 : 0
                                                )}%`,
                                            }}
                                        />
                                    </div>
                                    <span className="whitespace-nowrap text-[9px] font-medium text-ink-soft sm:text-[10px]">
                                        {bucket.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-ink-soft">
                            <span className="h-2.5 w-2.5 rounded-sm bg-brand" />
                            Revenue
                            <span className="ml-auto">Order count above each bar</span>
                        </div>
                    </>
                ) : (
                    <EmptyState message="No served orders in this date range yet." />
                )}
            </section>

            <div className="grid gap-6 xl:grid-cols-2">
                <section className="rounded-card border border-hairline bg-surface p-5 shadow-soft sm:p-6">
                    <div className="mb-5">
                        <h2 className="text-base font-bold text-ink">Busiest hours</h2>
                        <p className="mt-1 text-xs text-ink-soft">
                            Number of served orders by order time
                        </p>
                    </div>
                    {peakHours.length ? (
                        <div className="space-y-3">
                            {peakHours.map((entry) => (
                                <div
                                    key={entry.hour}
                                    className="flex items-center gap-3"
                                >
                                    <span className="w-14 text-xs font-semibold text-ink-soft">
                                        {formatHour(entry.hour)}
                                    </span>
                                    <div
                                        className="h-2 flex-1 overflow-hidden rounded-full bg-surface-warm"
                                        role="progressbar"
                                        aria-label={`${formatHour(entry.hour)} orders`}
                                        aria-valuenow={entry.orders}
                                        aria-valuemin={0}
                                        aria-valuemax={maxHourOrders}
                                    >
                                        <div
                                            className="h-full rounded-full bg-brand"
                                            style={{
                                                width: `${(entry.orders / maxHourOrders) * 100}%`,
                                            }}
                                        />
                                    </div>
                                    <span className="w-16 text-right text-xs font-bold text-ink-soft">
                                        {entry.orders}{" "}
                                        {entry.orders === 1 ? "order" : "orders"}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <EmptyState message="There is no hourly order data for this period." />
                    )}
                </section>

                <section className="rounded-card border border-hairline bg-surface p-5 shadow-soft sm:p-6">
                    <div className="mb-5">
                        <h2 className="text-base font-bold text-ink">Best-selling items</h2>
                        <p className="mt-1 text-xs text-ink-soft">
                            Ranked by quantity sold · revenue shown per item
                        </p>
                    </div>
                    {topItems.length ? (
                        <div className="space-y-4">
                            {topItems.map((item, index) => (
                                <div key={item.name}>
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex min-w-0 items-center gap-2.5">
                                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-surface-tint text-[10px] font-bold text-ink-soft">
                                                {index + 1}
                                            </span>
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-semibold text-ink">
                                                    {item.name}
                                                </p>
                                                <p className="text-[11px] text-ink-muted">
                                                    {item.quantity} sold
                                                </p>
                                            </div>
                                        </div>
                                        <span className="shrink-0 text-xs font-bold text-price">
                                            {formatMoney(item.revenue)}
                                        </span>
                                    </div>
                                    <div className="ml-9 mt-2 h-1.5 overflow-hidden rounded-full bg-surface-warm">
                                        <div
                                            className="h-full rounded-full bg-brand"
                                            style={{
                                                width: `${(item.quantity / maxItemQuantity) * 100}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <EmptyState message="No item sales in this date range yet." />
                    )}
                </section>
            </div>

            <section className="rounded-card border border-hairline bg-surface p-5 shadow-soft sm:p-6">
                <div className="mb-5">
                    <h2 className="text-base font-bold text-ink">Revenue by category</h2>
                    <p className="mt-1 text-xs text-ink-soft">
                        Item revenue from served orders in the selected period
                    </p>
                </div>
                {categories.length ? (
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        {categories.map((category) => (
                            <div
                                key={category.name}
                                className="rounded-xl border border-hairline bg-surface-tint p-4"
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <p className="truncate text-xs font-semibold text-ink-soft">
                                        {category.name}
                                    </p>
                                    <p className="shrink-0 text-sm font-bold text-ink">
                                        {formatMoney(category.amount)}
                                    </p>
                                </div>
                                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-warm">
                                    <div
                                        className="h-full rounded-full bg-brand"
                                        style={{
                                            width: `${(category.amount / maxCategoryRevenue) * 100}%`,
                                        }}
                                    />
                                </div>
                                <p className="mt-2 text-[10px] font-bold uppercase tracking-wide text-brand">
                                    {categoryRevenueTotal
                                        ? `${Math.round((category.amount / categoryRevenueTotal) * 100)}% of item revenue`
                                        : "0% of item revenue"}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <EmptyState message="No category sales in this date range yet." />
                )}
            </section>
        </div>
    );
}

function SummaryCard({
    label,
    value,
    detail,
}: {
    label: string;
    value: string;
    detail?: string;
}) {
    return (
        <div className="rounded-card border border-hairline bg-surface p-5 shadow-soft">
            <p className="text-xs font-medium text-ink-soft">{label}</p>
            <p className="mt-2 text-2xl font-bold tracking-tight text-ink">
                {value}
            </p>
            {detail && <p className="mt-1 text-[11px] text-ink-muted">{detail}</p>}
        </div>
    );
}

function EmptyState({ message }: { message: string }) {
    return (
        <p className="rounded-xl border border-dashed border-hairline bg-surface-tint px-4 py-8 text-center text-sm text-ink-soft">
            {message}
        </p>
    );
}
