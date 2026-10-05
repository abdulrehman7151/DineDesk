export default function AdminDashboardLoading() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <div className="h-8 w-40 animate-pulse rounded bg-surface-warm" />
                <div className="mt-2 h-4 w-72 animate-pulse rounded bg-surface-warm" />
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div
                        key={i}
                        className="rounded-card border border-hairline bg-surface p-5 shadow-soft"
                    >
                        <div className="h-3 w-24 animate-pulse rounded bg-surface-warm" />
                        <div className="mt-3 h-7 w-20 animate-pulse rounded bg-surface-warm" />
                        <div className="mt-2 h-3 w-28 animate-pulse rounded bg-surface-warm" />
                    </div>
                ))}
            </div>

            {/* Recent Orders */}
            <div className="rounded-card border border-hairline bg-surface shadow-soft">
                <div className="flex items-center justify-between border-b border-hairline px-6 py-4">
                    <div>
                        <div className="h-4 w-32 animate-pulse rounded bg-surface-warm" />
                        <div className="mt-2 h-3 w-48 animate-pulse rounded bg-surface-warm" />
                    </div>
                    <div className="h-4 w-16 animate-pulse rounded bg-surface-warm" />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-hairline text-left text-xs font-bold uppercase tracking-wider text-ink-muted">
                                {["Order", "Table", "Items", "Total", "Status", ""].map(
                                    (h) => (
                                        <th key={h} className="px-6 py-3">
                                            {h}
                                        </th>
                                    )
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {Array.from({ length: 5 }).map((_, i) => (
                                <tr
                                    key={i}
                                    className="border-b border-hairline last:border-0"
                                >
                                    <td className="px-6 py-3.5">
                                        <div className="h-4 w-12 animate-pulse rounded bg-surface-warm" />
                                    </td>
                                    <td className="px-6 py-3.5">
                                        <div className="h-4 w-16 animate-pulse rounded bg-surface-warm" />
                                    </td>
                                    <td className="px-6 py-3.5">
                                        <div className="h-4 w-20 animate-pulse rounded bg-surface-warm" />
                                    </td>
                                    <td className="px-6 py-3.5">
                                        <div className="h-4 w-20 animate-pulse rounded bg-surface-warm" />
                                    </td>
                                    <td className="px-6 py-3.5">
                                        <div className="h-6 w-20 animate-pulse rounded-full bg-surface-warm" />
                                    </td>
                                    <td className="px-6 py-3.5 text-right">
                                        <div className="ml-auto h-4 w-10 animate-pulse rounded bg-surface-warm" />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Two Column */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Top Selling Items */}
                <div className="rounded-card border border-hairline bg-surface p-6 shadow-soft">
                    <div className="h-4 w-36 animate-pulse rounded bg-surface-warm" />
                    <div className="mt-2 h-3 w-48 animate-pulse rounded bg-surface-warm" />

                    <div className="mt-4 space-y-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i}>
                                <div className="flex items-center justify-between">
                                    <div className="h-4 w-40 animate-pulse rounded bg-surface-warm" />
                                    <div className="h-4 w-16 animate-pulse rounded bg-surface-warm" />
                                </div>
                                <div className="mt-2 h-1.5 w-full animate-pulse rounded-full bg-surface-warm" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="rounded-card border border-hairline bg-surface p-6 shadow-soft">
                    <div className="h-4 w-28 animate-pulse rounded bg-surface-warm" />
                    <div className="mt-2 h-3 w-24 animate-pulse rounded bg-surface-warm" />

                    <div className="mt-4 grid grid-cols-2 gap-3">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div
                                key={i}
                                className="h-12 animate-pulse rounded-xl bg-surface-warm"
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}