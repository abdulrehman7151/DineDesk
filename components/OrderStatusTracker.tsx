"use client";

import { useEffect, useState } from "react";
import { getOrderStatusAction } from "@/actions/orderStatusAction";

type Status = "PENDING" | "PREPARING" | "READY" | "SERVED" | "CANCELLED";

const STEPS = ["Received", "Preparing", "Ready"];

const STEP_INDEX: Record<Status, number> = {
    PENDING: 0,
    PREPARING: 1,
    READY: 2,
    SERVED: 3,
    CANCELLED: -1,
};

const MESSAGES: Record<Status, string> = {
    PENDING: "Your order has been received",
    PREPARING: "The kitchen is preparing your order",
    READY: "Your order is ready!",
    SERVED: "Served. Enjoy your meal!",
    CANCELLED: "This order was cancelled",
};

export default function OrderStatusTracker({
    orderId,
    restaurantSlug,
    tableId,
    onClose,
}: {
    orderId: number;
    restaurantSlug: string;
    tableId: string;
    onClose: () => void;
}) {
    const [status, setStatus] = useState<Status>("PENDING");

    useEffect(() => {
        let cancelled = false;
        let timer: ReturnType<typeof setTimeout> | undefined;

        async function poll() {
            try {
                const res = await getOrderStatusAction(
                    orderId,
                    restaurantSlug,
                    tableId
                );
                if (cancelled) return;

                if (res.success) {
                    setStatus(res.status);
                    if (res.status === "SERVED" || res.status === "CANCELLED") {
                        return; // finished, stop polling
                    }
                }
            } catch (error) {
                console.error("Order status check failed:", error);
            }

            if (!cancelled) timer = setTimeout(poll, 5000);
        }

        poll();

        return () => {
            cancelled = true;
            if (timer) clearTimeout(timer);
        };
    }, [orderId, restaurantSlug, tableId]);

    const current = STEP_INDEX[status];

    return (
        <div className="fixed bottom-24 left-3 right-3 z-[60] mx-auto max-w-md rounded-2xl border border-hairline bg-surface p-4 shadow-lift">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-xs text-ink-soft">Order #{orderId}</p>
                    <p className="text-sm font-bold text-ink">{MESSAGES[status]}</p>
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close order status"
                    className="rounded-full px-2 text-lg leading-none text-ink-soft hover:text-ink"
                >
                    ×
                </button>
            </div>

            {status !== "CANCELLED" && (
                <div className="mt-4 flex items-center gap-2">
                    {STEPS.map((label, i) => {
                        const done = current >= i;
                        return (
                            <div key={label} className="flex-1">
                                <div
                                    className={`h-1.5 rounded-full ${done ? "bg-brand" : "bg-surface-warm"}`}
                                />
                                <p
                                    className={`mt-1.5 text-[10px] font-semibold uppercase ${done ? "text-brand" : "text-ink-muted"}`}
                                >
                                    {label}
                                </p>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}