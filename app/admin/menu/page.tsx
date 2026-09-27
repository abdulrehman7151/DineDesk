import React from "react";

const items = [
    { name: "Classic Beef Burger", category: "Burgers", price: 850, available: true, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400" },
    { name: "Grilled Chicken Burger", category: "Burgers", price: 750, available: true, image: "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=400" },
    { name: "Pepperoni Pizza", category: "Pizza", price: 1200, available: true, image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400" },
    { name: "Margherita Pizza", category: "Pizza", price: 950, available: false, image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400" },
    { name: "Chicken Alfredo", category: "Pasta", price: 1100, available: true, image: "https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=400" },
    { name: "Fresh Lemonade", category: "Drinks", price: 350, available: true, image: "https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=400" },
];

export default function AdminMenu() {
    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Menu</h1>
                    <p className="mt-1 text-sm text-ink-soft">Manage your restaurant menu items.</p>
                </div>
                <button className="rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-white shadow-soft transition hover:bg-brand-deep">
                    + Add Item
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3 rounded-card border border-hairline bg-surface p-4 shadow-soft">
                <input
                    type="text"
                    placeholder="Search items..."
                    className="flex-1 min-w-[200px] rounded-full border border-hairline bg-surface-tint px-4 py-2.5 text-sm text-ink outline-none transition placeholder:text-ink-muted focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand-soft"
                />
                <select className="rounded-full border border-hairline bg-surface-tint px-4 py-2.5 text-sm font-medium text-ink outline-none">
                    <option>All categories</option>
                    <option>Burgers</option>
                    <option>Pizza</option>
                    <option>Pasta</option>
                    <option>Drinks</option>
                </select>
                <select className="rounded-full border border-hairline bg-surface-tint px-4 py-2.5 text-sm font-medium text-ink outline-none">
                    <option>All status</option>
                    <option>Available</option>
                    <option>Unavailable</option>
                </select>
            </div>

            {/* Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => (
                    <div key={item.name} className="overflow-hidden rounded-card border border-hairline bg-surface p-3 shadow-soft transition hover:shadow-lift">
                        <div className="relative">
                            <img src={item.image} alt={item.name} className="h-40 w-full rounded-2xl object-cover" />
                            <span className={`absolute left-4 top-4 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${item.available ? "bg-success-bg text-success-text" : "bg-brand-soft text-brand"
                                }`}>
                                {item.available ? "Available" : "Hidden"}
                            </span>
                        </div>

                        <div className="px-2 pb-2 pt-4">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <h3 className="font-bold text-ink">{item.name}</h3>
                                    <p className="mt-0.5 text-xs text-ink-muted">{item.category}</p>
                                </div>
                                <span className="text-sm font-bold text-price">Rs. {item.price}</span>
                            </div>

                            <div className="mt-4 flex gap-2">
                                <button className="flex-1 rounded-full border border-hairline bg-surface-tint py-2 text-xs font-bold text-ink transition hover:border-brand hover:text-brand">
                                    Edit
                                </button>
                                <button className="flex-1 rounded-full bg-brand py-2 text-xs font-bold text-white transition hover:bg-brand-deep">
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}