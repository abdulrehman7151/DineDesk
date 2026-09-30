export default function MenuLoading() {
    return (
        <div className="space-y-6">

            {/* Header skeleton */}
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <div className="h-8 w-32 animate-pulse rounded bg-surface-warm" />
                    <div className="mt-2 h-4 w-64 animate-pulse rounded bg-surface-warm" />
                </div>
                <div className="h-11 w-28 animate-pulse rounded-full bg-surface-warm" />
            </div>

            {/* Filters skeleton */}
            <div className="rounded-card border border-hairline bg-surface p-4 shadow-soft">
                <div className="flex flex-wrap gap-3">
                    <div className="h-10 min-w-[200px] flex-1 animate-pulse rounded-full bg-surface-warm" />
                    <div className="h-10 w-40 animate-pulse rounded-full bg-surface-warm" />
                    <div className="h-10 w-40 animate-pulse rounded-full bg-surface-warm" />
                </div>
            </div>

            {/* Grid skeleton */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div
                        key={i}
                        className="rounded-card border border-hairline bg-surface p-3 shadow-soft"
                    >
                        <div className="h-40 w-full animate-pulse rounded-2xl bg-surface-warm" />
                        <div className="px-2 pb-2 pt-4">
                            <div className="h-4 w-3/4 animate-pulse rounded bg-surface-warm" />
                            <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-surface-warm" />
                            <div className="mt-4 flex gap-2">
                                <div className="h-8 flex-1 animate-pulse rounded-full bg-surface-warm" />
                                <div className="h-8 flex-1 animate-pulse rounded-full bg-surface-warm" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

        </div>
    );
}