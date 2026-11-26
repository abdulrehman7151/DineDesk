import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authtoke";
import PaddleCheckoutButton from "./PaddleCheckoutButton";
import CancelPendingCheckoutButton from "./CancelPendingCheckoutButton";
import { PADDLE_PRICE_ID } from "@/lib/payments/paddle";

export default async function SubscriptionPage() {
    const user = await requireRole(["admin"]);
    if (!user) {
        notFound();
    }

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

    // Only an active (or in-progress) subscription blocks a new checkout.
    // A past-due, cancelled or expired subscription can be replaced by
    // subscribing again.
    const checkoutBlocked =
        subscription?.status === "ACTIVE" ||
        subscription?.status === "PENDING";
    const lastPayment = subscription?.payments[0];

    return (
        <section className="mx-auto max-w-2xl space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Subscription</h1>
                <p className="mt-2 text-sm text-ink-soft">
                    Pay securely with Paddle (USD 5.00/month for
                    international cards). Card details are entered only in
                    Paddle&apos;s secure checkout.
                </p>
            </div>

            <div className="rounded-card border border-hairline bg-surface p-6 shadow-soft">
                {plan ? (
                    <>
                        <h2 className="text-lg font-bold text-ink">{plan.name}</h2>
                        <p className="mt-2 text-2xl font-bold text-ink">
                            {plan.currency} {(plan.price / 100).toLocaleString()}
                            <span className="ml-1 text-sm font-normal text-ink-soft">
                                per month
                            </span>
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
                        priceId={PADDLE_PRICE_ID}
                    />
                    {subscription?.status === "PENDING" ? (
                        <CancelPendingCheckoutButton />
                    ) : null}
                </div>
            </div>
        </section>
    );
}
