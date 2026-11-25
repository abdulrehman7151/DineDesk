import Link from "next/link";
import { prisma } from "@/lib/prisma";

// SafePay redirects here after checkout. This page is NOT proof of payment:
// the subscription only becomes ACTIVE when SafePay's webhook confirms the
// payment on the server. The reference is the random id we sent SafePay at
// checkout, so looking it up here is safe without a sign-in.
export default async function SubscriptionSuccessPage({
    searchParams,
}: {
    searchParams: Promise<{ reference?: string }>;
}) {
    const { reference } = await searchParams;

    const subscription = reference
        ? await prisma.subscription.findUnique({
              where: { reference },
              select: { status: true, currentPeriodEnd: true },
          })
        : null;

    return (
        <main className="mx-auto max-w-xl p-8">
            <h1 className="text-2xl font-bold">Payment received for verification</h1>
            <p className="mt-3 text-sm text-ink-soft">
                Safepay is confirming the payment. Your subscription will only
                become active after our server verifies the payment
                notification. That usually takes a few moments — refresh your
                subscription page to see the updated status.
            </p>

            {reference ? (
                <p className="mt-4 text-sm text-ink-soft">
                    Reference:{" "}
                    <span className="font-mono break-all">{reference}</span>
                    {subscription ? (
                        <>
                            <br />
                            Subscription status:{" "}
                            <strong>{subscription.status}</strong>
                            {subscription.currentPeriodEnd ? (
                                <>
                                    <br />
                                    Current period ends:{" "}
                                    {subscription.currentPeriodEnd.toLocaleDateString(
                                        "en-PK",
                                        {
                                            year: "numeric",
                                            month: "short",
                                            day: "numeric",
                                        }
                                    )}
                                </>
                            ) : null}
                        </>
                    ) : (
                        <>
                            <br />
                            No subscription was found for this reference yet.
                            If this message stays, contact support with the
                            reference above.
                        </>
                    )}
                </p>
            ) : null}

            <Link
                href="/admin/subscription"
                className="mt-6 inline-block text-sm font-semibold text-brand hover:text-brand-deep"
            >
                Return to subscription
            </Link>
        </main>
    );
}
