"use client";

import { useState } from "react";
import Link from "next/link";

export type OrderNotification = {
    id: number;
    tableNumber: number | null;
    total: number;
    status: string;
    createdAt: string;
};

export default function NotificationsBell({
    notifications,
}: {
    notifications: OrderNotification[];
}) {
    const [open, setOpen] = useState(false);

    return (
        <div className="relative">
            <button
                type="button"
                aria-label="Notifications"
                aria-expanded={open}
                onClick={() => setOpen((current) => !current)}
                className="relative flex h-9 w-9 items-center justify-center rounded-full border border-hairline bg-surface text-ink-soft transition hover:text-ink"
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
                        strokeWidth="2"
                        d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0a3 3 0 11-6 0"
                    />
                </svg>
                {notifications.length > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-white">
                        {notifications.length}
                    </span>
                )}
            </button>

            {open && (
                <>
                    <button
                        type="button"
                        aria-label="Close notifications"
                        onClick={() => setOpen(false)}
                        className="fixed inset-0 z-40 cursor-default"
                    />
                    <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-card border border-hairline bg-surface shadow-lift">
                        <div className="flex items-center justify-between border-b border-hairline px-4 py-3">
                            <p className="text-sm font-bold text-ink">
                                Active orders
                            </p>
                            <Link
                                href="/admin/orders"
                                onClick={() => setOpen(false)}
                                className="text-xs font-semibold text-brand hover:text-brand-deep"
                            >
                                View all →
                            </Link>
                        </div>

                        {notifications.length === 0 ? (
                            <p className="px-4 py-6 text-center text-sm text-ink-soft">
                                No active orders right now.
                            </p>
                        ) : (
                            <ul className="max-h-80 overflow-y-auto">
                                {notifications.map((order) => (
                                    <li key={order.id}>
                                        <Link
                                            href="/admin/orders"
                                            onClick={() => setOpen(false)}
                                            className="block border-b border-hairline px-4 py-3 transition last:border-0 hover:bg-surface-tint"
                                        >
                                            <div className="flex items-center justify-between gap-3">
                                                <span className="text-sm font-bold text-ink">
                                                    Order #{order.id}
                                                    {order.tableNumber != null
                                                        ? ` · Table ${order.tableNumber}`
                                                        : ""}
                                                </span>
                                                <span className="shrink-0 rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand">
                                                    {order.status.toLowerCase()}
                                                </span>
                                            </div>
                                            <p className="mt-1 text-xs text-ink-soft">
                                                Rs. {order.total.toLocaleString()} ·{" "}
                                                {new Date(
                                                    order.createdAt
                                                ).toLocaleString()}
                                            </p>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
