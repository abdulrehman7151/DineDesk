export default function AdminTablesLoading() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <div className="h-8 w-24 animate-pulse rounded bg-surface-warm" />
                    <div className="mt-2 h-4 w-64 animate-pulse rounded bg-surface-warm" />
                </div>
                <div className="h-11 w-28 animate-pulse rounded-full bg-surface-warm" />
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 sm:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div
                        key={i}
                        className="rounded-card border border-hairline bg-surface p-5 shadow-soft"
                    >
                        <div className="h-3 w-20 animate-pulse rounded bg-surface-warm" />
                        <div className="mt-3 h-7 w-12 animate-pulse rounded bg-surface-warm" />
                    </div>
                ))}
            </div>

            {/* Table Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div
                        key={i}
                        className="rounded-card border border-hairline bg-surface p-5 shadow-soft"
                    >
                        {/* Top row */}
                        <div className="flex items-start justify-between">
                            <div className="h-12 w-12 animate-pulse rounded-2xl bg-surface-warm" />
                            <div className="h-6 w-20 animate-pulse rounded-full bg-surface-warm" />
                        </div>

                        {/* Info */}
                        <div className="mt-4">
                            <div className="h-4 w-24 animate-pulse rounded bg-surface-warm" />
                            <div className="mt-2 h-3 w-16 animate-pulse rounded bg-surface-warm" />
                        </div>

                        {/* Buttons */}
                        <div className="mt-4 flex gap-2">
                            <div className="h-8 flex-1 animate-pulse rounded-full bg-surface-warm" />
                            <div className="h-8 flex-1 animate-pulse rounded-full bg-surface-warm" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}