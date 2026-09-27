import React from "react";

const weekly = [
    { day: "Mon", orders: 78, revenue: 62000 },
    { day: "Tue", orders: 92, revenue: 74000 },
    { day: "Wed", orders: 71, revenue: 58000 },
    { day: "Thu", orders: 114, revenue: 91000 },
    { day: "Fri", orders: 138, revenue: 112000 },
    { day: "Sat", orders: 156, revenue: 128000 },
    { day: "Sun", orders: 122, revenue: 98000 },
];

const maxRevenue = Math.max(...weekly.map((d) => d.revenue));

const peakHours = [
    { hour: "12 PM", pct: 42 },
    { hour: "1 PM", pct: 68 },
    { hour: "2 PM", pct: 54 },
    { hour: "6 PM", pct: 38 },
    { hour: "7 PM", pct: 76 },
    { hour: "8 PM", pct: 92 },
    { hour: "9 PM", pct: 84 },
    { hour: "10 PM", pct: 56 },
];

const topItems = [
    { name: "Classic Beef Burger", sold: 142, revenue: "Rs. 120,700", pct: 92 },
    { name: "Pepperoni Pizza", sold: 118, revenue: "Rs. 141,600", pct: 76 },
    { name: "Chicken Alfredo", sold: 96, revenue: "Rs. 105,600", pct: 62 },
    { name: "Margherita Pizza", sold: 74, revenue: "Rs. 70,300", pct: 48 },
    { name: "Crispy Chicken Wings", sold: 68, revenue: "Rs. 44,200", pct: 44 },
];

export default function AdminAnalytics() {
    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
                    <p className="mt-1 text-sm text-ink-soft">Performance insights across your menu and orders.</p>
                </div>

                <div className="flex gap-2">
                    {["7 days", "30 days", "90 days"].map((range, i) => (
                        <button
                            key={range}
                            className={`rounded-full px-4 py-2 text-xs font-bold transition ${i === 0
                                    ? "bg-brand text-white shadow-soft"
                                    : "border border-hairline bg-surface text-ink-soft hover:text-ink"
                                }`}
                        >
                            {range}
                        </button>
                    ))}
                </div>
            </div>

            {/* Summary */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                    { label: "Total Revenue", value: "Rs. 623,000" },
                    { label: "Total Orders", value: "612" },
                    { label: "Avg. Order", value: "Rs. 1,018" },
                    { label: "Top Day", value: "Saturday" },
                ].map((s) => (
                    <div key={s.label} className="rounded-card border border-hairline bg-surface p-5 shadow-soft">
                        <p className="text-xs font-medium text-ink-soft">{s.label}</p>
                        <p className="mt-2 text-2xl font-bold tracking-tight text-ink">{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Revenue vs Orders */}
            <div className="rounded-card border border-hairline bg-surface p-6 shadow-soft">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h2 className="text-base font-bold text-ink">Revenue & Orders</h2>
                        <p className="text-xs text-ink-soft">Weekly comparison</p>
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                        <span className="flex items-center gap-1.5 font-semibold text-ink-soft">
                            <span className="h-2.5 w-2.5 rounded-full bg-brand" /> Revenue
                        </span>
                        <span className="flex items-center gap-1.5 font-semibold text-ink-soft">
                            <span className="h-2.5 w-2.5 rounded-full bg-ink-muted" /> Orders
                        </span>
                    </div>
                </div>

                <div className="flex h-56 items-end justify-between gap-3">
                    {weekly.map((d) => (
                        <div key={d.day} className="flex flex-1 flex-col items-center gap-2">
                            <div className="flex w-full flex-1 items-end justify-center gap-1">
                                <div
                                    className="w-1/2 rounded-t-lg bg-brand transition hover:bg-brand-deep"
                                    style={{ height: `${(d.revenue / maxRevenue) * 100}%` }}
                                />
                                <div
                                    className="w-1/2 rounded-t-lg bg-ink-muted/40 transition hover:bg-ink-muted/60"
                                    style={{ height: `${(d.orders / 160) * 100}%` }}
                                />
                            </div>
                            <span className="text-xs font-bold text-ink-soft">{d.day}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Two column: Peak hours + Top items */}
            <div className="grid gap-6 lg:grid-cols-2">

                {/* Peak hours */}
                <div className="rounded-card border border-hairline bg-surface p-6 shadow-soft">
                    <div className="mb-5">
                        <h2 className="text-base font-bold text-ink">Peak Hours</h2>
                        <p className="text-xs text-ink-soft">Busiest times of the day</p>
                    </div>

                    <div className="space-y-3">
                        {peakHours.map((h) => (
                            <div key={h.hour} className="flex items-center gap-3">
                                <span className="w-14 text-xs font-semibold text-ink-soft">{h.hour}</span>
                                <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-warm">
                                    <div
                                        className="h-full rounded-full bg-brand"
                                        style={{ width: `${h.pct}%` }}
                                    />
                                </div>
                                <span className="w-8 text-right text-xs font-bold text-ink-soft">{h.pct}%</span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-5 rounded-xl bg-brand-soft px-4 py-3">
                        <p className="text-xs font-bold text-brand">
                            🔥 Peak: 8:00 PM — 9:00 PM
                        </p>
                        <p className="mt-0.5 text-[11px] text-brand/70">
                            Consider extra staff during this window.
                        </p>
                    </div>
                </div>

                {/* Top selling items */}
                <div className="rounded-card border border-hairline bg-surface p-6 shadow-soft">
                    <div className="mb-5">
                        <h2 className="text-base font-bold text-ink">Top Selling Items</h2>
                        <p className="text-xs text-ink-soft">Ranked by quantity sold</p>
                    </div>

                    <div className="space-y-4">
                        {topItems.map((item, i) => (
                            <div key={item.name}>
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-2.5">
                                        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-surface-tint text-[10px] font-bold text-ink-soft">
                                            {i + 1}
                                        </span>
                                        <div>
                                            <p className="text-sm font-semibold text-ink">{item.name}</p>
                                            <p className="text-[11px] text-ink-muted">{item.sold} sold</p>
                                        </div>
                                    </div>
                                    <span className="text-sm font-bold text-price">{item.revenue}</span>
                                </div>
                                <div className="mt-2 ml-9 h-1.5 overflow-hidden rounded-full bg-surface-warm">
                                    <div
                                        className="h-full rounded-full bg-brand"
                                        style={{ width: `${item.pct}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Order types */}
            <div className="rounded-card border border-hairline bg-surface p-6 shadow-soft">
                <div className="mb-5">
                    <h2 className="text-base font-bold text-ink">Order Types</h2>
                    <p className="text-xs text-ink-soft">Distribution across channels</p>
                </div>

                <div className="grid gap-6 sm:grid-cols-3">
                    {[
                        { name: "Dine-in", pct: 62, orders: 379 },
                        { name: "Takeaway", pct: 27, orders: 165 },
                        { name: "Delivery", pct: 11, orders: 68 },
                    ].map((t) => (
                        <div key={t.name} className="rounded-xl border border-hairline bg-surface-tint p-5">
                            <p className="text-xs font-medium text-ink-soft">{t.name}</p>
                            <p className="mt-2 text-3xl font-bold tracking-tight text-ink">{t.pct}%</p>
                            <p className="mt-1 text-xs text-ink-muted">{t.orders} orders</p>
                            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-warm">
                                <div className="h-full rounded-full bg-brand" style={{ width: `${t.pct}%` }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Category performance */}
            <div className="rounded-card border border-hairline bg-surface p-6 shadow-soft">
                <div className="mb-5">
                    <h2 className="text-base font-bold text-ink">Revenue by Category</h2>
                    <p className="text-xs text-ink-soft">Where your money came from this week</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                        { name: "Burgers", amount: "Rs. 187,000", pct: 30 },
                        { name: "Pizza", amount: "Rs. 156,000", pct: 25 },
                        { name: "Pasta", amount: "Rs. 124,600", pct: 20 },
                        { name: "Drinks", amount: "Rs. 155,400", pct: 25 },
                    ].map((c) => (
                        <div key={c.name} className="rounded-xl border border-hairline bg-surface-tint p-4">
                            <p className="text-xs font-medium text-ink-soft">{c.name}</p>
                            <p className="mt-1.5 text-lg font-bold text-ink">{c.amount}</p>
                            <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-brand">
                                {c.pct}% of total
                            </p>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}