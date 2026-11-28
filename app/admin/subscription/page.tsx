import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authtoke";
import {
    expireStalePendingSubscriptions,
    pendingCheckoutCutoff,
} from "@/lib/orderLifecycle";
import PaddleCheckoutButton from "@/components/PaddleCheckoutButton";
import CancelPendingCheckoutButton from "@/components/CancelPendingCheckoutButton";
import {
    getPriceTier,
    getPriceTierByAmountMinor,
} from "@/lib/payments/paddle";

// Status badge colours, matching the order-status palette.
const SUBSCRIPTION_STATUS_TONE: Record<string, string> = {
    ACTIVE: "bg-emerald-100 text-emerald-800 border border-emerald-200",
    PENDING: "bg-amber-100 text-amber-800 border border-amber-200",
    PAST_DUE: "bg-red-100 text-red-700 border border-red-200",
    CANCELLED: "bg-zinc-100 text-zinc-600 border border-zinc-200",
    EXPIRED: "bg-zinc-100 text-zinc-600 border border-zinc-200",
};

function subscriptionStatusTone(status: string): string {
    return (
        SUBSCRIPTION_STATUS_TONE[status] ??
        "bg-surface-warm text-ink-soft border border-hairline"
    );
}

// Friendly label for a stored payment status.
function paymentStatusLabel(status: string): string {
    switch (status) {
        case "SUCCEEDED":
            return "Paid";
        case "PENDING":
            return "Pending";
        case "FAILED":
            return "Failed";
        case "REFUNDED":
            return "Refunded";
        default:
            return status;
    }
}

export default async function SubscriptionPage() {
    const user = await requireRole(["admin"]);
    if (!user) {
        notFound();
    }

    // Abandoned checkouts older than a day stop blocking here: they are
    // cancelled on load so they neither block a new checkout nor keep
    // showing as a live pending payment.
    await expireStalePendingSubscriptions(user.restaurantId);

    // The price depends on where the visitor is: Pakistan pays the local
    // tier, the USA pays the US tier, every other country the
    // international tier. All charges are in USD.
    const geoTier = getPriceTier(
        (await headers()).get("x-vercel-ip-country")
    );

    const [plan, subscription] = await Promise.all([
        prisma.subscriptionPlan.findUnique({
            where: { productId: "dinedesk-basic" },
            select: { name: true, price: true, currency: true, isActive: true },
        }),
        prisma.subscription.findFirst({
            where: {
                restaurantId: user.restaurantId,
            },
            orderBy: { createdAt: "desc" },
            select: {
                status: true,
                createdAt: true,
                currentPeriodEnd: true,
                payments: {
                    orderBy: { createdAt: "desc" },
                    take: 1,
                    select: {
                        amount: true,
                        currency: true,
                        status: true,
                        paidAt: true,
                    },
                },
            },
        }),
    ]);

    // If a checkout is already pending, show the price that checkout was
    // started with (stored on its payment) instead of re-deriving a
    // possibly different tier from the visitor's current location — a
    // checkout opened from the US ($39) must not suddenly display as $9
    // when the page is reloaded from Pakistan. The checkout button below
    // uses this same tier, so a retry charges the price shown. With no
    // pending checkout, the geo tier applies.
    const lastPayment = subscription?.payments[0];
    const tier =
        subscription?.status === "PENDING" && lastPayment
            ? (getPriceTierByAmountMinor(lastPayment.amount) ?? geoTier)
            : geoTier;

    // Only an active subscription — or a checkout started in the last
    // day — blocks a new checkout. A PENDING row older than that was
    // abandoned (the customer closed the payment page) and must not stop
    // the restaurant from subscribing. A past-due, cancelled or expired
    // subscription can be replaced by subscribing again.
    const blockingSubscription = await prisma.subscription.findFirst({
        where: {
            restaurantId: user.restaurantId,
            OR: [
                { status: "ACTIVE" },
                {
                    status: "PENDING",
                    createdAt: { gte: pendingCheckoutCutoff() },
                },
            ],
        },
        select: { id: true },
    });
    const checkoutBlocked = blockingSubscription !== null;

    // An ACTIVE subscription has been paid for. If the stored payment
    // row is still PENDING (its transaction.completed event was missed),
    // show it as paid rather than confusing the admin.
    const lastPaymentStatus =
        lastPayment &&
        subscription.status === "ACTIVE" &&
        lastPayment.status === "PENDING"
            ? "SUCCEEDED"
            : lastPayment?.status;

    // A PENDING payment with no payment date means checkout was started
    // but never completed — no money moved. Never present it as a
    // "last payment". Only a paid, failed or refunded payment (or one
    // with a payment date) is shown as a last payment.
    const showLastPayment =
        lastPayment &&
        (lastPaymentStatus === "SUCCEEDED" ||
            lastPaymentStatus === "FAILED" ||
            lastPaymentStatus === "REFUNDED" ||
            lastPayment.paidAt !== null);
    const showNoPaymentYet =
        lastPayment &&
        !showLastPayment &&
        lastPayment.status === "PENDING" &&
        lastPayment.paidAt === null;

    // The cancel button only appears when a recent PENDING checkout is
    // the thing blocking a new one. (checkoutBlocked is also true for
    // an ACTIVE subscription, which must never offer a cancel here.)
    const hasBlockingPending =
        checkoutBlocked && subscription?.status === "PENDING";

    return (
        <section className="mx-auto max-w-2xl space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Subscription</h1>
                <p className="mt-2 text-sm text-ink-soft">
                    Pay securely with Paddle. Card details are entered only in
                    Paddle&apos;s secure checkout.
                </p>
            </div>

            <div className="rounded-card border border-hairline bg-surface p-6 shadow-soft">
                {plan ? (
                    <>
                        <h2 className="text-lg font-bold text-ink">{plan.name}</h2>
                        <p className="mt-2 text-2xl font-bold text-ink">
                            {tier.displayCurrency} {tier.displayAmount}
                            <span className="ml-1 text-sm font-normal text-ink-soft">
                                per month
                            </span>
                        </p>
                        <p className="mt-1 text-xs text-ink-soft">
                            {tier.displayNote}
                        </p>
                    </>
                ) : (
                    <p className="text-sm text-ink-soft">
                        The subscription plan is not configured yet.
                    </p>
                )}

                {subscription ? (
                    <div className="mt-4 space-y-1 text-sm text-ink-soft">
                        <p>
                            Current status:{" "}
                            <span
                                className={`rounded-full border px-2.5 py-1 text-xs font-bold ${subscriptionStatusTone(subscription.status)}`}
                            >
                                {subscription.status}
                            </span>
                        </p>
                        {subscription.currentPeriodEnd ? (
                            <p>
                                Current period ends:{" "}
                                {subscription.currentPeriodEnd.toLocaleDateString(
                                    "en-PK",
                                    {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                    }
                                )}
                            </p>
                        ) : null}
                        {lastPayment &&
                        showLastPayment &&
                        lastPaymentStatus ? (
                            <p>
                                Last payment: {lastPayment.currency}{" "}
                                {(lastPayment.amount / 100).toLocaleString()} ·{" "}
                                {paymentStatusLabel(lastPaymentStatus)}
                                {lastPayment.paidAt
                                    ? ` · ${lastPayment.paidAt.toLocaleDateString(
                                          "en-PK",
                                          {
                                              year: "numeric",
                                              month: "short",
                                              day: "numeric",
                                          }
                                      )}`
                                    : ""}
                            </p>
                        ) : null}
                        {showNoPaymentYet ? (
                            <p>
                                No payment made yet — checkout was started
                                but not completed.
                            </p>
                        ) : null}
                        {subscription.status === "PAST_DUE" ? (
                            <p className="font-semibold text-brand">
                                Your last payment did not go through. Subscribe
                                again below to reactivate your subscription.
                            </p>
                        ) : null}
                    </div>
                ) : null}

                <div className="mt-6">
                    <PaddleCheckoutButton
                        disabled={!plan?.isActive || checkoutBlocked}
                        priceId={tier.paddlePriceId}
                    />
                </div>

                {hasBlockingPending ? (
                    <div className="mt-6 rounded-card border border-amber-200 bg-amber-50 p-4">
                        <p className="text-sm text-ink">
                            A checkout was started but not paid for, so a
                            new checkout is blocked. No money was taken.
                            You can cancel it and subscribe again now.
                        </p>
                        <div className="mt-3">
                            <CancelPendingCheckoutButton />
                        </div>
                    </div>
                ) : null}
            </div>
        </section>
    );
}
