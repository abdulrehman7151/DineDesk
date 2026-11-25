import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authtoke";
import SubscriptionCheckoutButton from "./SubscriptionCheckoutButton";
import CancelPendingCheckoutButton from "./CancelPendingCheckoutButton";

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
                status: { in: ["ACTIVE", "PENDING"] },
            },
            orderBy: { createdAt: "desc" },
            select: { status: true },
        }),
    ]);

    return (
        <section className="mx-auto max-w-2xl space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Subscription</h1>
                <p className="mt-2 text-sm text-ink-soft">
                    Pay securely on Safepay. Card details are entered only on
                    Safepay&apos;s hosted checkout.
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
                    <p className="mt-4 text-sm text-ink-soft">
                        Current status: <strong>{subscription.status}</strong>
                    </p>
                ) : null}

                <div className="mt-6">
                    <SubscriptionCheckoutButton
                        disabled={!plan?.isActive || Boolean(subscription)}
                    />
                    {subscription?.status === "PENDING" ? (
                        <CancelPendingCheckoutButton />
                    ) : null}
                </div>
            </div>
        </section>
    );
}
