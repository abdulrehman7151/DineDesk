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
    // Most-ordered dish ids, ranked by the server (menu order when
    // the restaurant has no orders yet). Drives the Popular carousel.
    popularItemIds: number[];
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

// Search matching: every word of the query must appear (partial
// substring, case-insensitive) somewhere in the dish's name,
// description or category combined — e.g. "chick" matches
// "chicken", "bbq pizza" matches a BBQ pizza. A dish with no
// description matches on name + category only.
function matchesSearch(item: MenuItem, query: string): boolean {
    const words = query
        .toLowerCase()
        .split(/\s+/)
        .filter((w) => w.length > 0);
    if (words.length === 0) return true;
    const haystack = [item.ProductName, item.description ?? "", item.category]
        .join(" ")
        .toLowerCase();
    return words.every((word) => haystack.includes(word));
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

// Inline SVG icons for the category tiles — no emoji. Keyword-matched
// so custom categories (BBQ, Karahi, Biryani, ...) get a sensible icon
// too, and anything unknown falls back to a serving cloche.
function CategoryIcon({
    category,
    className,
}: {
    category: string;
    className?: string;
}) {
    const svgProps: React.SVGProps<SVGSVGElement> = {
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 1.8,
        strokeLinecap: "round",
        strokeLinejoin: "round",
        viewBox: "0 0 24 24",
    };
    const name = category.toLowerCase();
    if (name === "all") {
        return (
            <svg {...svgProps} className={className}>
                <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
                <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
                <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
                <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
            </svg>
        );
    }
    if (name.includes("burger")) {
        return (
            <svg {...svgProps} className={className}>
                <path d="M4.5 10a7.5 7.5 0 0 1 15 0Z" />
                <path d="M3.5 13.5h17" />
                <path d="M4.5 17.5h15" />
            </svg>
        );
    }
    if (name.includes("pizza")) {
        return (
            <svg {...svgProps} className={className}>
                <path d="M5 4.5h14L12 20 5 4.5Z" />
                <path d="M12 9h.01M10 13h.01M14.5 13h.01" />
            </svg>
        );
    }
    if (
        name.includes("fries") ||
        name.includes("side") ||
        name.includes("snack") ||
        name.includes("chips")
    ) {
        return (
            <svg {...svgProps} className={className}>
                <path d="M7.5 9 6 19.5a1.8 1.8 0 0 0 1.8 2.1h8.4a1.8 1.8 0 0 0 1.8-2.1L16.5 9" />
                <path d="M8.5 9V5M12 9V3.5M15.5 9V5" />
            </svg>
        );
    }
    if (
        name.includes("drink") ||
        name.includes("beverage") ||
        name.includes("juice") ||
        name.includes("shake") ||
        name.includes("soda") ||
        name.includes("tea") ||
        name.includes("coffee") ||
        name.includes("lassi")
    ) {
        return (
            <svg {...svgProps} className={className}>
                <path d="M6 6h12l-1.4 13a2 2 0 0 1-2 1.8H9.4a2 2 0 0 1-2-1.8L6 6Z" />
                <path d="M13.5 6 15.5 3" />
                <path d="M6.5 10.5h11" />
            </svg>
        );
    }
    if (
        name.includes("dessert") ||
        name.includes("cake") ||
        name.includes("ice") ||
        name.includes("sweet") ||
        name.includes("brownie") ||
        name.includes("pastry")
    ) {
        return (
            <svg {...svgProps} className={className}>
                <path d="M4 20.5h16" />
                <path d="M5 20.5v-6L12 9.5l7 5v6" />
                <path d="M12 9.5V6.5" />
                <circle cx="12" cy="5.2" r="0.9" />
            </svg>
        );
    }
    if (name.includes("chicken")) {
        return (
            <svg {...svgProps} className={className}>
                <ellipse cx="10" cy="10" rx="6.2" ry="5" transform="rotate(-45 10 10)" />
                <path d="M13.8 13.8 18 18" />
                <circle cx="19.2" cy="19.2" r="1.5" />
            </svg>
        );
    }
    if (
        name.includes("pasta") ||
        name.includes("noodle") ||
        name.includes("spaghetti") ||
        name.includes("macaroni")
    ) {
        return (
            <svg {...svgProps} className={className}>
                <path d="M4 12.5h16a8 8 0 0 1-16 0Z" />
                <path d="M9 9c0-1.6 1.2-1.6 1.2-3.2M13.5 9c0-1.6 1.2-1.6 1.2-3.2" />
            </svg>
        );
    }
    if (
        name.includes("bbq") ||
        name.includes("grill") ||
        name.includes("kebab") ||
        name.includes("tikka")
    ) {
        return (
            <svg {...svgProps} className={className}>
                <path d="M12 3.5s5 4.5 5 9a5 5 0 0 1-10 0c0-2 1-3.5 2-5 .5 1.5 1.5 2 2 2.5.5-2.5 0-4.5 1-6.5Z" />
            </svg>
        );
    }
    if (
        name.includes("biryani") ||
        name.includes("rice") ||
        name.includes("pulao")
    ) {
        return (
            <svg {...svgProps} className={className}>
                <path d="M4 13.5h16a8 8 0 0 1-16 0Z" />
                <path d="M8 10h.01M12 8.5h.01M16 10h.01" />
            </svg>
        );
    }
    if (
        name.includes("karahi") ||
        name.includes("handi") ||
        name.includes("curry")
    ) {
        return (
            <svg {...svgProps} className={className}>
                <path d="M5.5 11h13v2.5a6.5 6.5 0 0 1-13 0V11Z" />
                <path d="M5.5 11H3.8a1.6 1.6 0 0 1-1.6-1.9M18.5 11h1.7a1.6 1.6 0 0 0 1.6-1.9" />
                <path d="M9.5 7.5c0-1.2 1-1.2 1-2.2M13.5 7.5c0-1.2 1-1.2 1-2.2" />
            </svg>
        );
    }
    if (
        name.includes("shawarma") ||
        name.includes("wrap") ||
        name.includes("roll") ||
        name.includes("sandwich")
    ) {
        return (
            <svg {...svgProps} className={className}>
                <path d="M5 8.5h14a3 3 0 0 1 0 6H5a3 3 0 0 1 0-6Z" />
                <path d="M9.5 8.5v6M14 8.5v6" />
            </svg>
        );
    }
    return (
        <svg {...svgProps} className={className}>
            <path d="M4 17.5h16" />
            <path d="M5 17.5a7 7 0 0 1 14 0" />
            <path d="M12 10.5V9" />
            <circle cx="12" cy="7.8" r="0.9" />
        </svg>
    );
}

export default function HomeClient({
    items,
    popularItemIds,
    restaurant,
    tableId,
    tableNumber,
    activeOrder,
}: Props) {
    const [activeCategory, setActiveCategory] = useState("All");
    const [searchValue, setSearchValue] = useState("");

    // Search mode: active whenever the query is non-empty after
    // trimming. While searching, the page shows ONLY the search bar
    // and the vertical results list below — Popular, the category
    // slider and the Full Menu grid are hidden until the search is
    // cleared. Typing filters live; Enter just dismisses the
    // keyboard and scrolls the results into view.
    const searchInputRef = useRef<HTMLInputElement | null>(null);
    const searchResultsRef = useRef<HTMLElement | null>(null);
    const searchQuery = searchValue.trim();
    const isSearching = searchQuery.length > 0;

    const searchResults = useMemo(
        () =>
            items.filter(
                (item) => item.isAvailable && matchesSearch(item, searchQuery)
            ),
        [items, searchQuery]
    );

    const applySearch = () => {
        // Dismiss the on-screen keyboard, then bring the results
        // below the sticky header (scroll-mt on the section keeps
        // them from sliding under it).
        searchInputRef.current?.blur();
        searchResultsRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });
    };

    const clearSearch = () => {
        setSearchValue("");
        searchInputRef.current?.blur();
    };

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

    // "Popular" carousel: the server ranked these by total ordered
    // quantity (menu order when there are no orders yet). Only
    // available items, in the server's order. This section ignores
    // the category filter on purpose — it always shows the
    // restaurant's overall most-ordered dishes, while the grid
    // below is the one that filters. Search hides this section
    // entirely and shows its own results view instead.
    const popularItems = useMemo(() => {
        const byId = new Map(items.map((item) => [item.id, item]));
        return popularItemIds
            .map((id) => byId.get(id))
            .filter(
                (item): item is MenuItem =>
                    Boolean(item && item.isAvailable)
            )
            .slice(0, 8);
    }, [items, popularItemIds]);

    // Popular carousel sliding: swipe on touch, chevron buttons on
    // desktop — same smooth-slide behaviour as the category slider.
    const popularRef = useRef<HTMLDivElement | null>(null);
    const [canScrollPopularLeft, setCanScrollPopularLeft] = useState(false);
    const [canScrollPopularRight, setCanScrollPopularRight] =
        useState(false);

    const updatePopularButtons = () => {
        const el = popularRef.current;
        if (!el) return;
        setCanScrollPopularLeft(el.scrollLeft > 4);
        setCanScrollPopularRight(
            el.scrollLeft + el.clientWidth < el.scrollWidth - 4
        );
    };

    useEffect(() => {
        updatePopularButtons();
        window.addEventListener("resize", updatePopularButtons);
        return () => window.removeEventListener("resize", updatePopularButtons);
    }, [popularItems]);

    const scrollPopular = (direction: 1 | -1) => {
        popularRef.current?.scrollBy({
            left: direction * 272,
            behavior: "smooth",
        });
    };

    // The grid filters by category only. Search has its own
    // dedicated results view (see searchResults above) and hides
    // this grid while it is active.
    const availableItems = useMemo(
        () =>
            items.filter((item) => {
                if (!item.isAvailable) return false;
                return (
                    activeCategory === "All" ||
                    item.category === activeCategory
                );
            }),
        [items, activeCategory]
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

                    {/* Search — inside the sticky block, so it never scrolls away.
                        The input is text-base (16px): iOS Safari auto-zooms
                        any input under 16px, which made the page jump on
                        mobile. The bar keeps its visual size. Enter submits
                        the form: keyboard dismisses and results scroll
                        into view. The × clears the search and restores
                        the full page. */}
                    <form
                        role="search"
                        className="relative mt-3"
                        onSubmit={(e) => {
                            e.preventDefault();
                            applySearch();
                        }}
                    >
                        <input
                            ref={searchInputRef}
                            type="text"
                            enterKeyHint="search"
                            autoComplete="off"
                            aria-label="Search the menu"
                            placeholder="Search for food or drinks..."
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            className="w-full rounded-full border border-hairline bg-surface py-3.5 pl-12 pr-10 text-base text-ink shadow-soft outline-none transition placeholder:text-ink-muted focus:border-brand focus:ring-4 focus:ring-brand-soft"
                        />
                        <svg
                            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-muted"
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
                        {searchValue.length > 0 ? (
                            <button
                                type="button"
                                aria-label="Clear search"
                                onClick={clearSearch}
                                className="absolute right-2.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-surface-tint text-ink-soft transition hover:text-brand"
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
                                        d="M6 6l12 12M18 6L6 18"
                                    />
                                </svg>
                            </button>
                        ) : null}
                    </form>

                    {/* Category slider — hidden while searching; the
                        results view below replaces it. */}
                    {!isSearching ? (
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
                                            aria-pressed={isActive}
                                            onClick={() =>
                                                setActiveCategory(category)
                                            }
                                            className="flex w-[68px] shrink-0 snap-start flex-col items-center gap-1.5 pb-1"
                                        >
                                            <span
                                                className={`flex h-14 w-14 items-center justify-center rounded-2xl transition ${
                                                    isActive
                                                        ? "bg-brand text-white shadow-soft"
                                                        : "border border-hairline bg-surface text-ink-soft shadow-soft hover:text-brand"
                                                }`}
                                            >
                                                <CategoryIcon
                                                    category={category}
                                                    className="h-7 w-7"
                                                />
                                            </span>
                                            <span
                                                className={`w-full truncate text-center text-[11px] font-semibold leading-tight ${
                                                    isActive
                                                        ? "text-brand"
                                                        : "text-ink-soft"
                                                }`}
                                            >
                                                {category}
                                            </span>
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
                    ) : null}
                </div>
            </header>

            <div className="mx-auto max-w-7xl px-4 pb-32 sm:px-6 lg:px-8">
                {/* Search results — the ONLY thing shown while searching:
                    a vertical list, one dish per row (photo, name +
                    category, red price, red Add button). Tapping a row
                    or its Add button opens the same item modal as the
                    grid. scroll-mt keeps the list from sliding under
                    the sticky header when Enter scrolls to it. */}
                {isSearching ? (
                    <section
                        ref={searchResultsRef}
                        className="mt-4 scroll-mt-56 sm:mt-6"
                    >
                        <div className="mb-3 sm:mb-4">
                            <p className="text-xs font-semibold text-brand sm:text-sm">
                                Search results
                            </p>
                            <h3 className="mt-0.5 text-xl font-bold tracking-tight sm:text-2xl">
                                {searchResults.length === 0
                                    ? "No dishes found"
                                    : `${searchResults.length} result${searchResults.length === 1 ? "" : "s"} for “${searchQuery}”`}
                            </h3>
                        </div>

                        {searchResults.length === 0 ? (
                            <div className="rounded-card border border-hairline bg-surface-tint p-10 text-center">
                                <p className="text-sm text-ink-soft">
                                    No dishes found for “{searchQuery}”.
                                    Try a different dish, ingredient or
                                    category.
                                </p>
                                <button
                                    type="button"
                                    onClick={clearSearch}
                                    className="mt-4 rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-deep"
                                >
                                    Clear search
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {searchResults.map((item) => (
                                    <article
                                        key={item.id}
                                        onClick={() =>
                                            setSelectedItem(item)
                                        }
                                        className="flex cursor-pointer items-center gap-3 rounded-2xl border border-hairline bg-surface p-2.5 shadow-soft transition hover:shadow-lift sm:gap-4 sm:p-3"
                                    >
                                        <img
                                            src={
                                                item.imageUrl ??
                                                "/placeholder.png"
                                            }
                                            alt={item.ProductName}
                                            className="h-20 w-20 shrink-0 rounded-xl object-cover sm:h-24 sm:w-24"
                                        />
                                        <div className="min-w-0 flex-1">
                                            <h4 className="truncate text-sm font-bold leading-tight text-ink sm:text-base">
                                                {item.ProductName}
                                            </h4>
                                            <p className="mt-0.5 truncate text-xs text-ink-soft sm:text-sm">
                                                {item.category}
                                                {item.description
                                                    ? ` · ${item.description}`
                                                    : ""}
                                            </p>
                                            <span className="mt-1 block text-xs font-bold text-price sm:text-sm">
                                                Starts From Rs.{" "}
                                                {getStartingPrice(item)}
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            aria-label={`Add ${item.ProductName} to order`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedItem(item);
                                            }}
                                            className="shrink-0 rounded-full bg-brand px-4 py-2.5 text-xs font-bold text-white transition hover:bg-brand-deep sm:px-5 sm:text-sm"
                                        >
                                            + Add
                                        </button>
                                    </article>
                                ))}
                            </div>
                        )}
                    </section>
                ) : null}

                {/* Popular — a horizontal sliding carousel (swipe on
                    touch, chevron buttons on desktop), not a vertical
                    list. Fixed-width cards peek in from the right edge
                    to invite a slide. Tapping a card opens the same
                    item modal as the grid below. Hidden while
                    searching — the results view replaces it. */}
                {!isSearching && popularItems.length > 0 ? (
                    <section className="mt-4 scroll-mt-56 sm:mt-6">
                        <div className="mb-3 flex items-end justify-between gap-3 sm:mb-4">
                            <div>
                                <p className="text-xs font-semibold text-brand sm:text-sm">
                                    Most ordered
                                </p>
                                <h3 className="mt-0.5 text-xl font-bold tracking-tight sm:text-2xl">
                                    Popular
                                </h3>
                            </div>
                            <div className="hidden shrink-0 gap-2 sm:flex">
                                <button
                                    type="button"
                                    aria-label="Slide popular dishes left"
                                    onClick={() => scrollPopular(-1)}
                                    disabled={!canScrollPopularLeft}
                                    className="flex h-9 w-9 items-center justify-center rounded-full border border-hairline bg-surface text-ink-soft shadow-soft transition hover:text-brand disabled:cursor-default disabled:opacity-30"
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
                                <button
                                    type="button"
                                    aria-label="Slide popular dishes right"
                                    onClick={() => scrollPopular(1)}
                                    disabled={!canScrollPopularRight}
                                    className="flex h-9 w-9 items-center justify-center rounded-full border border-hairline bg-surface text-ink-soft shadow-soft transition hover:text-brand disabled:cursor-default disabled:opacity-30"
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

                        <div className="relative -mx-4 px-4 sm:mx-0 sm:px-0">
                            <div
                                ref={popularRef}
                                onScroll={updatePopularButtons}
                                className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-1"
                            >
                                {popularItems.map((item) => (
                                    <article
                                        key={item.id}
                                        className="group flex w-[72vw] max-w-[260px] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-hairline bg-surface p-2 shadow-soft transition hover:shadow-lift sm:w-[260px] sm:p-3"
                                    >
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setSelectedItem(item)
                                            }
                                            className="flex flex-1 flex-col text-left"
                                        >
                                            <div className="relative">
                                                <img
                                                    src={
                                                        item.imageUrl ??
                                                        "/placeholder.png"
                                                    }
                                                    alt={item.ProductName}
                                                    className="h-28 w-full rounded-xl object-cover sm:h-36"
                                                />
                                                <span className="absolute left-2 top-2 rounded-full bg-white/95 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-ink backdrop-blur sm:left-3 sm:top-3 sm:px-2.5 sm:py-1 sm:text-[10px]">
                                                    {item.category}
                                                </span>
                                            </div>

                                            <div className="flex flex-1 flex-col px-1 pb-1 pt-2.5 sm:px-2 sm:pb-2 sm:pt-4">
                                                <div className="flex flex-col gap-0.5 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                                                    <h4 className="text-sm font-bold leading-tight text-ink sm:text-base">
                                                        {item.ProductName}
                                                    </h4>
                                                    <span className="whitespace-nowrap text-xs font-bold text-price sm:text-sm">
                                                        Starts From Rs.{" "}
                                                        {getStartingPrice(
                                                            item
                                                        )}
                                                    </span>
                                                </div>

                                                <p className="mt-1 line-clamp-1 text-xs leading-4 text-ink-soft sm:mt-2 sm:text-sm sm:leading-5">
                                                    {item.description}
                                                </p>

                                                {item.sizes.length > 0 && (
                                                    <div className="mt-1.5 flex flex-wrap gap-1 sm:mt-2">
                                                        {item.sizes.map(
                                                            (s, idx) => (
                                                                <span
                                                                    key={s.id}
                                                                    className={`rounded-full bg-surface-tint px-2 py-0.5 text-[9px] font-semibold text-ink-soft sm:text-[10px] ${
                                                                        idx > 1
                                                                            ? "hidden sm:inline-flex"
                                                                            : ""
                                                                    }`}
                                                                >
                                                                    {s.Size} ·{" "}
                                                                    Rs.{" "}
                                                                    {s.price}
                                                                </span>
                                                            )
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setSelectedItem(item)
                                            }
                                            className="mt-2.5 w-full rounded-full bg-brand py-2 text-xs font-bold text-white transition hover:bg-brand-deep sm:mt-4 sm:py-2.5 sm:text-sm"
                                        >
                                            + Add to Order
                                        </button>
                                    </article>
                                ))}
                            </div>
                            {canScrollPopularLeft ? (
                                <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-surface to-transparent" />
                            ) : null}
                            {canScrollPopularRight ? (
                                <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-surface to-transparent" />
                            ) : null}
                        </div>
                    </section>
                ) : null}

                {/* Menu grid — two columns even on a phone, so several
                    dishes are visible at once like in the reference.
                    scroll-mt keeps the heading from sliding half-hidden
                    under the sticky header. Hidden while searching. */}
                {!isSearching ? (
                    <section className="mt-10 scroll-mt-56 sm:mt-12">
                    <div className="mb-3 sm:mb-5">
                        <p className="text-xs font-semibold text-brand sm:text-sm">
                            Explore our selection
                        </p>
                        <h3 className="mt-0.5 text-xl font-bold tracking-tight sm:text-2xl">
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
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
                            {availableItems.map((item) => (
                                <article
                                    key={item.id}
                                    className="group flex flex-col overflow-hidden rounded-2xl border border-hairline bg-surface p-2 shadow-soft transition hover:shadow-lift sm:rounded-[1.5rem] sm:p-3"
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
                                                className="h-28 w-full rounded-xl object-cover sm:h-44 sm:rounded-3xl"
                                            />
                                            <span className="absolute left-2 top-2 rounded-full bg-white/95 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-ink backdrop-blur sm:left-4 sm:top-4 sm:px-2.5 sm:py-1 sm:text-[10px]">
                                                {item.category}
                                            </span>
                                        </div>

                                        <div className="flex flex-1 flex-col px-1 pb-1 pt-2.5 sm:px-2 sm:pb-2 sm:pt-4">
                                            <div className="flex flex-col gap-0.5 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                                                <h4 className="text-sm font-bold leading-tight text-ink sm:text-base">
                                                    {item.ProductName}
                                                </h4>
                                                <span className="whitespace-nowrap text-xs font-bold text-price sm:text-sm">
                                                    Starts From Rs.{" "}
                                                    {getStartingPrice(item)}
                                                </span>
                                            </div>

                                            <p className="mt-1 line-clamp-1 text-xs leading-4 text-ink-soft sm:mt-2 sm:line-clamp-2 sm:text-sm sm:leading-5">
                                                {item.description}
                                            </p>

                                            {item.sizes.length > 0 && (
                                                <div className="mt-1.5 flex flex-wrap gap-1 sm:mt-2">
                                                    {item.sizes.map((s, idx) => (
                                                        <span
                                                            key={s.id}
                                                            className={`rounded-full bg-surface-tint px-2 py-0.5 text-[9px] font-semibold text-ink-soft sm:text-[10px] ${
                                                                idx > 1
                                                                    ? "hidden sm:inline-flex"
                                                                    : ""
                                                            }`}
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
                                        className="mt-2.5 w-full rounded-full bg-brand py-2 text-xs font-bold text-white transition hover:bg-brand-deep sm:mt-4 sm:py-2.5 sm:text-sm"
                                    >
                                        + Add to Order
                                    </button>
                                </article>
                            ))}
                        </div>
                    )}
                </section>
                ) : null}

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
