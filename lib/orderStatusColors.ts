// The single place for order-status and money-metric colours.
// Every screen that shows a status badge, a filter tab, an action button
// or a money stat reads from here, so a status always looks the same
// wherever it appears. All class strings are full literals — Tailwind v4
// only generates classes it sees literally, so never build these names
// dynamically (no template-string colour interpolation).

export const ORDER_STATUS_TONE: Record<string, string> = {
    PENDING: "bg-sky-100 text-sky-800 border border-sky-200",
    PREPARING: "bg-amber-100 text-amber-800 border border-amber-200",
    READY: "bg-violet-100 text-violet-800 border border-violet-200",
    SERVED: "bg-emerald-100 text-emerald-800 border border-emerald-200",
    COMPLETED: "bg-success-bg text-success-text border border-success-text/20",
    EXPIRED: "bg-zinc-100 text-zinc-600 border border-zinc-200",
    CANCELLED: "bg-red-100 text-red-700 border border-red-200",
};

export function orderStatusTone(status: string): string {
    return (
        ORDER_STATUS_TONE[status] ??
        "bg-surface-warm text-ink-soft border border-hairline"
    );
}

// Filled colours, for active filter tabs and action buttons.
export const ORDER_STATUS_SOLID: Record<string, string> = {
    PENDING: "bg-sky-600 text-white",
    PREPARING: "bg-amber-500 text-white",
    READY: "bg-violet-600 text-white",
    SERVED: "bg-emerald-600 text-white",
    COMPLETED: "bg-success-text text-white",
    EXPIRED: "bg-zinc-500 text-white",
    CANCELLED: "bg-red-600 text-white",
};

export type MetricToneKey = "revenue" | "orders" | "tables" | "average";

// Kept deliberately restrained: the number stays dark and only a small
// dot carries the metric colour, so the cards read professional rather
// than a rainbow of bright values and bars.
export const METRIC_TONE: Record<MetricToneKey, { dot: string }> = {
    revenue: { dot: "bg-emerald-500" },
    orders: { dot: "bg-sky-500" },
    tables: { dot: "bg-violet-500" },
    average: { dot: "bg-amber-500" },
};

export const CATEGORY_BAR_COLORS = [
    "bg-emerald-500",
    "bg-sky-500",
    "bg-amber-500",
    "bg-violet-500",
    "bg-rose-500",
    "bg-teal-500",
];

// Text colours matching CATEGORY_BAR_COLORS row by row, so a category
// label can use the same hue as its bar (same index, darker shade for
// readability). Kept as full literals for the same Tailwind reason.
export const CATEGORY_TEXT_COLORS = [
    "text-emerald-700",
    "text-sky-700",
    "text-amber-700",
    "text-violet-700",
    "text-rose-700",
    "text-teal-700",
];
