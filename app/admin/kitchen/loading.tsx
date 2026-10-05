export default function AdminKitchenLoading() {
    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="h-8 w-28 animate-pulse rounded bg-surface-warm" />
                <div className="h-5 w-32 animate-pulse rounded bg-surface-warm" />
            </div>

            {/* Filter tabs */}
            <div className="flex gap-2">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div
                        key={i}
                        className="h-10 w-32 animate-pulse rounded-lg bg-surface-warm"
                    />
                ))}
            </div>

            {/* Orders grid */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div
                        key={i}
                        className="space-y-3 rounded-xl border border-hairline bg-surface p-4"
                    >
                        {/* Order header */}
                        <div className="flex justify-between">
                            <div className="h-5 w-24 animate-pulse rounded bg-surface-warm" />
                            <div className="h-4 w-20 animate-pulse rounded bg-surface-warm" />
                        </div>

                        {/* Items */}
                        <div className="space-y-2">
                            {Array.from({ length: 3 }).map((_, j) => (
                                <div
                                    key={j}
                                    className="h-4 w-full animate-pulse rounded bg-surface-warm"
                                />
                            ))}
                        </div>

                        {/* Action button */}
                        <div className="flex gap-2 pt-2">
                            <div className="h-10 flex-1 animate-pulse rounded-lg bg-surface-warm" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}