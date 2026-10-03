"use client";

import { useState, useEffect, useActionState, startTransition } from "react";
import { deleteMenuAction, DeleteState } from "@/actions/DeleteMenu";

type Props = {
    id: number;
    itemName: string;
};

const initialState: DeleteState = {
    success: false,
    message: "",
};

export default function DeleteMenuButton({ id, itemName }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [state, formAction, isPending] = useActionState(
        deleteMenuAction,
        initialState
    );

    // Close the modal automatically once the action succeeds
    useEffect(() => {
        if (state.success) {
            setIsOpen(false);
        }
    }, [state.success]);

    // Close on Escape key
    useEffect(() => {
        if (!isOpen) return;

        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape" && !isPending) {
                setIsOpen(false);
            }
        };

        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [isOpen, isPending]);

    // Lock body scroll while the modal is open
    useEffect(() => {
        if (!isOpen) return;
        const original = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = original;
        };
    }, [isOpen]);

    return (
        <>
            {/* Trigger */}
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="flex-1 rounded-full bg-brand py-2 text-xs font-bold text-white transition hover:bg-brand-deep"
            >
                Delete
            </button>

            {/* Modal */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    role="dialog"
                    aria-modal="true"
                >
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
                        onClick={() => {
                            if (!isPending) setIsOpen(false);
                        }}
                    />

                    {/* Dialog */}
                    <div className="relative w-full max-w-md rounded-card border border-hairline bg-surface p-6 shadow-lift sm:p-7">
                        {/* Icon */}
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-soft">
                            <svg
                                className="h-6 w-6 text-brand"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M12 9v4m0 4h.01M10.29 3.86l-8.4 14.55A2 2 0 003.62 21h16.76a2 2 0 001.73-2.59l-8.4-14.55a2 2 0 00-3.42 0z"
                                />
                            </svg>
                        </div>

                        {/* Title */}
                        <h3 className="text-center text-lg font-bold text-ink">
                            Delete this item?
                        </h3>

                        {/* Item name */}
                        <p className="mt-2 text-center text-sm text-ink-soft">
                            You&apos;re about to delete{" "}
                            <span className="font-semibold text-ink">
                                {itemName}
                            </span>
                            . This action cannot be undone.
                        </p>

                        {/* Error message */}
                        {state.message && !state.success && (
                            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
                                {state.message}
                            </div>
                        )}

                        {/* Actions */}
                        <form action={formAction} className="mt-6 flex gap-3">
                            <input type="hidden" name="id" value={id} />

                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                disabled={isPending}
                                className="flex-1 rounded-full border border-hairline bg-surface-tint py-3 text-sm font-bold text-ink transition hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={isPending}
                                className="flex-1 rounded-full bg-brand py-3 text-sm font-bold text-white shadow-soft transition hover:bg-brand-deep disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isPending ? "Deleting..." : "Delete"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}