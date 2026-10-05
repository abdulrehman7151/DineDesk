export default function AdminStaffLoading() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="h-8 w-20 animate-pulse rounded bg-surface-warm" />
                <div className="h-11 w-32 animate-pulse rounded-full bg-surface-warm" />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
                <div className="h-11 min-w-[200px] flex-1 animate-pulse rounded-lg bg-surface-warm" />
                <div className="h-11 w-40 animate-pulse rounded-lg bg-surface-warm" />
            </div>

            {/* Staff Table */}
            <div className="overflow-hidden rounded-card border border-hairline bg-surface shadow-soft">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-hairline text-left text-xs font-bold uppercase tracking-wider text-ink-muted">
                                {["Name", "Role", "Email", "Status", ""].map(
                                    (h) => (
                                        <th key={h} className="px-6 py-3.5">
                                            {h}
                                        </th>
                                    )
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {Array.from({ length: 6 }).map((_, i) => (
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
                                        <div className="h-4 w-40 animate-pulse rounded bg-surface-warm" />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="h-6 w-20 animate-pulse rounded-full bg-surface-warm" />
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="ml-auto h-4 w-20 animate-pulse rounded bg-surface-warm" />
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