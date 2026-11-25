"use client";

import { useState, useTransition } from "react";
import { startBasicSubscriptionCheckout } from "@/actions/subscription";

export default function SubscriptionCheckoutButton({
    disabled,
}: {
    disabled: boolean;
}) {
    const [message, setMessage] = useState("");
    const [isPending, startTransition] = useTransition();

    function startCheckout() {
        setMessage("");
        startTransition(async () => {
            try {
                const result = await startBasicSubscriptionCheckout();

                if ("checkoutUrl" in result) {
                    window.location.assign(result.checkoutUrl);
                    return;
                }

                setMessage(
                    "message" in result && typeof result.message === "string"
                        ? result.message
                        : "Checkout could not be started."
                );
            } catch {
                setMessage("Unable to start checkout. Please try again.");
            }
        });
    }

    return (
        <div>
            <button
                type="button"
                onClick={startCheckout}
                disabled={disabled || isPending}
                className="rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-deep disabled:cursor-not-allowed disabled:opacity-60"
            >
                {isPending ? "Opening secure checkout..." : "Subscribe with Safepay"}
            </button>
            {message ? (
                <p role="alert" className="mt-3 text-sm text-brand">
                    {message}
                </p>
            ) : null}
        </div>
    );
}
