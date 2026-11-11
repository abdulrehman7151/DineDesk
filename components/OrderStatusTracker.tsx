"use client";

import { useEffect, useRef, useState } from "react";
import { getOrderStatusAction } from "@/actions/orderStatusAction";

type Status = "PENDING" | "PREPARING" | "READY" | "SERVED" | "CANCELLED";

type Props = {
    orderId: number;
    restaurantSlug: string;
    tableId: string;
    tableNumber: number | null;
    initialStatus: Status;
    onFinished: () => void;
};

const AUTO_CLOSE_MS = 10_000;
const POLL_MS = 5_000;

const STEPS = ["Received", "Preparing", "Ready"];

const STEP_INDEX: Record<Status, number> = {
    PENDING: 0,
    PREPARING: 1,
    READY: 2,
    SERVED: 3,
    CANCELLED: -1,
};

const COPY: Record<Status, { title: string; text: string; short: string }> = {
    PENDING: {
        title: "Order received",
        text: "Waiting for the kitchen to start.",
        short: "Received",
    },
    PREPARING: {
        title: "Preparing your food",
        text: "Our chef is cooking your order.",
        short: "Preparing",
    },
    READY: {
        title: "Your order is ready!",
        text: "It's on its way to your table.",
        short: "Ready",
    },
    SERVED: {
        title: "Enjoy your meal!",
        text: "Your order has been served.",
        short: "Served",
    },
    CANCELLED: {
        title: "Order cancelled",
        text: "Please ask a staff member for help.",
        short: "Cancelled",
    },
};

const CSS = `
@keyframes dd-slide-up { from { transform: translateY(100%); } to { transform: translateY(0); } }
@keyframes dd-countdown { from { transform: scaleX(1); } to { transform: scaleX(0); } }
@keyframes dd-pop { 0% { transform: scale(.6); opacity: 0; } 60% { transform: scale(1.08); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
@keyframes dd-pingring { 0% { transform: scale(1); opacity: .6; } 100% { transform: scale(1.55); opacity: 0; } }
@keyframes dd-spin { to { transform: rotate(360deg); } }
@keyframes dd-steam { 0% { transform: translateY(8px); opacity: 0; } 40% { opacity: .9; } 100% { transform: translateY(-12px); opacity: 0; } }
@keyframes dd-lid { 0%, 100% { transform: translateY(0) rotate(0); } 50% { transform: translateY(-3px) rotate(-3deg); } }
@keyframes dd-ring { 0%, 100% { transform: rotate(0); } 15% { transform: rotate(16deg); } 30% { transform: rotate(-14deg); } 45% { transform: rotate(10deg); } 60% { transform: rotate(-8deg); } 75% { transform: rotate(4deg); } }
@keyframes dd-spark { 0%, 100% { transform: scale(0); opacity: 0; } 50% { transform: scale(1); opacity: 1; } }
@keyframes dd-check { to { stroke-dashoffset: 0; } }

.dd-sheet { animation: dd-slide-up .35s cubic-bezier(.2,.8,.2,1) both; }
.dd-countdown { transform-origin: left; animation: dd-countdown 10s linear forwards; }
.dd-pop { transform-box: fill-box; transform-origin: center; animation: dd-pop .5s ease-out both; }
.dd-ping { transform-box: fill-box; transform-origin: center; animation: dd-pingring 1.8s ease-out infinite; }
.dd-hand { transform-box: view-box; transform-origin: 48px 48px; animation: dd-spin 4s linear infinite; }
.dd-steam { opacity: 0; animation: dd-steam 1.8s ease-in-out infinite; }
.dd-lid { transform-box: fill-box; transform-origin: center; animation: dd-lid 1.2s ease-in-out infinite; }
.dd-bell { transform-box: view-box; transform-origin: 48px 16px; animation: dd-ring 1.8s ease-in-out infinite; }
.dd-spark { transform: scale(0); transform-box: fill-box; transform-origin: center; animation: dd-spark 1.6s ease-in-out infinite; }
.dd-check { stroke-dasharray: 48; stroke-dashoffset: 48; animation: dd-check .6s .3s ease-out forwards; }

@media (prefers-reduced-motion: reduce) {
  .dd-sheet, .dd-countdown, .dd-pop, .dd-ping, .dd-hand, .dd-steam, .dd-lid, .dd-bell, .dd-spark { animation: none !important; }
  .dd-steam { opacity: .8; }
  .dd-spark { transform: none; }
  .dd-check { stroke-dashoffset: 0; animation: none !important; }
}
`;

function colorFor(status: Status) {
    if (status === "READY" || status === "SERVED") return "text-success-text";
    if (status === "CANCELLED") return "text-ink-soft";
    return "text-brand";
}

function StatusIllustration({
    status,
    className,
}: {
    status: Status;
    className: string;
}) {
    if (status === "PENDING") {
        // Clock with a ticking hand and a pulsing ring
        return (
            <svg viewBox="0 0 96 96" className={className} aria-hidden="true">
                <circle className="dd-ping" cx="48" cy="48" r="30" fill="none" stroke="currentColor" strokeWidth="3" />
                <circle cx="48" cy="48" r="28" fill="none" stroke="currentColor" strokeWidth="5" />
                <line className="dd-hand" x1="48" y1="48" x2="48" y2="30" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
                <line x1="48" y1="48" x2="60" y2="48" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
                <circle cx="48" cy="48" r="3.5" fill="currentColor" />
            </svg>
        );
    }

    if (status === "PREPARING") {
        // Cooking pot with a wobbling lid and rising steam
        return (
            <svg viewBox="0 0 96 96" className={className} aria-hidden="true">
                <g fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round">
                    <path className="dd-steam" style={{ animationDelay: "0s" }} d="M36 36c-4-5 4-8 0-14" />
                    <path className="dd-steam" style={{ animationDelay: ".5s" }} d="M48 34c-4-5 4-8 0-14" />
                    <path className="dd-steam" style={{ animationDelay: "1s" }} d="M60 36c-4-5 4-8 0-14" />
                </g>
                <g className="dd-lid">
                    <rect x="26" y="40" width="44" height="6" rx="3" fill="currentColor" opacity=".75" />
                    <circle cx="48" cy="38" r="3.5" fill="currentColor" />
                </g>
                <path d="M24 48h48v14a16 16 0 0 1-16 16H40a16 16 0 0 1-16-16z" fill="currentColor" />
                <rect x="14" y="52" width="10" height="6" rx="3" fill="currentColor" />
                <rect x="72" y="52" width="10" height="6" rx="3" fill="currentColor" />
            </svg>
        );
    }

    if (status === "READY") {
        // Ringing service bell with sparkles
        return (
            <svg viewBox="0 0 96 96" className={className} aria-hidden="true">
                <g className="dd-bell">
                    <path d="M48 20c-11 0-18 8-18 19v12l-6 8h48l-6-8V39c0-11-7-19-18-19z" fill="currentColor" />
                    <circle cx="48" cy="68" r="5" fill="currentColor" />
                </g>
                <circle className="dd-spark" style={{ animationDelay: "0s" }} cx="22" cy="26" r="3" fill="currentColor" />
                <circle className="dd-spark" style={{ animationDelay: ".4s" }} cx="76" cy="22" r="2.5" fill="currentColor" />
                <circle className="dd-spark" style={{ animationDelay: ".8s" }} cx="80" cy="46" r="3" fill="currentColor" />
                <circle className="dd-spark" style={{ animationDelay: "1.2s" }} cx="16" cy="48" r="2.5" fill="currentColor" />
            </svg>
        );
    }

    if (status === "SERVED") {
        // Check mark that draws itself
        return (
            <svg viewBox="0 0 96 96" className={className} aria-hidden="true">
                <circle className="dd-pop" cx="48" cy="48" r="30" fill="currentColor" opacity=".15" />
                <circle className="dd-pop" cx="48" cy="48" r="30" fill="none" stroke="currentColor" strokeWidth="4" />
                <path className="dd-check" d="M34 49l10 10 19-21" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        );
    }

    // CANCELLED
    return (
        <svg viewBox="0 0 96 96" className={className} aria-hidden="true">
            <circle className="dd-pop" cx="48" cy="48" r="30" fill="none" stroke="currentColor" strokeWidth="4" />
            <path className="dd-pop" d="M38 38l20 20M58 38L38 58" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
        </svg>
    );
}

export default function OrderStatusTracker({
    orderId,
    restaurantSlug,
    tableId,
    tableNumber,
    initialStatus,
    onFinished,
}: Props) {
    const [status, setStatus] = useState<Status>(initialStatus);
    const [total, setTotal] = useState<number | null>(null);
    const [itemCount, setItemCount] = useState<number | null>(null);

    // The popup opens by itself. "auto" = it closes itself after 10 seconds.
    // When the customer taps the chip it opens with auto = false and stays until X.
    const [open, setOpen] = useState(true);
    const [auto, setAuto] = useState(true);

    const lastStatus = useRef<Status>(initialStatus);
    const isFinal = status === "SERVED" || status === "CANCELLED";
    const color = colorFor(status);
    const copy = COPY[status];
    const current = STEP_INDEX[status];

    // Poll the order status
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
                    setTotal(res.total);
                    setItemCount(res.itemCount);

                    if (res.status !== lastStatus.current) {
                        lastStatus.current = res.status;
                        setStatus(res.status);
                        setOpen(true); // pop up again when the status changes
                    }

                    if (res.status === "SERVED" || res.status === "CANCELLED") {
                        return; // finished, stop polling
                    }
                }
            } catch (error) {
                console.error("Order status check failed:", error);
            }

            if (!cancelled) timer = setTimeout(poll, POLL_MS);
        }

        poll();

        return () => {
            cancelled = true;
            if (timer) clearTimeout(timer);
        };
    }, [orderId, restaurantSlug, tableId]);

    // Auto-close after 10 seconds (restarts whenever the status changes)
    useEffect(() => {
        if (!open || !auto) return;
        const timer = setTimeout(() => setOpen(false), AUTO_CLOSE_MS);
        return () => clearTimeout(timer);
    }, [open, auto, status]);

    // Once the order is finished and the popup is closed, go back to the menu
    useEffect(() => {
        if (isFinal && !open) onFinished();
    }, [isFinal, open, onFinished]);

    const close = () => {
        setOpen(false);
        setAuto(true);
    };

    const openManually = () => {
        setAuto(false);
        setOpen(true);
    };

    return (
        <>
            <style>{CSS}</style>

            {/* Popup: 40% of the screen from the bottom */}
            {open && (
                <div
                    className="fixed inset-x-0 bottom-0 z-[75] flex justify-center"
                    role="dialog"
                    aria-label="Order status"
                >
                    <div className="dd-sheet relative flex h-[40dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl border border-b-0 border-hairline bg-surface shadow-lift">
                        {auto && (
                            <div
                                key={status}
                                className="dd-countdown absolute left-0 top-0 h-1 w-full bg-brand/60"
                            />
                        )}

                        <div className="flex items-center justify-between px-5 pt-4">
                            <p className="text-xs font-semibold text-ink-soft">
                                Order #{orderId}
                                {tableNumber !== null ? ` · Table ${tableNumber}` : ""}
                            </p>
                            <button
                                type="button"
                                onClick={close}
                                aria-label="Close order status"
                                className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-tint text-ink transition hover:bg-surface-warm"
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

                        <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto px-5 pb-4 text-center">
                            <div className={color}>
                                <StatusIllustration
                                    key={status}
                                    status={status}
                                    className="h-20 w-20"
                                />
                            </div>

                            <p className="mt-1 text-lg font-bold text-ink">
                                {copy.title}
                            </p>
                            <p className="text-xs text-ink-soft">{copy.text}</p>

                            {status !== "CANCELLED" && (
                                <div className="mt-3 flex w-full max-w-xs items-center gap-2">
                                    {STEPS.map((label, i) => {
                                        const done = current >= i;
                                        return (
                                            <div key={label} className="flex-1">
                                                <div
                                                    className={`h-1.5 rounded-full transition-colors duration-500 ${done ? "bg-brand" : "bg-surface-warm"}`}
                                                />
                                                <p
                                                    className={`mt-1 text-[10px] font-semibold uppercase ${done ? "text-brand" : "text-ink-muted"}`}
                                                >
                                                    {label}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {itemCount !== null && total !== null && (
                                <p className="mt-3 text-[11px] text-ink-muted">
                                    {itemCount} item{itemCount === 1 ? "" : "s"} · Rs.{" "}
                                    {total.toLocaleString()}
                                    {!isFinal && " · You can add more items anytime"}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Chip: tap to see the status again (stays open until X) */}
            {!open && !isFinal && (
                <button
                    type="button"
                    onClick={openManually}
                    className="fixed bottom-24 right-3 z-[55] flex items-center gap-2 rounded-full border border-hairline bg-surface py-1.5 pl-1.5 pr-4 text-xs font-bold text-ink shadow-lift"
                >
                    <span
                        className={`flex h-8 w-8 items-center justify-center rounded-full bg-surface-tint ${color}`}
                    >
                        <StatusIllustration
                            status={status}
                            className="h-6 w-6"
                        />
                    </span>
                    Order #{orderId} · {copy.short}
                </button>
            )}
        </>
    );
}