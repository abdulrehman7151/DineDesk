export default function AdminAnalyticsLoading() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <div className="h-8 w-28 animate-pulse rounded bg-surface-warm" />
                    <div className="mt-2 h-4 w-72 animate-pulse rounded bg-surface-warm" />
                </div>

                <div className="flex gap-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div
                            key={i}
                            className="h-9 w-20 animate-pulse rounded-full bg-surface-warm"
                        />
                    ))}
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div
                        key={i}
                        className="rounded-card border border-hairline bg-surface p-5 shadow-soft"
                    >
                        <div className="h-3 w-24 animate-pulse rounded bg-surface-warm" />
                        <div className="mt-3 h-7 w-28 animate-pulse rounded bg-surface-warm" />
                    </div>
                ))}
            </div>

            {/* Revenue & Orders Chart */}
            <div className="rounded-card border border-hairline bg-surface p-6 shadow-soft">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <div className="h-4 w-36 animate-pulse rounded bg-surface-warm" />
                        <div className="mt-2 h-3 w-32 animate-pulse rounded bg-surface-warm" />
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                            <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-surface-warm" />
                            <div className="h-3 w-16 animate-pulse rounded bg-surface-warm" />
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-surface-warm" />
                            <div className="h-3 w-14 animate-pulse rounded bg-surface-warm" />
                        </div>
                    </div>
                </div>

                {/* Bar chart skeleton */}
                <div className="flex h-56 items-end justify-between gap-3">
                    {Array.from({ length: 7 }).map((_, i) => (
                        <div
                            key={i}
                            className="flex flex-1 flex-col items-center gap-2"
                        >
                            <div className="flex w-full flex-1 items-end justify-center gap-1">
                                <div
                                    className="w-1/2 animate-pulse rounded-t-lg bg-surface-warm"
                                    style={{
                                        height: `${40 + Math.random() * 50}%`,
                                    }}
                                />
                                <div
                                    className="w-1/2 animate-pulse rounded-t-lg bg-surface-warm/60"
                                    style={{
                                        height: `${30 + Math.random() * 40}%`,
                                    }}
                                />
                            </div>
                            <div className="h-3 w-8 animate-pulse rounded bg-surface-warm" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Two Column */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Peak Hours */}
                <div className="rounded-card border border-hairline bg-surface p-6 shadow-soft">
                    <div className="mb-5">
                        <div className="h-4 w-28 animate-pulse rounded bg-surface-warm" />
                        <div className="mt-2 h-3 w-40 animate-pulse rounded bg-surface-warm" />
                    </div>

                    <div className="space-y-3">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="h-3 w-14 animate-pulse rounded bg-surface-warm" />
                                <div className="h-2 flex-1 animate-pulse rounded-full bg-surface-warm" />
                                <div className="h-3 w-8 animate-pulse rounded bg-surface-warm" />
                            </div>
                        ))}
                    </div>

                    <div className="mt-5 rounded-xl bg-surface-warm px-4 py-3">
                        <div className="h-3 w-40 animate-pulse rounded bg-surface-warm" />
                        <div className="mt-2 h-2.5 w-52 animate-pulse rounded bg-surface-warm" />
                    </div>
                </div>

                {/* Top Selling Items */}
                <div className="rounded-card border border-hairline bg-surface p-6 shadow-soft">
                    <div className="mb-5">
                        <div className="h-4 w-36 animate-pulse rounded bg-surface-warm" />
                        <div className="mt-2 h-3 w-40 animate-pulse rounded bg-surface-warm" />
                    </div>

                    <div className="space-y-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i}>
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-2.5">
                                        <div className="h-6 w-6 animate-pulse rounded-lg bg-surface-warm" />
                                        <div>
                                            <div className="h-4 w-36 animate-pulse rounded bg-surface-warm" />
                                            <div className="mt-1 h-2.5 w-16 animate-pulse rounded bg-surface-warm" />
                                        </div>
                                    </div>
                                    <div className="h-4 w-20 animate-pulse rounded bg-surface-warm" />
                                </div>
                                <div className="mt-2 ml-9 h-1.5 animate-pulse rounded-full bg-surface-warm" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Order Types */}
            <div className="rounded-card border border-hairline bg-surface p-6 shadow-soft">
                <div className="mb-5">
                    <div className="h-4 w-28 animate-pulse rounded bg-surface-warm" />
                    <div className="mt-2 h-3 w-40 animate-pulse rounded bg-surface-warm" />
                </div>

                <div className="grid gap-6 sm:grid-cols-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div
                            key={i}
                            className="rounded-xl border border-hairline bg-surface-tint p-5"
                        >
                            <div className="h-3 w-16 animate-pulse rounded bg-surface-warm" />
                            <div className="mt-3 h-9 w-20 animate-pulse rounded bg-surface-warm" />
                            <div className="mt-2 h-3 w-20 animate-pulse rounded bg-surface-warm" />
                            <div className="mt-3 h-1.5 animate-pulse rounded-full bg-surface-warm" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Category Performance */}
            <div className="rounded-card border border-hairline bg-surface p-6 shadow-soft">
                <div className="mb-5">
                    <div className="h-4 w-40 animate-pulse rounded bg-surface-warm" />
                    <div className="mt-2 h-3 w-64 animate-pulse rounded bg-surface-warm" />
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div
                            key={i}
                            className="rounded-xl border border-hairline bg-surface-tint p-4"
                        >
                            <div className="h-3 w-16 animate-pulse rounded bg-surface-warm" />
                            <div className="mt-2 h-5 w-24 animate-pulse rounded bg-surface-warm" />
                            <div className="mt-2 h-3 w-20 animate-pulse rounded bg-surface-warm" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}