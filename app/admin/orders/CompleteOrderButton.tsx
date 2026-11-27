"use client";

import { useState, useTransition } from "react";
import { completeAdminOrderAction } from "@/actions/adminOrderAction";

export default function CompleteOrderButton({
    orderId,
}: {
    orderId: number;
}) {
    const [isPending, startTransition] = useTransition();
    const [message, setMessage] = useState("");

    function onClick() {
        setMessage("");
        startTransition(async () => {
            try {
                const result = await completeAdminOrderAction(orderId);
                if (!result.success) {
                    setMessage(
                        result.message ?? "Could not complete the order."
                    );
                }
            } catch {
                setMessage("Could not complete the order.");
            }
        });
    }

    return (
        <span className="inline-flex flex-col items-start gap-1">
            <button
                type="button"
                onClick={onClick}
                disabled={isPending}
                className="rounded-full border border-hairline bg-surface px-3.5 py-1.5 text-xs font-bold text-ink transition hover:border-brand hover:text-brand disabled:opacity-50"
            >
                {isPending ? "Completing…" : "Complete"}
            </button>
            {message ? (
                <span role="alert" className="text-[11px] text-brand">
                    {message}
                </span>
            ) : null}
        </span>
    );
}
