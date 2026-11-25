import Link from "next/link";

export default function SubscriptionSuccessPage() {
    return (
        <main className="mx-auto max-w-xl p-8">
            <h1 className="text-2xl font-bold">Payment received for verification</h1>
            <p className="mt-3 text-sm text-ink-soft">
                Safepay is confirming the payment. Your subscription will only
                become active after our server verifies the payment notification.
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
