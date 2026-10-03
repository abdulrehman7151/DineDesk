"use client";

import React, { useEffect, useState } from "react";
import type { MenuItem } from "@/types/menu";

type Props = {
    item: MenuItem;
    onClose: () => void;
    onAdd: (payload: {
        item: MenuItem;
        sizeId: number | null;
        quantity: number;
        note?: string;
    }) => void;
};

export default function ItemDetailModal({
    item,
    onClose,
    onAdd,
}: Props) {
    const [selectedSizeId, setSelectedSizeId] = useState<number | null>(
        item.sizes[0]?.id ?? null
    );

    const [quantity, setQuantity] = useState(1);
    const [note, setNote] = useState("");

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
            }
        };

        window.addEventListener("keydown", onKey);

        const original = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            window.removeEventListener("keydown", onKey);
            document.body.style.overflow = original;
        };
    }, [onClose]);

    const currentSize = item.sizes.find(
        (s) => s.id === selectedSizeId
    );

    const unitPrice =
        currentSize?.price ??
        item.basePrice ??
        0;

    const total = unitPrice * quantity;

    const canAdd =
        item.isAvailable &&
        (item.sizes.length === 0 || currentSize != null);

    return (
        <div
            className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-4"
            role="dialog"
            aria-modal="true"
            aria-label={item.ProductName}
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-ink/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
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
                    sm:max-h-[92vh]
                    sm:rounded-card
                "
            >
                {/* Close Button */}
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close"
                    className="
                        absolute
                        right-3
                        top-3
                        z-30
                        flex
                        h-9
                        w-9
                        items-center
                        justify-center
                        rounded-full
                        bg-white/90
                        text-ink
                        shadow-soft
                        backdrop-blur
                        transition
                        hover:bg-white
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

                {/* Scrollable Content */}
                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
                    {/* Image */}
                    <img
                        src={item.imageUrl ?? "/placeholder.png"}
                        alt={item.ProductName}
                        className="h-52 w-full object-cover sm:h-64"
                    />

                    {/* Details */}
                    <div className="p-5 sm:p-6">
                        {/* Name + Price */}
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <h2 className="text-xl font-bold text-ink">
                                    {item.ProductName}
                                </h2>

                                <p className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-ink-muted">
                                    {item.category}
                                </p>
                            </div>

                            <span className="whitespace-nowrap text-lg font-bold text-price">
                                Rs. {unitPrice}
                            </span>
                        </div>

                        {/* Description */}
                        {item.description && (
                            <p className="mt-3 text-sm leading-6 text-ink-soft">
                                {item.description}
                            </p>
                        )}

                        {/* Sizes */}
                        {item.sizes.length > 0 && (
                            <div className="mt-5">
                                <p className="text-sm font-bold text-ink">
                                    Choose a size
                                </p>

                                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                                    {item.sizes.map((size) => {
                                        const active =
                                            selectedSizeId === size.id;

                                        return (
                                            <button
                                                key={size.id}
                                                type="button"
                                                onClick={() =>
                                                    setSelectedSizeId(size.id)
                                                }
                                                className={`
                                                    rounded-xl
                                                    border
                                                    p-3
                                                    text-left
                                                    transition

                                                    ${active
                                                        ? "border-brand bg-brand-soft ring-2 ring-brand-soft"
                                                        : "border-hairline bg-surface-tint hover:border-brand/40"
                                                    }
                                                `}
                                            >
                                                <span className="block text-sm font-bold text-ink">
                                                    {size.Size}
                                                </span>

                                                <span className="mt-1 block text-xs font-bold text-price">
                                                    Rs. {size.price}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Quantity */}
                        <div className="mt-5">
                            <p className="text-sm font-bold text-ink">
                                Quantity
                            </p>

                            <div className="mt-2 flex items-center gap-3">
                                {/* Decrease */}
                                <button
                                    type="button"
                                    disabled={quantity <= 1}
                                    onClick={() =>
                                        setQuantity((q) =>
                                            Math.max(1, q - 1)
                                        )
                                    }
                                    className="
                                        h-10
                                        w-10
                                        rounded-full
                                        border
                                        border-hairline
                                        bg-surface-tint
                                        text-lg
                                        font-bold
                                        text-ink
                                        transition
                                        hover:border-brand
                                        hover:text-brand
                                        disabled:cursor-not-allowed
                                        disabled:opacity-40
                                    "
                                >
                                    −
                                </button>

                                {/* Quantity */}
                                <span className="w-8 text-center text-base font-bold text-ink">
                                    {quantity}
                                </span>

                                {/* Increase */}
                                <button
                                    type="button"
                                    onClick={() =>
                                        setQuantity((q) => q + 1)
                                    }
                                    className="
                                        h-10
                                        w-10
                                        rounded-full
                                        border
                                        border-hairline
                                        bg-surface-tint
                                        text-lg
                                        font-bold
                                        text-ink
                                        transition
                                        hover:border-brand
                                        hover:text-brand
                                    "
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        {/* Special Instructions */}
                        <div className="mt-5">
                            <label
                                htmlFor="item-note"
                                className="text-sm font-bold text-ink"
                            >
                                Special instructions{" "}
                                <span className="font-normal text-ink-muted">
                                    (optional)
                                </span>
                            </label>

                            <textarea
                                id="item-note"
                                value={note}
                                onChange={(e) =>
                                    setNote(e.target.value)
                                }
                                placeholder="e.g. no onions, extra spicy, less sugar…"
                                maxLength={200}
                                rows={2}
                                className="
                                    mt-2
                                    w-full
                                    resize-none
                                    rounded-xl
                                    border
                                    border-hairline
                                    bg-surface-tint
                                    p-3
                                    text-sm
                                    text-ink
                                    placeholder:text-ink-muted
                                    focus:border-brand
                                    focus:outline-none
                                    focus:ring-2
                                    focus:ring-brand-soft
                                "
                            />

                            <p className="mt-1 text-right text-xs text-ink-muted">
                                {note.length}/200
                            </p>
                        </div>

                        {/* Extra bottom spacing on mobile */}
                        <div className="h-4 sm:hidden" />
                    </div>
                </div>

                {/* Sticky Footer */}
                <div
                    className="
                        sticky
                        bottom-0
                        z-20
                        shrink-0
                        border-t
                        border-hairline
                        bg-surface
                        p-3
                        sm:p-4
                    "
                >
                    <button
                        type="button"
                        disabled={!canAdd}
                        onClick={() => {
                            onAdd({
                                item,
                                sizeId: selectedSizeId,
                                quantity,
                                note: note.trim() || undefined,
                            });

                            onClose();
                        }}
                        className="
                            flex
                            w-full
                            items-center
                            justify-between
                            rounded-full
                            bg-brand
                            px-6
                            py-3.5
                            text-sm
                            font-bold
                            text-white
                            shadow-soft
                            transition
                            hover:bg-brand-deep
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                        "
                    >
                        <span>
                            {item.isAvailable
                                ? "Add to Order"
                                : "Unavailable"}
                        </span>

                        <span>
                            Rs. {total}
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
}