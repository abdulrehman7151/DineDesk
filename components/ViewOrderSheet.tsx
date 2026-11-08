"use client";

import React, { useEffect, useMemo } from "react";
import type { MenuItem } from "@/types/menu";

export type CartLine = {
    itemId: number;
    sizeId: number | null;
    quantity: number;
    note?: string;
};

type Props = {
    isOpen: boolean;
    onClose: () => void;
    items: MenuItem[];
    cart: CartLine[];
    onChangeQuantity: (itemId: number, sizeId: number | null, delta: number) => void;
    onRemove: (itemId: number, sizeId: number | null) => void;
    onPlaceOrder: () => void;
    isPlacingOrder: boolean;
    errorMessage: string | null;
    tableNumber: number | null;
};

export default function ViewOrderSheet({ isOpen, onClose, items, cart, onChangeQuantity, onRemove, onPlaceOrder, isPlacingOrder, errorMessage, tableNumber }: Props) {
    // Lock body scroll while sheet is open
    useEffect(() => {
        if (!isOpen) return;
        const original = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = original;
        };
    }, [isOpen]);

    // Close on Escape
    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [isOpen, onClose]);

    // Build detailed lines with item + size data resolved
    const detailedLines = useMemo(() => {
        return cart
            .map((line) => {
                const item = items.find((i) => i.id === line.itemId);
                if (!item) return null;

                const size = line.sizeId
                    ? item.sizes.find((s) => s.id === line.sizeId) ?? null
                    : null;

                const unitPrice = size?.price ?? item.basePrice ?? 0;

                return {
                    line,
                    item,
                    size,
                    unitPrice,
                    lineTotal: unitPrice * line.quantity,
                };
            })
            .filter(Boolean) as {
                line: CartLine;
                item: MenuItem;
                size: { id: number; Size: string; price: number } | null;
                unitPrice: number;
                lineTotal: number;
            }[];
    }, [cart, items]);

    const subtotal = detailedLines.reduce((sum, l) => sum + l.lineTotal, 0);
    const totalItems = detailedLines.reduce((sum, l) => sum + l.line.quantity, 0);

    // Tax (optional — set to 0 to hide, or use your own rate)
    const taxRate = 0;
    const tax = Math.round(subtotal * taxRate);
    const total = subtotal + tax;

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-4"
            role="dialog"
            aria-modal="true"
            aria-label="Your order"
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-ink/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Sheet */}
            <div
                className="
                    relative
                    flex
                    h-[calc(100dvh-72px)]
                    max-h-[calc(100dvh-72px)]
                    w-full
                    max-w-lg
                    flex-col
                    overflow-hidden
                    rounded-t-card
                    border
                    border-hairline
                    bg-surface
                    shadow-lift

                    sm:h-auto
                    sm:max-h-[90vh]
                    sm:rounded-card
                "
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-hairline px-5 py-4 sm:px-6">
                    <div>
                        <h2 className="text-lg font-bold text-ink">
                            Your Order
                        </h2>
                        <p className="text-xs text-ink-soft">
                            {totalItems} item{totalItems === 1 ? "" : "s"}
                        </p>
                        <p className="text-xs text-ink-muted">
                            {tableNumber === null
                                ? "Scan a table QR code to place this order."
                                : `Ordering for Table ${tableNumber}`}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="
                            flex h-9 w-9 items-center justify-center
                            rounded-full bg-surface-tint text-ink
                            transition hover:bg-surface-warm
                        "
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
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                {/* Scrollable content */}
                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4 sm:px-6">
                    {detailedLines.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface-tint">
                                <svg
                                    className="h-7 w-7 text-ink-muted"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="1.5"
                                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                                    />
                                </svg>
                            </div>
                            <p className="text-sm font-semibold text-ink">
                                Your order is empty
                            </p>
                            <p className="mt-1 text-xs text-ink-soft">
                                Add items from the menu to get started.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {detailedLines.map(({ line, item, size, unitPrice, lineTotal }) => (
                                <div
                                    key={`${line.itemId}-${line.sizeId ?? "base"}`}
                                    className="flex gap-3"
                                >
                                    {/* Image */}
                                    <img
                                        src={item.imageUrl ?? "/placeholder.png"}
                                        alt={item.ProductName}
                                        className="h-16 w-16 shrink-0 rounded-xl object-cover"
                                    />

                                    {/* Details */}
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-bold text-ink">
                                                    {item.ProductName}
                                                </p>

                                                {size && (
                                                    <p className="mt-0.5 text-xs text-ink-soft">
                                                        {size.Size}
                                                    </p>
                                                )}

                                                <p className="mt-0.5 text-xs text-ink-muted">
                                                    Rs. {unitPrice} each
                                                </p>
                                            </div>

                                            <span className="shrink-0 text-sm font-bold text-price">
                                                Rs. {lineTotal}
                                            </span>
                                        </div>

                                        {/* Note */}
                                        {line.note && (
                                            <p className="mt-1 line-clamp-1 rounded-md bg-surface-tint px-2 py-1 text-[11px] italic text-ink-soft">
                                                “{line.note}”
                                            </p>
                                        )}

                                        {/* Quantity + Remove */}
                                        <div className="mt-2 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        onChangeQuantity(
                                                            line.itemId,
                                                            line.sizeId,
                                                            -1
                                                        )
                                                    }
                                                    disabled={line.quantity <= 1}
                                                    aria-label="Decrease quantity"
                                                    className="
                                                        flex h-7 w-7 items-center justify-center
                                                        rounded-full border border-hairline
                                                        bg-surface-tint text-sm font-bold text-ink
                                                        transition hover:border-brand hover:text-brand
                                                        disabled:cursor-not-allowed disabled:opacity-40
                                                    "
                                                >
                                                    −
                                                </button>

                                                <span className="w-6 text-center text-sm font-bold text-ink">
                                                    {line.quantity}
                                                </span>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        onChangeQuantity(
                                                            line.itemId,
                                                            line.sizeId,
                                                            1
                                                        )
                                                    }
                                                    aria-label="Increase quantity"
                                                    className="
                                                        flex h-7 w-7 items-center justify-center
                                                        rounded-full border border-hairline
                                                        bg-surface-tint text-sm font-bold text-ink
                                                        transition hover:border-brand hover:text-brand
                                                    "
                                                >
                                                    +
                                                </button>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    onRemove(line.itemId, line.sizeId)
                                                }
                                                className="text-xs font-semibold text-ink-muted transition hover:text-brand"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Sticky footer with totals + CTA */}
                {detailedLines.length > 0 && (
                    <div className="shrink-0 border-t border-hairline bg-surface p-4 sm:p-5">
                        {/* Summary rows */}
                        <div className="space-y-1.5 text-sm">
                            <div className="flex justify-between text-ink-soft">
                                <span>Subtotal</span>
                                <span className="font-semibold text-ink">
                                    Rs. {subtotal}
                                </span>
                            </div>

                            {tax > 0 && (
                                <div className="flex justify-between text-ink-soft">
                                    <span>Tax</span>
                                    <span className="font-semibold text-ink">
                                        Rs. {tax}
                                    </span>
                                </div>
                            )}

                            <div className="flex justify-between border-t border-hairline pt-2 text-base">
                                <span className="font-bold text-ink">Total</span>
                                <span className="font-bold text-price">
                                    Rs. {total}
                                </span>
                            </div>
                        </div>

                        {/* Place order */}
                        {errorMessage && (
                            <p
                                role="alert"
                                className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
                            >
                                {errorMessage}
                            </p>
                        )}
                        <button
                            type="button"
                            onClick={onPlaceOrder}
                            disabled={isPlacingOrder || tableNumber === null}
                            className="
                                mt-4 flex w-full items-center justify-center gap-2
                                rounded-full bg-brand py-3.5 text-sm font-bold text-white
                                shadow-soft transition hover:bg-brand-deep
                                disabled:cursor-not-allowed disabled:opacity-60
                            "
                        >
                            {isPlacingOrder ? "Placing Order..." : "Place Order"}
                            <svg
                                className="h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M5 12h14M13 6l6 6-6 6"
                                />
                            </svg>
                        </button>

                        <p className="mt-2 text-center text-[11px] text-ink-muted">
                            Your order will be sent to the kitchen.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}