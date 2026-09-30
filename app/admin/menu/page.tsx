import Link from "next/link";
import { redirect } from "next/navigation";
import { getUserFromToken } from "@/lib/authtoke";
import { getMenuItems } from "@/services/MenuServices";

export default async function AdminMenu() {
    const user = await getUserFromToken();

    if (!user) {
        redirect("/signin");
    }

    const items = await getMenuItems(user.restaurantId);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Menu</h1>
                    <p className="mt-1 text-sm text-ink-soft">
                        Manage your restaurant menu items.
                    </p>
                </div>

                <Link
                    href="/admin/menu/additems"
                    className="rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-white shadow-soft transition hover:bg-brand-deep"
                >
                    + Add Item
                </Link>
            </div>

            {/* Filters (visual only for now) */}
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
            {items.length === 0 ? (
                <div className="rounded-card border border-hairline bg-surface-tint p-10 text-center">
                    <p className="text-sm text-ink-soft">
                        No menu items yet. Add your first item to get started.
                    </p>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((item) => {
                        // If item has sizes, show cheapest size as starting price
                        const startingPrice =
                            item.basePrice ??
                            (item.sizes.length > 0
                                ? Math.min(...item.sizes.map((s) => s.price))
                                : 0);

                        return (
                            <div
                                key={item.id}
                                className="overflow-hidden rounded-card border border-hairline bg-surface p-3 shadow-soft transition hover:shadow-lift"
                            >
                                <div className="relative">
                                    <img
                                        src={item.imageUrl ?? "/placeholder.png"}
                                        alt={item.ProductName}
                                        className="h-40 w-full rounded-2xl object-cover"
                                    />
                                    <span
                                        className={`absolute left-4 top-4 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${item.isAvailable
                                                ? "bg-success-bg text-success-text"
                                                : "bg-brand-soft text-brand"
                                            }`}
                                    >
                                        {item.isAvailable ? "Available" : "Hidden"}
                                    </span>
                                </div>

                                <div className="px-2 pb-2 pt-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <h3 className="font-bold text-ink">
                                                {item.ProductName}
                                            </h3>
                                            <p className="mt-0.5 text-xs text-ink-muted">
                                                {item.category}
                                            </p>
                                        </div>
                                        <span className="text-sm font-bold text-price">
                                            Rs. {startingPrice}
                                        </span>
                                    </div>

                                    {/* Size chips (if any) */}
                                    {item.sizes.length > 0 && (
                                        <div className="mt-2 flex flex-wrap gap-1">
                                            {item.sizes.map((s) => (
                                                <span
                                                    key={s.id}
                                                    className="rounded-full bg-surface-tint px-2 py-0.5 text-[10px] font-semibold text-ink-soft"
                                                >
                                                    {s.Size} · Rs. {s.price}
                                                </span>
                                            ))}
                                        </div>
                                    )}

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
                        );
                    })}
                </div>
            )}
        </div>
    );
}