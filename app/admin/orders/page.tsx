import React from "react";

const orders = [
    { id: "#1042", table: 12, items: 3, total: 2450, status: "Preparing", time: "2 min ago" },
    { id: "#1041", table: 8, items: 5, total: 3120, status: "Served", time: "12 min ago" },
    { id: "#1040", table: 3, items: 2, total: 890, status: "Pending", time: "1 min ago" },
    { id: "#1039", table: 17, items: 4, total: 2100, status: "Served", time: "28 min ago" },
    { id: "#1038", table: 5, items: 6, total: 4280, status: "Preparing", time: "5 min ago" },
    { id: "#1037", table: 9, items: 3, total: 1650, status: "Completed", time: "1 hr ago" },
];

const statusTone: Record<string, string> = {
    Pending: "bg-surface-warm text-ink-soft",
    Preparing: "bg-brand-soft text-brand",
    Served: "bg-success-bg text-success-text",
    Completed: "bg-surface-tint text-ink-soft",
};

export default function AdminOrders() {
    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
                    <p className="mt-1 text-sm text-ink-soft">Track and manage incoming orders.</p>
                </div>
                <button className="rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-white shadow-soft transition hover:bg-brand-deep">
                    + New Order
                </button>
            </div>

            {/* Filter tabs */}
            <div className="flex flex-wrap gap-2">
                {["All", "Pending", "Preparing", "Served", "Completed"].map((tab, i) => (
                    <button
                        key={tab}
                        className={`rounded-full px-4 py-2 text-sm font-semibold transition ${i === 0
                                ? "bg-brand text-white shadow-soft"
                                : "border border-hairline bg-surface text-ink-soft hover:text-ink"
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-card border border-hairline bg-surface shadow-soft">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-hairline text-left text-xs font-bold uppercase tracking-wider text-ink-muted">
                                <th className="px-6 py-3.5">Order ID</th>
                                <th className="px-6 py-3.5">Table</th>
                                <th className="px-6 py-3.5">Items</th>
                                <th className="px-6 py-3.5">Total</th>
                                <th className="px-6 py-3.5">Time</th>
                                <th className="px-6 py-3.5">Status</th>
                                <th className="px-6 py-3.5" />
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((o) => (
                                <tr key={o.id} className="border-b border-hairline last:border-0 hover:bg-surface-tint">
                                    <td className="px-6 py-4 font-semibold text-ink">{o.id}</td>
                                    <td className="px-6 py-4 text-ink-soft">Table {o.table}</td>
                                    <td className="px-6 py-4 text-ink-soft">{o.items} items</td>
                                    <td className="px-6 py-4 font-bold text-price">Rs. {o.total.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-ink-muted">{o.time}</td>
                                    <td className="px-6 py-4">
                                        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusTone[o.status]}`}>
                                            {o.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-xs font-bold text-brand hover:text-brand-deep">View</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}