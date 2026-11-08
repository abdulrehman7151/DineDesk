"use client";

import React, { useMemo, useState } from "react";
import { PlacingOrderAction } from "@/actions/orderAction";
import type { MenuItem, Restaurant } from "@/types/menu";
import ItemDetailModal from "@/components/ItemDetailModal";
import ViewOrderSheet from "@/components/ViewOrderSheet";

type CartLine = {
    itemId: number;
    sizeId: number | null;
    quantity: number;
    note?: string;
};

type Props = {
    items: MenuItem[];
    restaurant: Restaurant;
    tableId: string | null;
    tableNumber: number | null;
};

const categories = [
    "All",
    "Breakfast",
    "Burgers",
    "Pizza",
    "Chicken",
    "Pasta",
    "Drinks",
    "Desserts",
];

export default function HomeClient({
    items,
    restaurant,
    tableId,
    tableNumber,
}: Props) {
    const [activeCategory, setActiveCategory] = useState("All");
    const [searchValue, setSearchValue] = useState("");

    // Modal state
    const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

    // View order sheet state
    const [isOrderOpen, setIsOrderOpen] = useState(false);

    // Order submission state
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const [orderError, setOrderError] = useState<string | null>(null);
    const [orderSuccess, setOrderSuccess] = useState(false);

    // Local cart
    const [cart, setCart] = useState<CartLine[]>([]);

    const availableItems = useMemo(
        () =>
            items.filter((item) => {
                if (!item.isAvailable) return false;

                const matchesCategory =
                    activeCategory === "All" ||
                    item.category === activeCategory;

                const matchesSearch = item.ProductName.toLowerCase().includes(
                    searchValue.toLowerCase()
                );

                return matchesCategory && matchesSearch;
            }),
        [items, activeCategory, searchValue]
    );

    const getStartingPrice = (item: MenuItem) => {
        if (item.basePrice != null) return item.basePrice;
        if (item.sizes.length > 0)
            return Math.min(...item.sizes.map((s) => s.price));
        return 0;
    };

    // =========================
    // Cart helpers
    // =========================
    const handleAddToCart = ({
        item,
        sizeId,
        quantity,
        note,
    }: {
        item: MenuItem;
        sizeId: number | null;
        quantity: number;
        note?: string;
    }) => {
        setCart((prev) => {
            const existing = prev.find(
                (l) => l.itemId === item.id && l.sizeId === sizeId
            );

            if (existing) {
                return prev.map((l) =>
                    l.itemId === item.id && l.sizeId === sizeId
                        ? {
                            ...l,
                            quantity: l.quantity + quantity,
                            note: note ?? l.note,
                        }
                        : l
                );
            }

            return [...prev, { itemId: item.id, sizeId, quantity, note }];
        });

        setOrderError(null);
        setOrderSuccess(false);
    };

    const handleChangeQuantity = (
        itemId: number,
        sizeId: number | null,
        delta: number
    ) => {
        setCart((prev) =>
            prev
                .map((l) =>
                    l.itemId === itemId && l.sizeId === sizeId
                        ? { ...l, quantity: l.quantity + delta }
                        : l
                )
                .filter((l) => l.quantity > 0)
        );
    };

    const handleRemoveLine = (itemId: number, sizeId: number | null) => {
        setCart((prev) =>
            prev.filter(
                (l) => !(l.itemId === itemId && l.sizeId === sizeId)
            )
        );
    };

    // =========================
    // Place order
    // =========================
    const handlePlaceOrder = async () => {
        if (cart.length === 0 || isPlacingOrder) return;
        if (tableId === null) {
            setOrderError("Scan the QR code at your table to place an order.");
            return;
        }

        setIsPlacingOrder(true);
        setOrderError(null);
        setOrderSuccess(false);

        try {
            const result = await PlacingOrderAction(
                cart,
                restaurant.slug,
                tableId
            );

            if (!result.success) {
                setOrderError(result.message);
                return;
            }

            setCart([]);
            setOrderSuccess(true);
            setIsOrderOpen(false);

            setTimeout(() => setOrderSuccess(false), 4000);
        } catch (error) {
            console.error("Unexpected order error:", error);
            setOrderError("Something went wrong. Please try again.");
        } finally {
            setIsPlacingOrder(false);
        }
    };

    const cartCount = cart.reduce((sum, l) => sum + l.quantity, 0);

    const cartTotal = cart.reduce((sum, line) => {
        const item = items.find((i) => i.id === line.itemId);
        if (!item) return sum;

        const size = line.sizeId
            ? item.sizes.find((s) => s.id === line.sizeId)
            : null;

        const price = size?.price ?? item.basePrice ?? 0;
        return sum + price * line.quantity;
    }, 0);

    return (
        <main className="min-h-screen bg-surface text-ink">
            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-hairline bg-surface/85 backdrop-blur-md">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-brand">
                            DineDesk
                        </h1>
                        <p className="text-xs text-ink-soft">
                            Order directly from your table
                        </p>
                    </div>

                    <div className="flex items-center gap-2 rounded-full border border-hairline bg-surface py-1.5 pl-3 pr-1.5 shadow-soft">
                        <span className="text-xs text-ink-soft">Table</span>
                        <span className="flex min-h-7 min-w-7 items-center justify-center rounded-full bg-brand px-2 text-xs font-bold text-white">
                            {tableNumber ?? "—"}
                        </span>
                    </div>
                </div>
            </header>

            <div className="mx-auto max-w-7xl px-4 pb-32 sm:px-6 lg:px-8">
                {/* Hero */}
                <section className="py-6">
                    <div className="relative overflow-hidden rounded-card bg-surface-dark p-7 shadow-soft sm:p-9">
                        <div className="relative z-10">
                            <p className="text-sm font-semibold text-brand-soft/80">
                                Welcome to
                            </p>
                            <h2 className="mt-1 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                                {restaurant.name}
                            </h2>
                            <p className="mt-2 max-w-xl text-sm leading-6 text-white/70">
                                Explore our menu and order your favorite dishes
                                directly from your table.
                            </p>

                            <div className="mt-5 flex flex-wrap gap-2">
                                <span className="rounded-full bg-success-bg px-3 py-1.5 text-xs font-bold text-success-text">
                                    ● Open · until 11 PM
                                </span>
                                <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white backdrop-blur">
                                    📍 {restaurant.city} · {restaurant.address}
                                </span>
                            </div>
                        </div>

                        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brand/40 blur-3xl" />
                        <div className="absolute -bottom-20 right-24 h-48 w-48 rounded-full bg-brand/25 blur-3xl" />
                    </div>
                </section>

                {/* Search */}
                <section className="mt-2">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search for food or drinks..."
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            className="w-full rounded-full border border-hairline bg-surface py-3.5 pl-12 pr-4 text-sm text-ink shadow-soft outline-none transition placeholder:text-ink-muted focus:border-brand focus:ring-4 focus:ring-brand-soft"
                        />
                        <svg
                            className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-muted"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="m21 21-4.35-4.35m2.35-5.65a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z"
                            />
                        </svg>
                    </div>
                </section>

                {/* Categories */}
                <section className="mt-6">
                    <div className="flex gap-2.5 overflow-x-auto pb-2">
                        {categories.map((category) => {
                            const isActive = category === activeCategory;
                            return (
                                <button
                                    key={category}
                                    type="button"
                                    onClick={() => setActiveCategory(category)}
                                    className={`whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-semibold transition ${isActive
                                        ? "bg-brand text-white shadow-soft"
                                        : "border border-hairline bg-surface text-ink-soft shadow-soft hover:text-ink"
                                        }`}
                                >
                                    {category}
                                </button>
                            );
                        })}
                    </div>
                </section>

                {/* Menu grid */}
                <section className="mt-12">
                    <div className="mb-5">
                        <p className="text-sm font-semibold text-brand">
                            Explore our selection
                        </p>
                        <h3 className="mt-0.5 text-2xl font-bold tracking-tight">
                            {activeCategory === "All"
                                ? "Full Menu"
                                : activeCategory}
                        </h3>
                    </div>

                    {availableItems.length === 0 ? (
                        <div className="rounded-card border border-hairline bg-surface-tint p-10 text-center">
                            <p className="text-sm text-ink-soft">
                                No items available in this category yet.
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {availableItems.map((item) => (
                                <article
                                    key={item.id}
                                    className="group flex flex-col overflow-hidden rounded-card border border-hairline bg-surface p-3 shadow-soft transition hover:shadow-lift"
                                >
                                    <button
                                        type="button"
                                        onClick={() => setSelectedItem(item)}
                                        className="flex flex-1 flex-col text-left"
                                    >
                                        <div className="relative">
                                            <img
                                                src={
                                                    item.imageUrl ??
                                                    "/placeholder.png"
                                                }
                                                alt={item.ProductName}
                                                className="h-44 w-full rounded-2xl object-cover"
                                            />
                                            <span className="absolute left-4 top-4 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-ink backdrop-blur">
                                                {item.category}
                                            </span>
                                        </div>

                                        <div className="flex flex-1 flex-col px-2 pb-2 pt-4">
                                            <div className="flex items-start justify-between gap-3">
                                                <h4 className="font-bold text-ink">
                                                    {item.ProductName}
                                                </h4>
                                                <span className="whitespace-nowrap text-sm font-bold text-price">
                                                    Starts From Rs.{" "}
                                                    {getStartingPrice(item)}
                                                </span>
                                            </div>

                                            <p className="mt-2 line-clamp-2 text-sm leading-5 text-ink-soft">
                                                {item.description}
                                            </p>

                                            {item.sizes.length > 0 && (
                                                <div className="mt-2 flex flex-wrap gap-1">
                                                    {item.sizes.map((s) => (
                                                        <span
                                                            key={s.id}
                                                            className="rounded-full bg-surface-tint px-2 py-0.5 text-[10px] font-semibold text-ink-soft"
                                                        >
                                                            {s.Size} · Rs.{" "}
                                                            {s.price}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setSelectedItem(item)}
                                        className="mt-4 w-full rounded-full bg-brand py-2.5 text-sm font-bold text-white transition hover:bg-brand-deep"
                                    >
                                        + Add to Order
                                    </button>
                                </article>
                            ))}
                        </div>
                    )}
                </section>

                {/* Footer card */}
                <section className="mt-12 rounded-card bg-surface-dark p-7 text-center shadow-soft">
                    <h3 className="text-lg font-bold text-white">
                        {restaurant.name}
                    </h3>
                    <p className="mt-1.5 text-sm text-white/60">
                        Fresh food prepared with quality ingredients.
                    </p>
                    <div className="mt-5 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-white/70">
                        <span>Open 11:00 AM – 11:00 PM</span>
                        <span>
                            {restaurant.city} · {restaurant.address}
                        </span>
                        <span>{restaurant.phone}</span>
                    </div>
                </section>
            </div>

            {/* Success toast */}
            {orderSuccess && (
                <div className="fixed left-1/2 top-20 z-[80] -translate-x-1/2 rounded-full bg-success-bg px-5 py-3 text-sm font-bold text-success-text shadow-lift">
                    ✓ Order placed successfully!
                </div>
            )}

            {/* Cart bar */}
            <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-hairline bg-surface/85 p-3 backdrop-blur-md">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
                    <div>
                        <p className="text-xs text-ink-soft">Your Order</p>
                        <p className="font-bold text-ink">
                            {cartCount} item{cartCount === 1 ? "" : "s"} · Rs.{" "}
                            {cartTotal.toLocaleString()}
                        </p>
                    </div>
                    <button
                        type="button"
                        disabled={cartCount === 0 || isPlacingOrder}
                        onClick={() => setIsOrderOpen(true)}
                        className="flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-bold text-white shadow-soft transition hover:bg-brand-deep disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        View Order
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-bold text-brand">
                            {cartCount}
                        </span>
                    </button>
                </div>
            </div>

            {/* Item detail modal */}
            {selectedItem && (
                <ItemDetailModal
                    item={selectedItem}
                    onClose={() => setSelectedItem(null)}
                    onAdd={handleAddToCart}
                />
            )}

            {/* View order sheet */}
            <ViewOrderSheet
                isOpen={isOrderOpen}
                onClose={() => {
                    if (isPlacingOrder) return;
                    setIsOrderOpen(false);
                    setOrderError(null);
                }}
                items={items}
                cart={cart}
                onChangeQuantity={handleChangeQuantity}
                onRemove={handleRemoveLine}
                onPlaceOrder={handlePlaceOrder}
                isPlacingOrder={isPlacingOrder}
                errorMessage={orderError}
                tableNumber={tableNumber}
            />
        </main>
    );
}