"use client";

import React, { useActionState, useEffect, startTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signInAction } from "@/actions/authAction";

const initialState = {
    success: false,
    message: "",
    role: "",
};

const SignInPage = () => {
    const router = useRouter();

    const [state, formAction, isPending] = useActionState(
        signInAction,
        initialState
    );

    useEffect(() => {
        if (state.success && state.role) {
            startTransition(() => {
                if (state.role === "admin") {
                    router.replace("/admin");
                } else {
                    router.replace("/");
                }
            });
        }
    }, [state.success, state.role, router]);

    return (
        <main className="flex min-h-screen items-center justify-center bg-surface px-4 py-10">
            <div className="w-full max-w-md">

                {/* Brand */}
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand shadow-soft">
                        <span className="text-xl font-bold text-white">
                            D
                        </span>
                    </div>

                    <h1 className="text-2xl font-bold tracking-tight text-ink">
                        DineDesk
                    </h1>

                    <p className="mt-1.5 text-sm text-ink-soft">
                        Restaurant management made simple
                    </p>
                </div>

                {/* Card */}
                <div className="rounded-card border border-hairline bg-surface p-6 shadow-soft sm:p-8">

                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-ink">
                            Welcome back
                        </h2>

                        <p className="mt-1 text-sm text-ink-soft">
                            Sign in to manage your restaurant.
                        </p>
                    </div>

                    {/* Form */}
                    <form action={formAction} className="space-y-4">

                        {/* Email */}
                        <div>
                            <label
                                htmlFor="email"
                                className="mb-1.5 block text-sm font-semibold text-ink"
                            >
                                Email address
                            </label>

                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                placeholder="admin@restaurant.com"
                                disabled={isPending || state.success}
                                className="w-full rounded-xl border border-hairline bg-surface-tint px-3.5 py-3 text-sm text-ink outline-none transition placeholder:text-ink-muted focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand-soft disabled:opacity-60"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <div className="mb-1.5 flex items-center justify-between">
                                <label
                                    htmlFor="password"
                                    className="block text-sm font-semibold text-ink"
                                >
                                    Password
                                </label>

                                <Link
                                    href="/forgot-password"
                                    className="text-xs font-semibold text-brand hover:text-brand-deep"
                                >
                                    Forgot password?
                                </Link>
                            </div>

                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                placeholder="Enter your password"
                                disabled={isPending || state.success}
                                className="w-full rounded-xl border border-hairline bg-surface-tint px-3.5 py-3 text-sm text-ink outline-none transition placeholder:text-ink-muted focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand-soft disabled:opacity-60"
                            />
                        </div>

                        {/* Remember me */}
                        <div className="flex items-center gap-2 pt-1">
                            <input
                                id="remember"
                                type="checkbox"
                                className="h-4 w-4 rounded border-hairline accent-brand"
                            />

                            <label
                                htmlFor="remember"
                                className="text-sm text-ink-soft"
                            >
                                Remember me
                            </label>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isPending || state.success}
                            className="w-full rounded-full bg-brand py-3.5 text-sm font-bold text-white shadow-soft transition hover:bg-brand-deep disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isPending
                                ? "Signing in..."
                                : state.success
                                    ? "Signed in"
                                    : "Sign In"}
                        </button>

                        {/* Message */}
                        {state.message && (
                            <div
                                role="status"
                                aria-live="polite"
                                className={`rounded-xl border px-4 py-3 text-sm font-medium ${state.success
                                    ? "border-green-200 bg-green-50 text-green-700"
                                    : "border-red-200 bg-red-50 text-red-700"
                                    }`}
                            >
                                {state.message}
                            </div>
                        )}
                    </form>

                    {/* Signup link */}
                    <div className="mt-6 border-t border-hairline pt-5 text-center">
                        <p className="text-sm text-ink-soft">
                            Don&apos;t have a DineDesk account?
                        </p>

                        <Link
                            href="/signup"
                            className="mt-1.5 inline-block text-sm font-bold text-brand hover:text-brand-deep"
                        >
                            Create your restaurant account
                        </Link>
                    </div>
                </div>

                <p className="mt-6 text-center text-xs text-ink-muted">
                    © 2026 DineDesk. All rights reserved.
                </p>
            </div>
        </main>
    );
};

export default SignInPage