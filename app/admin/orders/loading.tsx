export default function AdminOrdersLoading() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <div className="h-8 w-32 animate-pulse rounded bg-surface-warm" />
                <div className="mt-2 h-4 w-64 animate-pulse rounded bg-surface-warm" />
            </div>

            {/* Orders Table */}
            <div className="overflow-hidden rounded-card border border-hairline bg-surface shadow-soft">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-hairline text-left text-xs font-bold uppercase tracking-wider text-ink-muted">
                                {["Order ID", "Table", "Items", "Total", "Time", "Status"].map(
                                    (h) => (
                                        <th key={h} className="px-6 py-3.5">
                                            {h}
                                        </th>
                                    )
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {Array.from({ length: 8 }).map((_, i) => (
                                <tr
                                    key={i}
                                    className="border-b border-hairline last:border-0"
                                >
                                    <td className="px-6 py-4">
                                        <div className="h-4 w-12 animate-pulse rounded bg-surface-warm" />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="h-4 w-16 animate-pulse rounded bg-surface-warm" />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="h-4 w-14 animate-pulse rounded bg-surface-warm" />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="h-4 w-20 animate-pulse rounded bg-surface-warm" />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="h-4 w-32 animate-pulse rounded bg-surface-warm" />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="h-6 w-20 animate-pulse rounded-full bg-surface-warm" />
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