"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cancelPendingSubscriptionCheckout } from "@/actions/subscription";

export default function CancelPendingCheckoutButton() {
    const router = useRouter();
    const [message, setMessage] = useState("");
    const [isPending, startTransition] = useTransition();

    function cancelCheckout() {
        setMessage("");
        startTransition(async () => {
            try {
                const result = await cancelPendingSubscriptionCheckout();

                if (result.success) {
                    router.refresh();
                    return;
                }

                setMessage(
                    "message" in result && typeof result.message === "string"
                        ? result.message
                        : "Unable to cancel checkout. Please try again."
                );
            } catch {
                setMessage("Unable to cancel checkout. Please try again.");
            }
        });
    }

    return (
        <div className="mt-5">
            <p className="mb-3 text-sm text-ink-soft">
                Use this only after you have closed Safepay and confirmed that
                you did not complete payment.
            </p>
            <button
                type="button"
                onClick={cancelCheckout}
                disabled={isPending}
                className="rounded-xl border border-hairline px-5 py-3 text-sm font-semibold text-ink transition hover:border-brand disabled:opacity-60"
            >
                {isPending ? "Canceling checkout..." : "Cancel unfinished checkout"}
            </button>
            {message ? (
                <p role="alert" className="mt-3 text-sm text-brand">
                    {message}
                </p>
            ) : null}
        </div>
    );
}
