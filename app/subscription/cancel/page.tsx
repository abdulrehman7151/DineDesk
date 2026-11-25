import Link from "next/link";

export default function SubscriptionCancelPage() {
    return (
        <main className="mx-auto max-w-xl p-8">
            <h1 className="text-2xl font-bold">Checkout canceled</h1>
            <p className="mt-3 text-sm text-ink-soft">
                No payment was confirmed. You can return to your subscription
                page to try again.
            </p>
            <Link
                href="/admin/subscription"
                className="mt-6 inline-block text-sm font-semibold text-brand hover:text-brand-deep"
            >
                Return to subscription
            </Link>
        </main>
    );
}
