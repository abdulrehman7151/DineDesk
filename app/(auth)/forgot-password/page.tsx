"use client";

import Link from "next/link";
import { useActionState } from "react";
import { ArrowLeft, LockKeyhole, Mail } from "lucide-react";
import { forgotPasswordAction } from "@/actions/password-reset";

const initialState = { success: false, message: "" };

export default function ForgotPasswordPage() {
    const [state, formAction, isPending] = useActionState(
        forgotPasswordAction,
        initialState
    );

    return (
        <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
                <div className="mb-8 flex justify-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                        <LockKeyhole size={28} />
                    </div>
                </div>

                <div className="mb-8 text-center">
                    <h1 className="text-2xl font-bold text-gray-900">
                        Forgot your password?
                    </h1>
                    <p className="mt-2 text-sm text-gray-500">
                        Enter your email address and we&apos;ll send a link if
                        there&apos;s an account associated with it.
                    </p>
                </div>

                <form action={formAction} className="space-y-5">
                    <div>
                        <label
                            htmlFor="email"
                            className="mb-2 block text-sm font-medium text-gray-700"
                        >
                            Email address
                        </label>

                        <div className="relative">
                            <Mail
                                size={18}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            />

                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                autoComplete="email"
                                maxLength={254}
                                placeholder="Enter your email"
                                className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                            />
                        </div>
                    </div>

                    {state.message && (
                        <p
                            role={state.success ? "status" : "alert"}
                            aria-live="polite"
                            className={`text-sm ${
                                state.success ? "text-green-700" : "text-red-600"
                            }`}
                        >
                            {state.message}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full rounded-xl bg-red-600 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isPending ? "Sending..." : "Send reset link"}
                    </button>
                </form>

                <Link
                    href="/signin"
                    className="mt-6 flex items-center justify-center gap-2 text-sm font-medium text-gray-600 transition hover:text-red-600"
                >
                    <ArrowLeft size={16} />
                    Back to login
                </Link>
            </div>
        </main>
    );
}