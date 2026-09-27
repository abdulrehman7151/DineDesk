import React from "react";

const tables = [
    { number: 1, seats: 2, status: "Available", order: null },
    { number: 2, seats: 4, status: "Occupied", order: "#1042" },
    { number: 3, seats: 4, status: "Available", order: null },
    { number: 4, seats: 6, status: "Reserved", order: "7:30 PM" },
    { number: 5, seats: 2, status: "Occupied", order: "#1041" },
    { number: 6, seats: 4, status: "Available", order: null },
    { number: 7, seats: 8, status: "Occupied", order: "#1040" },
    { number: 8, seats: 2, status: "Available", order: null },
    { number: 9, seats: 4, status: "Reserved", order: "8:00 PM" },
    { number: 10, seats: 6, status: "Available", order: null },
    { number: 11, seats: 4, status: "Occupied", order: "#1039" },
    { number: 12, seats: 2, status: "Occupied", order: "#1038" },
];

const statusStyles: Record<string, string> = {
    Available: "bg-success-bg text-success-text",
    Occupied: "bg-brand-soft text-brand",
    Reserved: "bg-surface-warm text-ink-soft",
};

export default function AdminTables() {
    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Tables</h1>
                    <p className="mt-1 text-sm text-ink-soft">Live status of all tables in your restaurant.</p>
                </div>
                <button className="rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-white shadow-soft transition hover:bg-brand-deep">
                    + Add Table
                </button>
            </div>

            {/* Summary */}
            <div className="grid gap-4 sm:grid-cols-3">
                {[
                    { label: "Available", value: "6", tone: "text-success-text" },
                    { label: "Occupied", value: "5", tone: "text-brand" },
                    { label: "Reserved", value: "2", tone: "text-ink-soft" },
                ].map((s) => (
                    <div key={s.label} className="rounded-card border border-hairline bg-surface p-5 shadow-soft">
                        <p className="text-xs font-medium text-ink-soft">{s.label}</p>
                        <p className={`mt-2 text-2xl font-bold tracking-tight ${s.tone}`}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Table grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {tables.map((t) => (
                    <div key={t.number} className="rounded-card border border-hairline bg-surface p-5 shadow-soft transition hover:shadow-lift">
                        <div className="flex items-start justify-between">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-tint text-lg font-bold text-ink">
                                {t.number}
                            </div>
                            <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${statusStyles[t.status]}`}>
                                {t.status}
                            </span>
                        </div>

                        <div className="mt-4">
                            <p className="text-sm font-bold text-ink">Table {t.number}</p>
                            <p className="mt-0.5 text-xs text-ink-muted">{t.seats} seats</p>
                        </div>

                        {t.order && (
                            <div className="mt-4 rounded-xl bg-surface-tint px-3 py-2 text-xs">
                                <span className="text-ink-muted">Order </span>
                                <span className="font-bold text-price">{t.order}</span>
                            </div>
                        )}

                        <button className="mt-4 w-full rounded-full border border-hairline bg-surface-tint py-2 text-xs font-bold text-ink transition hover:border-brand hover:text-brand">
                            Manage Table
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}