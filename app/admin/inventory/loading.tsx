export default function AdminInventoryLoading() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <div className="h-8 w-28 animate-pulse rounded bg-surface-warm" />
                    <div className="mt-2 h-4 w-64 animate-pulse rounded bg-surface-warm" />
                </div>
                <div className="h-11 w-28 animate-pulse rounded-full bg-surface-warm" />
            </div>

            {/* Alerts */}
            <div className="rounded-card border border-hairline bg-brand-soft p-5">
                <div className="h-4 w-48 animate-pulse rounded bg-brand/10" />
                <div className="mt-2 h-3 w-64 animate-pulse rounded bg-brand/10" />
            </div>

            {/* Inventory Table */}
            <div className="overflow-hidden rounded-card border border-hairline bg-surface shadow-soft">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-hairline text-left text-xs font-bold uppercase tracking-wider text-ink-muted">
                                {["Item", "Stock", "Threshold", "Status", ""].map(
                                    (h) => (
                                        <th key={h} className="px-6 py-3.5">
                                            {h}
                                        </th>
                                    )
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {Array.from({ length: 7 }).map((_, i) => (
                                <tr
                                    key={i}
                                    className="border-b border-hairline last:border-0"
                                >
                                    <td className="px-6 py-4">
                                        <div className="h-4 w-32 animate-pulse rounded bg-surface-warm" />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="h-4 w-20 animate-pulse rounded bg-surface-warm" />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="h-4 w-16 animate-pulse rounded bg-surface-warm" />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="h-6 w-20 animate-pulse rounded-full bg-surface-warm" />
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="ml-auto h-4 w-14 animate-pulse rounded bg-surface-warm" />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}