"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { SubmitTableOrderAction } from "@/actions/tableOrderAction";
import OrderStatusTracker from "@/components/OrderStatusTracker";
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
    activeOrder: {
        id: number;
        status: "PENDING" | "PREPARING" | "READY" | "SERVED";
    } | null;
};

type TrackedOrder = {
    id: number;
    status: "PENDING" | "PREPARING" | "READY" | "SERVED";
    key: number;
};

// Opening/closing hours are stored as HH:MM (24-hour) strings.
// "23:00" -> "11 PM", "09:30" -> "9:30 AM".
function formatHour(time: string): string {
    const [h, m] = time.split(":").map(Number);
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    const ampm = h < 12 ? "AM" : "PM";
    return m === 0
        ? `${hour12} ${ampm}`
        : `${hour12}:${String(m).padStart(2, "0")} ${ampm}`;
}

// "09:00" -> "9:00 AM", "23:00" -> "11:00 PM".
function formatTime(time: string): string {
    const [h, m] = time.split(":").map(Number);
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    const ampm = h < 12 ? "AM" : "PM";
    return `${hour12}:${String(m).padStart(2, "0")} ${ampm}`;
}

// "09:00" -> 540 minutes after midnight. Null when unparseable.
function minutesOf(time: string): number | null {
    const [h, m] = time.split(":").map(Number);
    if (Number.isNaN(h) || Number.isNaN(m)) return null;
    return h * 60 + m;
}

// Is the restaurant open right now? Handles closing after midnight
// (e.g. open 18:00, close 02:00). Null when the hours are not set.
function isOpenNow(
    openingTime: string | null | undefined,
    closingTime: string | null | undefined,
    now: Date
): boolean | null {
    const open = openingTime ? minutesOf(openingTime) : null;
    const close = closingTime ? minutesOf(closingTime) : null;
    if (open === null || close === null) return null;
    const nowMin = now.getHours() * 60 + now.getMinutes();
    if (close <= open) return nowMin >= open || nowMin < close;
    return nowMin >= open && nowMin < close;
}

export default function HomeClient({
    items,
    restaurant,
    tableId,
    tableNumber,
    activeOrder,
}: Props) {
    const [activeCategory, setActiveCategory] = useState("All");
    const [searchValue, setSearchValue] = useState("");

    // Category pills come from the menu itself, so they always match the
    // categories actually in use (and the admin menu filters).
    const categories = useMemo(
        () => ["All", ...Array.from(new Set(items.map((item) => item.category)))],
        [items]
    );

    // Modal state
    const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

    // View order sheet state
    const [isOrderOpen, setIsOrderOpen] = useState(false);

    // Order submission state
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const [orderError, setOrderError] = useState<string | null>(null);
    const [orderSuccess, setOrderSuccess] = useState(false);
           const [successMessage, setSuccessMessage] = useState(
           "Order placed successfully!"
       );

       // The table's current order, shown in the status popup. SERVED is
       // included: the tab is still open, so a guest who reloads still
       // sees "Enjoy your meal!" and can add more items.
       const [tracked, setTracked] = useState<TrackedOrder | null>(
           activeOrder
               ? { id: activeOrder.id, status: activeOrder.status, key: 0 }
               : null
       );

    // Local cart
    const [cart, setCart] = useState<CartLine[]>([]);

    // Open-now status, refreshed every minute so "Open now" / "Closed"
    // never goes stale while the guest is looking at the menu.
    const [now, setNow] = useState(() => new Date());
    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 60_000);
        return () => clearInterval(timer);
    }, []);

    const openStatus: { open: boolean | null; text: string } = useMemo(() => {
        const open = isOpenNow(
            restaurant.openingTime,
            restaurant.closingTime,
            now
        );
        if (open === true && restaurant.openingTime && restaurant.closingTime) {
            return {
                open: true,
                text: `Open now · ${formatTime(restaurant.openingTime)} – ${formatTime(restaurant.closingTime)}`,
            };
        }
        if (open === false) {
            return {
                open: false,
                text: restaurant.openingTime
                    ? `Closed · Opens ${formatTime(restaurant.openingTime)}`
                    : "Closed",
            };
        }
        return {
            open: null,
            text: `Open · until ${
                restaurant.closingTime
                    ? formatHour(restaurant.closingTime)
                    : "11 PM"
            }`,
        };
    }, [restaurant.openingTime, restaurant.closingTime, now]);

    // Category slider: keep the active pill in view and drive the
    // chevron buttons / edge fades from the scroll position.
    const sliderRef = useRef<HTMLDivElement | null>(null);
    const pillRefs = useRef(new Map<string, HTMLButtonElement>());
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const updateSliderButtons = () => {
        const el = sliderRef.current;
        if (!el) return;
        setCanScrollLeft(el.scrollLeft > 4);
        setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    };

    useEffect(() => {
        updateSliderButtons();
        window.addEventListener("resize", updateSliderButtons);
        return () => window.removeEventListener("resize", updateSliderButtons);
    }, []);

    useEffect(() => {
        pillRefs.current
            .get(activeCategory)
            ?.scrollIntoView({
                behavior: "smooth",
                inline: "center",
                block: "nearest",
            });
    }, [activeCategory]);

    const scrollSlider = (direction: 1 | -1) => {
        sliderRef.current?.scrollBy({
            left: direction * 260,
            behavior: "smooth",
        });
    };

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
            // Creates a new order, or adds to the table's unserved order
            const result = await SubmitTableOrderAction(
                cart,
                restaurant.slug,
                tableId
            );

            if (!result.success) {
                setOrderError(result.message);
                return;
            }

            setCart([]);
            setSuccessMessage(
                result.mode === "added"
                    ? "Items added to your order!"
                    : "Order placed successfully!"
            );
            setOrderSuccess(true);
            setIsOrderOpen(false);

            // A new key restarts the status popup (it opens for 10 seconds)
            setTracked({
                id: result.orderId,
                status: result.status as TrackedOrder["status"],
                key: Date.now(),
            });

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
            {/* Sticky top: restaurant + search + categories. The whole
                block stays on screen while scrolling, so the guest never
                loses the restaurant, the search or the categories. */}
            <header className="sticky top-0 z-50 border-b border-hairline bg-surface/90 backdrop-blur-md">
                <div className="mx-auto max-w-7xl px-4 pb-3 pt-3.5 sm:px-6 lg:px-8">
                    {/* Restaurant row */}
                    <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                            <h1 className="truncate text-lg font-bold tracking-tight text-ink sm:text-xl">
                                {restaurant.name}
                            </h1>
                            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-ink-soft">
                                <span
                                    className={`h-2 w-2 shrink-0 rounded-full ${
                                        openStatus.open === true
                                            ? "animate-pulse bg-emerald-500"
                                            : openStatus.open === false
                                              ? "bg-brand"
                                              : "bg-amber-400"
                                    }`}
                                />
                                <span className="truncate">
                                    {openStatus.text}
                                </span>
                            </p>
                        </div>

                        <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-brand px-3.5 py-1.5 text-xs font-bold text-white shadow-soft">
                            Table {tableNumber ?? "—"}
                        </span>
                    </div>

                    {/* Search — inside the sticky block, so it never scrolls away */}
                    <div className="relative mt-3">
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

                    {/* Category slider */}
                    <div className="mt-3 flex items-center gap-1.5">
                        <button
                            type="button"
                            aria-label="Scroll categories left"
                            onClick={() => scrollSlider(-1)}
                            disabled={!canScrollLeft}
                            className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full border border-hairline bg-surface text-ink-soft shadow-soft transition hover:text-brand disabled:cursor-default disabled:opacity-30 sm:flex"
                        >
                            <svg
                                className="h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2.5"
                                    d="M15 19l-7-7 7-7"
                                />
                            </svg>
                        </button>

                        <div className="relative min-w-0 flex-1">
                            <div
                                ref={sliderRef}
                                onScroll={updateSliderButtons}
                                className="no-scrollbar flex snap-x gap-2.5 overflow-x-auto scroll-smooth pb-1"
                            >
                                {categories.map((category) => {
                                    const isActive =
                                        category === activeCategory;
                                    return (
                                        <button
                                            key={category}
                                            ref={(el) => {
                                                if (el) {
                                                    pillRefs.current.set(
                                                        category,
                                                        el
                                                    );
                                                } else {
                                                    pillRefs.current.delete(
                                                        category
                                                    );
                                                }
                                            }}
                                            type="button"
                                            onClick={() =>
                                                setActiveCategory(category)
                                            }
                                            className={`shrink-0 snap-start whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                                                isActive
                                                    ? "bg-brand text-white shadow-soft"
                                                    : "border border-hairline bg-surface text-ink-soft shadow-soft hover:text-ink"
                                            }`}
                                        >
                                            {category}
                                        </button>
                                    );
                                })}
                            </div>
                            {canScrollLeft ? (
                                <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-surface to-transparent" />
                            ) : null}
                            {canScrollRight ? (
                                <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-surface to-transparent" />
                            ) : null}
                        </div>

                        <button
                            type="button"
                            aria-label="Scroll categories right"
                            onClick={() => scrollSlider(1)}
                            disabled={!canScrollRight}
                            className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full border border-hairline bg-surface text-ink-soft shadow-soft transition hover:text-brand disabled:cursor-default disabled:opacity-30 sm:flex"
                        >
                            <svg
                                className="h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2.5"
                                    d="M9 5l7 7-7 7"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            </header>

            <div className="mx-auto max-w-7xl px-4 pb-32 sm:px-6 lg:px-8">
                {/* Menu grid */}
                <section className="mt-6">
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
                                    className="group flex flex-col overflow-hidden rounded-[1.5rem] border border-hairline bg-surface p-3 shadow-soft transition hover:shadow-lift"
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
                                                className="h-48 w-full rounded-3xl object-cover sm:h-52"
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

                {/* Footer — the welcome content lives here now, not in a
                    hero at the top. */}
                <section className="mt-12 rounded-card border border-brand/10 bg-brand-soft p-7 text-center shadow-soft">
                    <p className="text-sm font-semibold text-brand">
                        Welcome to
                    </p>
                    <h3 className="mt-1 text-xl font-bold text-ink">
                        {restaurant.name}
                    </h3>
                    <p className="mt-1.5 text-sm text-ink-soft">
                        Explore our menu and order your favorite dishes
                        directly from your table.
                    </p>
                    <div className="mt-5 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-ink-soft">
                        <span>
                            {restaurant.openingTime && restaurant.closingTime
                                ? `Open ${formatTime(restaurant.openingTime)} – ${formatTime(restaurant.closingTime)}`
                                : "Open 11:00 AM – 11:00 PM"}
                        </span>
                        <span>
                            {restaurant.city} · {restaurant.address}
                        </span>
                        <span>{restaurant.phone}</span>
                        {tableNumber !== null ? (
                            <span>Table {tableNumber}</span>
                        ) : null}
                    </div>
                </section>
            </div>

            {/* Success toast */}
            {orderSuccess && (
                <div className="fixed left-1/2 top-20 z-[80] -translate-x-1/2 rounded-full bg-success-bg px-5 py-3 text-sm font-bold text-success-text shadow-lift">
                    ✓ {successMessage}
                </div>
            )}
                           {/* Live order status popup + reopen chip */}
               {tracked && tableId && (
                   <OrderStatusTracker
                       key={tracked.key}
                       orderId={tracked.id}
                       restaurantSlug={restaurant.slug}
                       tableId={tableId}
                       tableNumber={tableNumber}
                       initialStatus={tracked.status}
                       onFinished={() => setTracked(null)}
                       // The first tracked order comes from the page load
                       // (key 0): start closed, showing only the chip, so
                       // a new guest sees the menu first. An order the
                       // guest just placed gets a fresh key and opens.
                       startOpen={tracked.key !== 0}
                   />
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
                isAddingToOrder={tracked !== null}
            />
        </main>
    );
}
