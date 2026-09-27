import React from "react";

const dailySales = [
    { day: "Mon", value: 62000 },
    { day: "Tue", value: 74000 },
    { day: "Wed", value: 58000 },
    { day: "Thu", value: 91000 },
    { day: "Fri", value: 112000 },
    { day: "Sat", value: 128000 },
    { day: "Sun", value: 98000 },
];

const max = Math.max(...dailySales.map((d) => d.value));

export default function AdminSales() {
    return (
        <div className="space-y-6">

            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Sales</h1>
                <p className="mt-1 text-sm text-ink-soft">Revenue overview for the last 7 days.</p>
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

            {/* Bar chart */}
            <div className="rounded-card border border-hairline bg-surface p-6 shadow-soft">
                <div className="mb-5 flex items-center justify-between">
                    <div>
                        <h2 className="text-base font-bold text-ink">Daily Revenue</h2>
                        <p className="text-xs text-ink-soft">Last 7 days</p>
                    </div>
                    <span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-bold text-brand">
                        +18.2% this week
                    </span>
                </div>

                <div className="flex h-56 items-end justify-between gap-3">
                    {dailySales.map((d) => (
                        <div key={d.day} className="flex flex-1 flex-col items-center gap-2">
                            <span className="text-[10px] font-semibold text-ink-soft">
                                {Math.round(d.value / 1000)}k
                            </span>
                            <div
                                className="w-full rounded-t-xl bg-brand transition hover:bg-brand-deep"
                                style={{ height: `${(d.value / max) * 100}%` }}
                            />
                            <span className="text-xs font-bold text-ink-soft">{d.day}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Breakdown */}
            <div className="rounded-card border border-hairline bg-surface p-6 shadow-soft">
                <h2 className="text-base font-bold text-ink">Payment Methods</h2>
                <p className="text-xs text-ink-soft">How customers paid this week</p>

                <div className="mt-5 space-y-4">
                    {[
                        { name: "Cash", pct: 45, amount: "Rs. 280,350" },
                        { name: "Card", pct: 38, amount: "Rs. 236,740" },
                        { name: "Mobile Wallet", pct: 17, amount: "Rs. 105,910" },
                    ].map((p) => (
                        <div key={p.name}>
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-semibold text-ink">{p.name}</span>
                                <span className="font-bold text-price">{p.amount}</span>
                            </div>
                            <div className="mt-1.5 flex items-center gap-3">
                                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-warm">
                                    <div
                                        className="h-full rounded-full bg-brand"
                                        style={{ width: `${p.pct}%` }}
                                    />
                                </div>
                                <span className="w-8 text-right text-xs font-bold text-ink-soft">{p.pct}%</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Top Categories */}
            <div className="rounded-card border border-hairline bg-surface p-6 shadow-soft">
                <h2 className="text-base font-bold text-ink">Revenue by Category</h2>
                <p className="text-xs text-ink-soft">Where the money came from this week</p>

                <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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