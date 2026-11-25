"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { getMenuItems } from "@/services/MenuServices";
import DeleteMenuButton from "@/components/DeleteMenuButton";

type MenuItem = Awaited<ReturnType<typeof getMenuItems>>[number];

export default function MenuClient({ items }: { items: MenuItem[] }) {
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All categories");
    const [status, setStatus] = useState("All status");

    // Categories come from the menu itself, so the filter list can never
    // drift out of sync with the categories actually in use.
    const categories = useMemo(
        () => [
            "All categories",
            ...Array.from(new Set(items.map((item) => item.category))),
        ],
        [items]
    );

    const filteredItems = useMemo(() => {
        const query = search.trim().toLowerCase();
        return items.filter((item) => {
            if (query && !item.ProductName.toLowerCase().includes(query)) {
                return false;
            }
            if (category !== "All categories" && item.category !== category) {
                return false;
            }
            if (status === "Available" && !item.isAvailable) return false;
            if (status === "Unavailable" && item.isAvailable) return false;
            return true;
        });
    }, [items, search, category, status]);

    return (
        <>
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3 rounded-card border border-hairline bg-surface p-4 shadow-soft">
                <input
                    type="text"
                    placeholder="Search items..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    className="flex-1 min-w-[200px] rounded-full border border-hairline bg-surface-tint px-4 py-2.5 text-sm text-ink outline-none transition placeholder:text-ink-muted focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand-soft"
                />
                <select
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                    className="rounded-full border border-hairline bg-surface-tint px-4 py-2.5 text-sm font-medium text-ink outline-none"
                >
                    {categories.map((option) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </select>
                <select
                    value={status}
                    onChange={(event) => setStatus(event.target.value)}
                    className="rounded-full border border-hairline bg-surface-tint px-4 py-2.5 text-sm font-medium text-ink outline-none"
                >
                    <option>All status</option>
                    <option>Available</option>
                    <option>Unavailable</option>
                </select>
            </div>

            {/* Grid */}
            {filteredItems.length === 0 ? (
                <div className="rounded-card border border-hairline bg-surface-tint p-10 text-center">
                    <p className="text-sm text-ink-soft">
                        {items.length === 0
                            ? "No menu items yet. Add your first item to get started."
                            : "No items match these filters."}
                    </p>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredItems.map((item) => {
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
                                            Starting From Rs. {startingPrice}
                                        </span>
                                    </div>

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
                                        <Link
                                            href={`/admin/menu/edititem?id=${item.id}`}
                                            className="flex-1 rounded-full border border-hairline bg-surface-tint py-2 text-xs font-bold text-ink transition hover:border-brand hover:text-brand text-center"
                                        >
                                            Edit
                                        </Link>
                                        <DeleteMenuButton
                                            id={item.id}
                                            itemName={item.ProductName}
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </>
    );
}
