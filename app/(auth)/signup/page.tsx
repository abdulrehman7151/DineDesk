"use client";

import React, { useActionState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signup } from "@/actions/authAction";

export const initialState = { success: false, message: "" };

const SignUpPage = () => {
    const router = useRouter();
    const [state, formAction, isPending] = useActionState(signup, initialState);

    // Go to /signin after success
    useEffect(() => {
        if (state.success) {
            setTimeout(() => router.push("/signin"), 1500);
        }
    }, [state.success, router]);

    const inputStyle =
        "w-full rounded-xl border border-hairline bg-surface-tint px-3.5 py-3 text-sm text-ink outline-none transition placeholder:text-ink-muted focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand-soft";

    return (
        <main className="min-h-screen bg-surface px-4 py-10">
            <div className="mx-auto w-full max-w-2xl">

                {/* Logo */}
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand shadow-soft">
                        <span className="text-xl font-bold text-white">D</span>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-ink">DineDesk</h1>
                    <p className="mt-1.5 text-sm text-ink-soft">
                        Restaurant management made simple
                    </p>
                </div>

                {/* Card */}
                <div className="rounded-card border border-hairline bg-surface p-6 shadow-soft sm:p-8">

                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-ink">
                            Create your restaurant account
                        </h2>
                        <p className="mt-1 text-sm text-ink-soft">
                            Set up your restaurant and start managing everything from one place.
                        </p>
                    </div>

                    {/* Message banner */}
                    {state.message && (
                        <div
                            className={`mb-6 rounded-xl border px-4 py-3 text-sm font-medium ${state.success
                                ? "border-green-200 bg-green-50 text-green-700"
                                : "border-red-200 bg-red-50 text-red-700"
                                }`}
                        >
                            {state.message}
                        </div>
                    )}

                    {/* Form */}
                    <form action={formAction} className="space-y-6">

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="sm:col-span-2">
                                <label htmlFor="restaurantName" className="mb-1.5 block text-sm font-semibold text-ink">
                                    Restaurant name
                                </label>
                                <input
                                    id="restaurantName"
                                    name="restaurantName"
                                    type="text"
                                    placeholder="The Urban Kitchen"
                                    disabled={isPending}
                                    className={inputStyle}
                                />
                            </div>

                            <div>
                                <label htmlFor="phone" className="mb-1.5 block text-sm font-semibold text-ink">
                                    Phone number
                                </label>
                                <input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    placeholder="+92 300 1234567"
                                    disabled={isPending}
                                    className={inputStyle}
                                />
                            </div>

                            <div>
                                <label htmlFor="city" className="mb-1.5 block text-sm font-semibold text-ink">
                                    City
                                </label>
                                <input
                                    id="city"
                                    name="city"
                                    type="text"
                                    placeholder="Islamabad"
                                    disabled={isPending}
                                    className={inputStyle}
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <label htmlFor="address" className="mb-1.5 block text-sm font-semibold text-ink">
                                    Restaurant address
                                </label>
                                <input
                                    id="address"
                                    name="address"
                                    type="text"
                                    placeholder="F-7 Markaz, Islamabad"
                                    disabled={isPending}
                                    className={inputStyle}
                                />
                            </div>
                        </div>

                        <div className="border-t border-hairline pt-6">
                            <h3 className="text-base font-bold text-ink">Admin Account</h3>
                            <p className="mt-1 text-xs text-ink-muted">
                                These credentials will be used to manage your restaurant.
                            </p>

                            <div className="mt-4 grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="adminName" className="mb-1.5 block text-sm font-semibold text-ink">
                                        Full name
                                    </label>
                                    <input
                                        id="adminName"
                                        name="adminName"
                                        type="text"
                                        placeholder="Abdul Rehman"
                                        disabled={isPending}
                                        className={inputStyle}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-ink">
                                        Email address
                                    </label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="admin@restaurant.com"
                                        disabled={isPending}
                                        className={inputStyle}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-ink">
                                        Password
                                    </label>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        placeholder="Create a password"
                                        disabled={isPending}
                                        className={inputStyle}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-semibold text-ink">
                                        Confirm password
                                    </label>
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type="password"
                                        placeholder="Confirm your password"
                                        disabled={isPending}
                                        className={inputStyle}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Submit button */}
                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full rounded-full bg-brand py-3.5 text-sm font-bold text-white shadow-soft transition hover:bg-brand-deep disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isPending ? "Creating account..." : "Create Restaurant Account"}
                        </button>

                    </form>

                    <div className="mt-6 border-t border-hairline pt-6 text-center">
                        <p className="text-sm text-ink-soft">
                            Already have a DineDesk account?
                        </p>
                        <Link
                            href="/signin"
                            className="mt-1.5 inline-block text-sm font-bold text-brand hover:text-brand-deep"
                        >
                            Sign in to your account
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

export default SignUpPage;