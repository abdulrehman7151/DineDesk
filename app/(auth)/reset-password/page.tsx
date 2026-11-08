
"use client";

import { useActionState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
    resetPasswordAction,
    type PasswordResetActionState,
} from "@/actions/password-reset";

const initialState: PasswordResetActionState = {
    success: false,
    message: "",
};

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [state, formAction, isPending] = useActionState(
        resetPasswordAction,
        initialState
    );

    if (!token) {
        return (
            <div className="mx-auto w-full max-w-md text-center">
                <h2 className="text-xl font-semibold">
                    Invalid Reset Link
                </h2>
                <p className="mt-2 text-gray-500">
                    This password reset link is missing its token.
                    Please request a new one.
                </p>
                <Link
                    href="/forgot-password"
                    className="mt-6 inline-flex font-semibold text-red-600 hover:text-red-700"
                >
                    Request another reset link
                </Link>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md mx-auto">
            <h1 className="text-2xl font-bold text-center">
                Reset Your Password
            </h1>

            <p className="text-center text-gray-500 mt-2 mb-6">
                Enter your new password below.
            </p>

            {state.success ? (
                <div className="text-center">
                    <p role="status" className="text-sm text-green-700">
                        {state.message}
                    </p>
                    <Link
                        href="/signin"
                        className="mt-6 inline-flex font-semibold text-red-600 hover:text-red-700"
                    >
                        Continue to sign in
                    </Link>
                </div>
            ) : (
                <form action={formAction} className="space-y-5">
                    <input type="hidden" name="token" value={token} />

                    <div>
                        <label
                            htmlFor="password"
                            className="mb-2 block text-sm font-medium"
                        >
                            New Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            name="password"
                            autoComplete="new-password"
                            placeholder="Enter new password"
                            required
                            minLength={8}
                            maxLength={72}
                            className="w-full rounded-lg border p-3 outline-none focus:ring-2 focus:ring-red-500"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="confirmPassword"
                            className="mb-2 block text-sm font-medium"
                        >
                            Confirm Password
                        </label>
                        <input
                            id="confirmPassword"
                            type="password"
                            name="confirmPassword"
                            autoComplete="new-password"
                            placeholder="Confirm new password"
                            required
                            minLength={8}
                            maxLength={72}
                            className="w-full rounded-lg border p-3 outline-none focus:ring-2 focus:ring-red-500"
                        />
                    </div>

                    {state.message && (
                        <p
                            role="alert"
                            aria-live="polite"
                            className="text-sm text-red-600"
                        >
                            {state.message}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full rounded-lg bg-red-600 p-3 font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isPending ? "Resetting Password..." : "Reset Password"}
                    </button>
                </form>
            )}
            {!state.success && (
                <p className="mt-5 text-center text-sm text-gray-500">
                    Link expired or invalid?{" "}
                    <Link
                        href="/forgot-password"
                        className="font-semibold text-red-600 hover:text-red-700"
                    >
                        Request another
                    </Link>
                </p>
            )}
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<p className="text-center">Loading...</p>}>
            <ResetPasswordForm />
        </Suspense>
    );
}
