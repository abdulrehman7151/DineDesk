export default function AddItemLoading() {
    return (
        <div className="mx-auto max-w-4xl space-y-6">
            {/* Header */}
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <div className="mb-1 flex items-center gap-2">
                        <div className="h-4 w-24 animate-pulse rounded bg-surface-warm" />
                    </div>
                    <div className="h-8 w-36 animate-pulse rounded bg-surface-warm" />
                    <div className="mt-2 h-4 w-80 animate-pulse rounded bg-surface-warm" />
                </div>
            </div>

            {/* Form Card */}
            <div className="rounded-card border border-hairline bg-surface p-6 shadow-soft sm:p-8">
                <div className="space-y-8">
                    {/* Item Details */}
                    <div className="space-y-5">
                        <div className="h-4 w-24 animate-pulse rounded bg-surface-warm" />

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="sm:col-span-2">
                                <div className="mb-2 h-4 w-24 animate-pulse rounded bg-surface-warm" />
                                <div className="h-12 w-full animate-pulse rounded-xl bg-surface-warm" />
                            </div>

                            <div>
                                <div className="mb-2 h-4 w-20 animate-pulse rounded bg-surface-warm" />
                                <div className="h-12 w-full animate-pulse rounded-xl bg-surface-warm" />
                            </div>

                            <div>
                                <div className="mb-2 h-4 w-24 animate-pulse rounded bg-surface-warm" />
                                <div className="h-12 w-full animate-pulse rounded-xl bg-surface-warm" />
                            </div>

                            <div className="sm:col-span-2">
                                <div className="mb-2 h-4 w-24 animate-pulse rounded bg-surface-warm" />
                                <div className="h-24 w-full animate-pulse rounded-xl bg-surface-warm" />
                            </div>
                        </div>
                    </div>

                    {/* Image Section */}
                    <div className="space-y-5">
                        <div className="h-4 w-24 animate-pulse rounded bg-surface-warm" />

                        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                            <div className="h-48 w-full shrink-0 animate-pulse rounded-2xl bg-surface-warm sm:w-48" />

                            <div className="w-full flex-1 space-y-3">
                                <div className="h-4 w-28 animate-pulse rounded bg-surface-warm" />
                                <div className="h-32 w-full animate-pulse rounded-xl bg-surface-warm" />
                            </div>
                        </div>
                    </div>

                    {/* Availability */}
                    <div className="space-y-5">
                        <div className="h-4 w-24 animate-pulse rounded bg-surface-warm" />
                        <div className="flex items-center justify-between rounded-xl border border-hairline bg-surface-tint p-4">
                            <div>
                                <div className="h-4 w-32 animate-pulse rounded bg-surface-warm" />
                                <div className="mt-2 h-3 w-64 animate-pulse rounded bg-surface-warm" />
                            </div>
                            <div className="h-6 w-11 animate-pulse rounded-full bg-surface-warm" />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col items-center justify-end gap-3 border-t border-hairline pt-6 sm:flex-row">
                        <div className="h-12 w-full animate-pulse rounded-full bg-surface-warm sm:w-24" />
                        <div className="h-12 w-full animate-pulse rounded-full bg-surface-warm sm:w-32" />
                    </div>
                </div>
            </div>
        </div>
    );
}