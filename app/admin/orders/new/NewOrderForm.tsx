"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { submitAdminOrderAction } from "@/actions/adminOrderAction";

type FormTable = {
    id: number;
    number: number;
    seats: number;
    status: string;
};

type FormItem = {
    id: number;
    ProductName: string;
    category: string;
    basePrice: number | null;
    sizes: { id: number; Size: string; price: number }[];
};

type CartLine = {
    itemId: number;
    sizeId: number | null;
    quantity: number;
};

type Props = {
    tables: FormTable[];
    items: FormItem[];
};

function unitPriceFor(item: FormItem, sizeId: number | null): number {
    if (sizeId !== null) {
        return item.sizes.find((size) => size.id === sizeId)?.price ?? 0;
    }
    return item.basePrice ?? 0;
}

export default function NewOrderForm({ tables, items }: Props) {
    const router = useRouter();
    const [tableId, setTableId] = useState<number | "">(
        tables[0]?.id ?? ""
    );
    // Per-item picker state: size + quantity, keyed by item id.
    const [picks, setPicks] = useState<
        Record<number, { sizeId: number | null; quantity: number }>
    >(() => {
        const initial: Record<number, { sizeId: number | null; quantity: number }> = {};
        for (const item of items) {
            initial[item.id] = {
                sizeId: item.sizes.length > 0 ? item.sizes[0].id : null,
                quantity: 1,
            };
        }
        return initial;
    });
    const [cart, setCart] = useState<CartLine[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const total = useMemo(
        () =>
            cart.reduce((sum, line) => {
                const item = items.find((i) => i.id === line.itemId);
                if (!item) return sum;
                return sum + unitPriceFor(item, line.sizeId) * line.quantity;
            }, 0),
        [cart, items]
    );

    function addToCart(item: FormItem) {
        const pick = picks[item.id];
        if (!pick) return;

        const price = unitPriceFor(item, pick.sizeId);
        if (price <= 0) {
            setError(`No price found for ${item.ProductName}.`);
            return;
        }

        setCart((current) => {
            const existingIndex = current.findIndex(
                (line) =>
                    line.itemId === item.id && line.sizeId === pick.sizeId
            );
            if (existingIndex >= 0) {
                const next = [...current];
                next[existingIndex] = {
                    ...next[existingIndex],
                    quantity: next[existingIndex].quantity + pick.quantity,
                };
                return next;
            }
            return [
                ...current,
                {
                    itemId: item.id,
                    sizeId: pick.sizeId,
                    quantity: pick.quantity,
                },
            ];
        });
        setError(null);
    }

    function removeLine(index: number) {
        setCart((current) => current.filter((_, i) => i !== index));
    }

    async function submit() {
        if (tableId === "") {
            setError("Choose a table.");
            return;
        }
        if (cart.length === 0) {
            setError("Add at least one item.");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        const result = await submitAdminOrderAction(tableId, cart);

        if (!result.success) {
            setError(result.message);
            setIsSubmitting(false);
            return;
        }

        router.push("/admin/orders");
    }

    return (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            {/* Items */}
            <div className="space-y-6">
                <div>
                    <label
                        htmlFor="table"
                        className="mb-2 block text-sm font-bold text-ink"
                    >
                        Table
                    </label>
                    <select
                        id="table"
                        value={tableId}
                        onChange={(event) =>
                            setTableId(
                                event.target.value === ""
                                    ? ""
                                    : Number(event.target.value)
                            )
                        }
                        className="w-full max-w-xs rounded-full border border-hairline bg-surface px-4 py-2.5 text-sm font-medium text-ink outline-none"
                    >
                        {tables.length === 0 && (
                            <option value="">No tables yet</option>
                        )}
                        {tables.map((table) => (
                            <option key={table.id} value={table.id}>
                                Table {table.number} · {table.seats} seats
                                {table.status !== "AVAILABLE"
                                    ? ` · ${table.status.toLowerCase()}`
                                    : ""}
                            </option>
                        ))}
                    </select>
                </div>

                {items.length === 0 ? (
                    <div className="rounded-card border border-hairline bg-surface-tint p-10 text-center">
                        <p className="text-sm text-ink-soft">
                            No menu items yet. Add items to the menu first.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                        {items.map((item) => {
                            const pick = picks[item.id] ?? {
                                sizeId: null,
                                quantity: 1,
                            };
                            const price = unitPriceFor(item, pick.sizeId);
                            return (
                                <div
                                    key={item.id}
                                    className="rounded-card border border-hairline bg-surface p-4 shadow-soft"
                                >
                                    <h3 className="font-bold text-ink">
                                        {item.ProductName}
                                    </h3>
                                    <p className="mt-0.5 text-xs text-ink-muted">
                                        {item.category}
                                    </p>

                                    <div className="mt-3 flex flex-wrap items-center gap-2">
                                        {item.sizes.length > 0 ? (
                                            <select
                                                value={pick.sizeId ?? ""}
                                                onChange={(event) =>
                                                    setPicks((current) => ({
                                                        ...current,
                                                        [item.id]: {
                                                            ...pick,
                                                            sizeId: Number(
                                                                event.target.value
                                                            ),
                                                        },
                                                    }))
                                                }
                                                className="rounded-full border border-hairline bg-surface-tint px-3 py-2 text-sm font-medium text-ink outline-none"
                                            >
                                                {item.sizes.map((size) => (
                                                    <option
                                                        key={size.id}
                                                        value={size.id}
                                                    >
                                                        {size.Size} · Rs.{" "}
                                                        {size.price}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <span className="text-sm font-bold text-price">
                                                Rs. {item.basePrice}
                                            </span>
                                        )}

                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                aria-label="Decrease quantity"
                                                onClick={() =>
                                                    setPicks((current) => ({
                                                        ...current,
                                                        [item.id]: {
                                                            ...pick,
                                                            quantity: Math.max(
                                                                1,
                                                                pick.quantity - 1
                                                            ),
                                                        },
                                                    }))
                                                }
                                                className="flex h-8 w-8 items-center justify-center rounded-full border border-hairline bg-surface-tint text-sm font-bold text-ink"
                                            >
                                                −
                                            </button>
                                            <span className="w-6 text-center text-sm font-bold text-ink">
                                                {pick.quantity}
                                            </span>
                                            <button
                                                type="button"
                                                aria-label="Increase quantity"
                                                onClick={() =>
                                                    setPicks((current) => ({
                                                        ...current,
                                                        [item.id]: {
                                                            ...pick,
                                                            quantity:
                                                                pick.quantity + 1,
                                                        },
                                                    }))
                                                }
                                                className="flex h-8 w-8 items-center justify-center rounded-full border border-hairline bg-surface-tint text-sm font-bold text-ink"
                                            >
                                                +
                                            </button>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => addToCart(item)}
                                            className="ml-auto rounded-full bg-brand px-4 py-2 text-xs font-bold text-white transition hover:bg-brand-deep"
                                        >
                                            Add · Rs. {price * pick.quantity}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Order summary */}
            <div className="h-fit rounded-card border border-hairline bg-surface p-5 shadow-soft lg:sticky lg:top-24">
                <h2 className="text-base font-bold text-ink">Order</h2>

                {cart.length === 0 ? (
                    <p className="mt-3 text-sm text-ink-soft">
                        No items yet. Pick items from the menu.
                    </p>
                ) : (
                    <ul className="mt-3 space-y-3">
                        {cart.map((line, index) => {
                            const item = items.find(
                                (i) => i.id === line.itemId
                            );
                            if (!item) return null;
                            const size = item.sizes.find(
                                (s) => s.id === line.sizeId
                            );
                            const price = unitPriceFor(item, line.sizeId);
                            return (
                                <li
                                    key={`${line.itemId}-${line.sizeId}`}
                                    className="flex items-center justify-between gap-3 text-sm"
                                >
                                    <span className="text-ink">
                                        {line.quantity}× {item.ProductName}
                                        {size ? ` (${size.Size})` : ""}
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <span className="font-bold text-price">
                                            Rs. {price * line.quantity}
                                        </span>
                                        <button
                                            type="button"
                                            aria-label={`Remove ${item.ProductName}`}
                                            onClick={() => removeLine(index)}
                                            className="text-ink-muted hover:text-red-600"
                                        >
                                            ×
                                        </button>
                                    </span>
                                </li>
                            );
                        })}
                    </ul>
                )}

                <div className="mt-4 flex items-center justify-between border-t border-hairline pt-4 text-sm font-bold text-ink">
                    <span>Total</span>
                    <span>Rs. {total.toLocaleString()}</span>
                </div>

                {error && (
                    <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
                        {error}
                    </p>
                )}

                <button
                    type="button"
                    onClick={submit}
                    disabled={isSubmitting || cart.length === 0}
                    className="mt-4 w-full rounded-full bg-brand py-3 text-sm font-bold text-white transition hover:bg-brand-deep disabled:opacity-50"
                >
                    {isSubmitting ? "Placing order…" : "Place order"}
                </button>
            </div>
        </div>
    );
}
