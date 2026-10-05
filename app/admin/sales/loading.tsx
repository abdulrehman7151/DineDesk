export default function AdminSalesLoading() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <div className="h-8 w-24 animate-pulse rounded bg-surface-warm" />
                    <div className="mt-2 h-4 w-64 animate-pulse rounded bg-surface-warm" />
                </div>

                <div className="flex flex-wrap gap-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div
                            key={i}
                            className="h-10 w-24 animate-pulse rounded-lg bg-surface-warm"
                        />
                    ))}
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 sm:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div
                        key={i}
                        className="rounded-card border border-hairline bg-surface p-5 shadow-soft"
                    >
                        <div className="h-3 w-24 animate-pulse rounded bg-surface-warm" />
                        <div className="mt-3 h-7 w-28 animate-pulse rounded bg-surface-warm" />
                    </div>
                ))}
            </div>

            {/* Revenue Trend Chart */}
            <div className="rounded-card border border-hairline bg-surface p-6 shadow-soft">
                <div className="mb-6">
                    <div className="h-4 w-32 animate-pulse rounded bg-surface-warm" />
                    <div className="mt-2 h-3 w-48 animate-pulse rounded bg-surface-warm" />
                </div>

                {/* Chart skeleton */}
                <div className="relative h-72 w-full">
                    {/* Y-axis labels */}
                    <div className="absolute left-0 top-0 flex h-full flex-col justify-between py-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div
                                key={i}
                                className="h-3 w-8 animate-pulse rounded bg-surface-warm"
                            />
                        ))}
                    </div>

                    {/* Chart area */}
                    <div className="ml-12 h-full">
                        {/* Grid lines */}
                        <div className="flex h-full flex-col justify-between">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="h-px w-full bg-hairline"
                                />
                            ))}
                        </div>

                        {/* Line skeleton - animated shimmer */}
                        <div className="absolute inset-0 ml-12 flex items-center justify-center">
                            <div className="h-2 w-full animate-pulse rounded-full bg-surface-warm opacity-50" />
                        </div>
                    </div>

                    {/* X-axis labels */}
                    <div className="absolute bottom-0 left-12 right-0 flex justify-between">
                        {Array.from({ length: 7 }).map((_, i) => (
                            <div
                                key={i}
                                className="h-3 w-10 animate-pulse rounded bg-surface-warm"
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Revenue Breakdown */}
            <div className="rounded-card border border-hairline bg-surface p-6 shadow-soft">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="h-4 w-36 animate-pulse rounded bg-surface-warm" />
                        <div className="mt-2 h-3 w-64 animate-pulse rounded bg-surface-warm" />
                    </div>

                    <div className="flex rounded-lg border border-hairline p-1">
                        <div className="h-8 w-20 animate-pulse rounded-md bg-surface-warm" />
                        <div className="ml-1 h-8 w-20 animate-pulse rounded-md bg-surface-warm" />
                    </div>
                </div>

                <div className="mt-6 space-y-5">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i}>
                            <div className="mb-1.5 flex items-center justify-between gap-4">
                                <div className="h-4 w-40 animate-pulse rounded bg-surface-warm" />
                                <div className="h-4 w-24 animate-pulse rounded bg-surface-warm" />
                            </div>
                            <div className="h-3 w-full animate-pulse rounded-full bg-surface-warm" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}