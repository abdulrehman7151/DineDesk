// app/kitchen/KitchenClient.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { updateOrderStatus } from "./actions";
import { logout } from "@/actions/signout";
import { canSetStatus, type UpdatableOrderStatus } from "@/lib/orderPermissions";

type OrderStatus = "PENDING" | "PREPARING" | "READY";

type KitchenOrder = {
    id: number;
    tableNumber: number | null;
    status: OrderStatus;
    createdAt: string;
    orderItems: {
        id: number;
        productName: string;
        quantity: number;
        notes?: string;
    }[];
};

const FILTERS: OrderStatus[] = ["PENDING", "PREPARING", "READY"];

const statusLabels: Record<OrderStatus, string> = {
    PENDING: "New",
    PREPARING: "Preparing",
    READY: "Ready",
};

const statusStyles: Record<OrderStatus, string> = {
    PENDING: "bg-surface-warm text-ink-soft border-hairline",
    PREPARING: "bg-brand-soft text-brand border-brand/20",
    READY: "bg-success-bg text-success-text border-success-text/20",
};

// The one button each order status shows, and who handles the next step
const ACTIONS: Record<
    OrderStatus,
    { to: UpdatableOrderStatus; label: string; style: string; waiting: string }
> = {
    PENDING: {
        to: "PREPARING",
        label: "Start Preparing",
        style: "bg-brand text-white",
        waiting: "Waiting for the kitchen to start",
    },
    PREPARING: {
        to: "READY",
        label: "Mark as Ready",
        style: "bg-success-text text-white",
        waiting: "Being prepared by the kitchen",
    },
    READY: {
        to: "SERVED",
        label: "Mark as Served",
        style: "border border-hairline bg-surface-tint text-ink",
        waiting: "Waiting to be served",
    },
};

function timeAgo(iso: string) {
    const diffMs = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return "just now";
    if (mins === 1) return "1 min ago";
    if (mins < 60) return `${mins} min ago`;
    const hrs = Math.floor(mins / 60);
    return `${hrs}h ${mins % 60}m ago`;
}

export default function KitchenClient({
    initialOrders,
    role,
    staffName,
    showSignOut = false,
}: {
    initialOrders: KitchenOrder[];
    role: string;
    staffName?: string;
    showSignOut?: boolean;
}) {
    const router = useRouter();
    const [filter, setFilter] = useState<OrderStatus>("PENDING");
    const [loadingId, setLoadingId] = useState<number | null>(null);

    useEffect(() => {
        const interval = window.setInterval(() => {
            router.refresh();
        }, 5_000);

        return () => window.clearInterval(interval);
    }, [router]);

    const counts = {
        PENDING: initialOrders.filter((o) => o.status === "PENDING").length,
        PREPARING: initialOrders.filter((o) => o.status === "PREPARING").length,
        READY: initialOrders.filter((o) => o.status === "READY").length,
    };

    const filtered = initialOrders.filter((o) => o.status === filter);

    async function handleButtonClick(
        orderId: number,
        nextStatus: UpdatableOrderStatus
    ) {
        setLoadingId(orderId);

        try {
            const result = await updateOrderStatus(orderId, nextStatus);

            if (!result.success) {
                alert(result.message);
                if (result.code === "UNAUTHORIZED") {
                    router.replace("/signin");
                    return;
                }
            }

            router.refresh();
        } catch (error) {
            alert("Failed to update order");
            console.error(error);
        } finally {
            setLoadingId(null);
        }
    }

    return (
        <div className="min-h-screen bg-surface text-ink">
            {/* Header */}
            <header className="sticky top-0 z-40 border-b border-hairline bg-surface/90 backdrop-blur-md">
                <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-4 lg:px-8">
                    <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-sm font-bold text-white">
                            K
                        </span>
                        <div>
                            <h1 className="text-lg font-bold">Kitchen Display</h1>
                            <p className="text-xs text-ink-soft">
                                Live orders from your tables
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2 rounded-full border border-hairline bg-surface px-4 py-2">
                            <span className="h-2 w-2 animate-pulse rounded-full bg-success-text" />
                            <span className="text-xs font-semibold text-ink-soft">
                                {counts.PENDING + counts.PREPARING} active
                            </span>
                        </div>

                        {showSignOut && (
                            <>
                                <span className="hidden rounded-full border border-hairline bg-surface px-4 py-2 text-xs font-semibold capitalize text-ink-soft sm:inline">
                                    {staffName ? `${staffName} · ${role}` : role}
                                </span>
                                <form action={logout}>
                                    <button
                                        type="submit"
                                        className="rounded-full border border-hairline bg-surface px-4 py-2 text-xs font-semibold text-ink-soft hover:bg-surface-warm"
                                    >
                                        Sign out
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-5 py-6 lg:px-8">
                {/* Tabs */}
                <div className="mb-6 flex flex-wrap gap-2">
                    {FILTERS.map((f) => {
                        const active = filter === f;
                        return (
                            <button
                                key={f}
                                type="button"
                                onClick={() => setFilter(f)}
                                className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold ${active
                                    ? "bg-brand text-white"
                                    : "border border-hairline bg-surface text-ink-soft"
                                    }`}
                            >
                                {statusLabels[f]}
                                <span
                                    className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${active
                                        ? "bg-white/20 text-white"
                                        : "bg-surface-warm text-ink-soft"
                                        }`}
                                >
                                    {counts[f]}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Orders grid */}
                {filtered.length === 0 ? (
                    <div className="rounded-card border border-hairline bg-surface-tint p-16 text-center">
                        <p className="text-sm font-semibold text-ink">
                            No {statusLabels[filter].toLowerCase()} orders
                        </p>
                        <p className="mt-1 text-xs text-ink-soft">
                            New orders will appear here.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {filtered.map((order) => {
                            const itemsCount = order.orderItems.reduce(
                                (sum, i) => sum + i.quantity,
                                0
                            );
                            const isLoading = loadingId === order.id;
                            const action = ACTIONS[order.status];
                            const allowed = canSetStatus(role, action.to);

                            return (
                                <div
                                    key={order.id}
                                    className="flex flex-col overflow-hidden rounded-card border border-hairline bg-surface shadow-soft"
                                >
                                    {/* Order + table */}
                                    <div className="flex items-start justify-between border-b border-hairline px-5 py-4">
                                        <div>
                                            <p className="text-xs text-ink-soft">Order</p>
                                            <p className="text-lg font-bold">#{order.id}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-ink-soft">Table</p>
                                            <p className="text-lg font-bold">
                                                {order.tableNumber ?? "—"}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Time + status */}
                                    <div className="flex items-center justify-between border-b border-hairline px-5 py-2.5">
                                        <span className="text-xs text-ink-muted">
                                            {timeAgo(order.createdAt)}
                                        </span>
                                        <span
                                            className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase ${statusStyles[order.status]}`}
                                        >
                                            {statusLabels[order.status]}
                                        </span>
                                    </div>

                                    {/* Items */}
                                    <div className="flex-1 px-5 py-4">
                                        <ul className="space-y-3">
                                            {order.orderItems.map((item) => (
                                                <li key={item.id} className="flex items-start gap-3">
                                                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-xs font-bold text-brand">
                                                        {item.quantity}×
                                                    </span>
                                                    <div>
                                                        <p className="text-sm font-semibold">
                                                            {item.productName}
                                                        </p>
                                                        {item.notes && (
                                                            <p className="mt-0.5 text-xs italic text-ink-soft">
                                                                “{item.notes}”
                                                            </p>
                                                        )}
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                        <p className="mt-4 text-[11px] font-medium uppercase text-ink-muted">
                                            {itemsCount} item{itemsCount === 1 ? "" : "s"} total
                                        </p>
                                    </div>

                                    {/* Action button (only if this role may do it) */}
                                    <div className="border-t border-hairline p-3">
                                        {allowed ? (
                                            <button
                                                disabled={isLoading}
                                                onClick={() =>
                                                    handleButtonClick(order.id, action.to)
                                                }
                                                className={`w-full rounded-full py-3 text-sm font-bold disabled:opacity-50 ${action.style}`}
                                            >
                                                {isLoading ? "Updating..." : action.label}
                                            </button>
                                        ) : (
                                            <p className="py-3 text-center text-xs font-medium text-ink-muted">
                                                {action.waiting}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}