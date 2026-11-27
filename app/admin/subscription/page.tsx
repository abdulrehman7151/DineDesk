import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authtoke";
import { pendingCheckoutCutoff } from "@/lib/orderLifecycle";
import PaddleCheckoutButton from "@/components/PaddleCheckoutButton";
import { getPriceTier } from "@/lib/payments/paddle";

export default async function SubscriptionPage() {
    const user = await requireRole(["admin"]);
    if (!user) {
        notFound();
    }

    // The price depends on where the visitor is: Pakistan pays the local
    // tier, the USA pays the US tier, every other country the
    // international tier. All charges are in USD.
    const tier = getPriceTier((await headers()).get("x-vercel-ip-country"));

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
    const lastPayment = subscription?.payments[0];

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
                            <strong>{subscription.status}</strong>
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
                        {lastPayment ? (
                            <p>
                                Last payment: {lastPayment.currency}{" "}
                                {(lastPayment.amount / 100).toLocaleString()} ·{" "}
                                {lastPayment.status}
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
            </div>
        </section>
    );
}
