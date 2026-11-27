"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { startPaddleSubscriptionCheckout } from "@/actions/subscription";

const PADDLE_SCRIPT_URL = "https://cdn.paddle.com/paddle/v2/paddle.js";

type PaddleCheckoutOpenOptions = {
    items: { priceId: string; quantity: number }[];
    customer?: { email: string };
    customData?: Record<string, string>;
    settings?: { successUrl?: string };
};

type PaddleEvent = {
    name: string;
    data?: unknown;
};

declare global {
    interface Window {
        Paddle?: {
            Environment: {
                set: (environment: "sandbox" | "production") => void;
            };
            Initialize: (options: {
                token: string;
                eventCallback?: (event: PaddleEvent) => void;
            }) => void;
            Checkout: {
                open: (options: PaddleCheckoutOpenOptions) => void;
            };
        };
    }
}

let paddleScriptPromise: Promise<void> | null = null;

function loadPaddleScript(): Promise<void> {
    if (paddleScriptPromise) {
        return paddleScriptPromise;
    }
    paddleScriptPromise = new Promise((resolve, reject) => {
        if (typeof window === "undefined" || window.Paddle) {
            resolve();
            return;
        }
        const script = document.createElement("script");
        script.src = PADDLE_SCRIPT_URL;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () =>
            reject(new Error("Failed to load the Paddle checkout script."));
        document.head.appendChild(script);
    });
    return paddleScriptPromise;
}

export default function PaddleCheckoutButton({
    disabled,
    priceId,
}: {
    disabled: boolean;
    priceId: string;
}) {
    const [message, setMessage] = useState("");
    const [isPending, startTransition] = useTransition();
    const paddleReady = useRef(false);

    useEffect(() => {
        const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
        if (!token) {
            setMessage("Paddle checkout is not configured yet.");
            return;
        }
        loadPaddleScript()
            .then(() => {
                // Sandbox deployments (NEXT_PUBLIC_PADDLE_ENV=sandbox,
                // set on the Preview environment in Vercel) must switch
                // Paddle.js to the sandbox environment before
                // initializing, so the checkout opens against the
                // sandbox catalog with test cards. Production omits
                // the variable and stays live.
                if (process.env.NEXT_PUBLIC_PADDLE_ENV === "sandbox") {
                    window.Paddle?.Environment.set("sandbox");
                }
                window.Paddle?.Initialize({
                    token,
                    eventCallback: (event) => {
                        if (event.name === "checkout.error") {
                            setMessage(
                                "Paddle could not open the checkout. Please try again."
                            );
                        }
                    },
                });
                paddleReady.current = true;
            })
            .catch(() => {
                setMessage(
                    "Could not load the Paddle checkout. Please check your connection and try again."
                );
            });
    }, []);

    function startCheckout() {
        setMessage("");
        if (!paddleReady.current || !window.Paddle) {
            setMessage(
                "Checkout is still loading. Please try again in a moment."
            );
            return;
        }
        startTransition(async () => {
            try {
                const result = await startPaddleSubscriptionCheckout(priceId);

                if (!("reference" in result)) {
                    setMessage(
                        "message" in result &&
                            typeof result.message === "string"
                            ? result.message
                            : "Checkout could not be started."
                    );
                    return;
                }

                window.Paddle?.Checkout.open({
                    items: [{ priceId, quantity: 1 }],
                    customer: { email: result.customerEmail },
                    customData: { reference: result.reference },
                    settings: {
                        successUrl: `${window.location.origin}/subscription/success?reference=${encodeURIComponent(result.reference)}`,
                    },
                });
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
                {isPending
                    ? "Opening secure checkout..."
                    : "Subscribe with Paddle"}
            </button>
            {message ? (
                <p role="alert" className="mt-3 text-sm text-brand">
                    {message}
                </p>
            ) : null}
        </div>
    );
}
