"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cancelPendingSubscriptionCheckout } from "@/actions/subscription";

// Cancels a checkout that was started but never paid for, so the
// restaurant can subscribe again immediately. Shown only when a recent
// PENDING checkout is blocking a new one — never for an active or paid
// subscription.
export default function CancelPendingCheckoutButton() {
    const [message, setMessage] = useState("");
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    function cancelCheckout() {
        setMessage("");
        startTransition(async () => {
            try {
                const result = await cancelPendingSubscriptionCheckout();
                if (!result.success) {
                    setMessage(
                        result.message ||
                            "Could not cancel the pending checkout. Please try again."
                    );
                    return;
                }
                router.refresh();
            } catch {
                setMessage(
                    "Could not cancel the pending checkout. Please try again."
                );
            }
        });
    }

    return (
        <div>
            <button
                type="button"
                onClick={cancelCheckout}
                disabled={isPending}
                className="rounded-xl border border-amber-300 bg-white px-5 py-3 text-sm font-semibold text-amber-800 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
                {isPending
                    ? "Cancelling..."
                    : "Cancel pending checkout and try again"}
            </button>
            {message ? (
                <p role="alert" className="mt-3 text-sm text-brand">
                    {message}
                </p>
            ) : null}
        </div>
    );
}
