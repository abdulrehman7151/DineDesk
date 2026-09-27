import React from "react";

const items = [
    { name: "Beef Patty", stock: 42, unit: "kg", threshold: 20, status: "In Stock" },
    { name: "Chicken Breast", stock: 8, unit: "kg", threshold: 15, status: "Low" },
    { name: "Mozzarella", stock: 24, unit: "kg", threshold: 10, status: "In Stock" },
    { name: "Tomato Sauce", stock: 6, unit: "L", threshold: 10, status: "Low" },
    { name: "Burger Buns", stock: 120, unit: "pcs", threshold: 50, status: "In Stock" },
    { name: "Lettuce", stock: 3, unit: "kg", threshold: 5, status: "Critical" },
    { name: "Parmesan Cheese", stock: 0, unit: "kg", threshold: 3, status: "Out" },
];

const tone: Record<string, string> = {
    "In Stock": "bg-success-bg text-success-text",
    "Low": "bg-surface-warm text-ink-soft",
    "Critical": "bg-brand-soft text-brand",
    "Out": "bg-brand text-white",
};

export default function AdminInventory() {
    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Inventory</h1>
                    <p className="mt-1 text-sm text-ink-soft">Track stock levels and low-stock alerts.</p>
                </div>
                <button className="rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-white shadow-soft transition hover:bg-brand-deep">
                    + Add Item
                </button>
            </div>

            {/* Alerts */}
            <div className="rounded-card border border-hairline bg-brand-soft p-5">
                <p className="text-sm font-bold text-brand">⚠ 2 items need restocking</p>
                <p className="mt-1 text-xs text-brand/80">Lettuce and Parmesan Cheese are below threshold.</p>
            </div>

            {/* List */}
            <div className="overflow-hidden rounded-card border border-hairline bg-surface shadow-soft">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-hairline text-left text-xs font-bold uppercase tracking-wider text-ink-muted">
                                <th className="px-6 py-3.5">Item</th>
                                <th className="px-6 py-3.5">Stock</th>
                                <th className="px-6 py-3.5">Threshold</th>
                                <th className="px-6 py-3.5">Status</th>
                                <th className="px-6 py-3.5" />
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((i) => (
                                <tr key={i.name} className="border-b border-hairline last:border-0 hover:bg-surface-tint">
                                    <td className="px-6 py-4 font-semibold text-ink">{i.name}</td>
                                    <td className="px-6 py-4 text-ink-soft">
                                        <span className="font-bold text-ink">{i.stock}</span> {i.unit}
                                    </td>
                                    <td className="px-6 py-4 text-ink-muted">{i.threshold} {i.unit}</td>
                                    <td className="px-6 py-4">
                                        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${tone[i.status]}`}>
                                            {i.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-xs font-bold text-brand hover:text-brand-deep">Update</button>
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