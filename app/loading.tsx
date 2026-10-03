export default function HomeLoading() {
    return (
        <main className="min-h-screen bg-surface text-ink">
            {/* Header skeleton */}
            <header className="sticky top-0 z-50 border-b border-hairline bg-surface/85 backdrop-blur-md">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
                    <div>
                        <div className="h-6 w-24 animate-pulse rounded bg-surface-warm" />
                        <div className="mt-2 h-3 w-40 animate-pulse rounded bg-surface-warm" />
                    </div>

                    <div className="h-9 w-20 animate-pulse rounded-full bg-surface-warm" />
                </div>
            </header>

            <div className="mx-auto max-w-7xl px-4 pb-32 sm:px-6 lg:px-8">
                {/* Hero skeleton */}
                <section className="py-6">
                    <div className="relative overflow-hidden rounded-card bg-surface-dark p-7 shadow-soft sm:p-9">
                        <div className="relative z-10">
                            <div className="h-4 w-24 animate-pulse rounded bg-white/20" />
                            <div className="mt-3 h-10 w-72 animate-pulse rounded bg-white/20" />
                            <div className="mt-3 h-4 w-96 animate-pulse rounded bg-white/10" />

                            <div className="mt-5 flex flex-wrap gap-2">
                                <div className="h-7 w-40 animate-pulse rounded-full bg-white/10" />
                                <div className="h-7 w-28 animate-pulse rounded-full bg-white/10" />
                            </div>
                        </div>

                        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brand/40 blur-3xl" />
                        <div className="absolute -bottom-20 right-24 h-48 w-48 rounded-full bg-brand/25 blur-3xl" />
                    </div>
                </section>

                {/* Search skeleton */}
                <section className="mt-2">
                    <div className="h-14 w-full animate-pulse rounded-full bg-surface-warm" />
                </section>

                {/* Category chips skeleton */}
                <section className="mt-6">
                    <div className="flex gap-2.5 overflow-x-auto pb-2">
                        {Array.from({ length: 7 }).map((_, i) => (
                            <div
                                key={i}
                                className="h-11 w-24 shrink-0 animate-pulse rounded-full bg-surface-warm"
                            />
                        ))}
                    </div>
                </section>

                {/* Menu heading skeleton */}
                <section className="mt-12">
                    <div className="mb-5">
                        <div className="h-4 w-32 animate-pulse rounded bg-surface-warm" />
                        <div className="mt-2 h-7 w-48 animate-pulse rounded bg-surface-warm" />
                    </div>

                    {/* Grid skeleton */}
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div
                                key={i}
                                className="overflow-hidden rounded-card border border-hairline bg-surface p-3 shadow-soft"
                            >
                                <div className="h-44 w-full animate-pulse rounded-2xl bg-surface-warm" />

                                <div className="flex flex-1 flex-col px-2 pb-2 pt-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="h-4 w-40 animate-pulse rounded bg-surface-warm" />
                                        <div className="h-4 w-24 animate-pulse rounded bg-surface-warm" />
                                    </div>

                                    <div className="mt-3 h-3 w-full animate-pulse rounded bg-surface-warm" />
                                    <div className="mt-2 h-3 w-3/4 animate-pulse rounded bg-surface-warm" />

                                    <div className="mt-4 h-9 w-full animate-pulse rounded-full bg-surface-warm" />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Footer skeleton */}
                <section className="mt-12 rounded-card bg-surface-dark p-7 shadow-soft">
                    <div className="mx-auto h-5 w-40 animate-pulse rounded bg-white/20" />
                    <div className="mx-auto mt-2 h-4 w-64 animate-pulse rounded bg-white/10" />
                    <div className="mt-5 flex flex-wrap justify-center gap-x-6 gap-y-2">
                        <div className="h-4 w-32 animate-pulse rounded bg-white/10" />
                        <div className="h-4 w-32 animate-pulse rounded bg-white/10" />
                        <div className="h-4 w-40 animate-pulse rounded bg-white/10" />
                    </div>
                </section>
            </div>

            {/* Cart bar skeleton */}
            <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-hairline bg-surface/85 p-3 backdrop-blur-md">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
                    <div>
                        <div className="h-3 w-20 animate-pulse rounded bg-surface-warm" />
                        <div className="mt-2 h-4 w-32 animate-pulse rounded bg-surface-warm" />
                    </div>
                    <div className="h-11 w-32 animate-pulse rounded-full bg-surface-warm" />
                </div>
            </div>
        </main>
    );
}