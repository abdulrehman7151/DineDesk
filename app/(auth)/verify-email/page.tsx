"use client";

import React, { Suspense, useActionState, useEffect, useState, startTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Instrument_Serif, JetBrains_Mono, Manrope } from "next/font/google";
import { MailCheck, UtensilsCrossed } from "lucide-react";
import {
    resendVerificationAction,
    verifyEmailAction,
} from "@/actions/emailVerification";

const serif = Instrument_Serif({
    subsets: ["latin"],
    weight: "400",
    style: ["normal", "italic"],
    variable: "--font-serif",
});
const sans = Manrope({ subsets: ["latin"], variable: "--font-sans" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

const verifyInitialState = { success: false, message: "" };
const resendInitialState = { success: false, message: "" };

const inputClass =
    "w-full rounded-lg border border-black/10 bg-white px-3.5 py-3 text-sm text-[#12121f] outline-none transition placeholder:text-[#a6a6b8] focus:border-[var(--dd-accent)] focus:ring-4 focus:ring-[var(--dd-accent-tint)] disabled:opacity-60";

const VerifyEmailForm = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [email, setEmail] = useState(searchParams.get("email") ?? "");
    const [code, setCode] = useState("");

    const [verifyState, verifyFormAction, verifyPending] = useActionState(
        verifyEmailAction,
        verifyInitialState
    );
    const [resendState, resendFormAction, resendPending] = useActionState(
        resendVerificationAction,
        resendInitialState
    );

    useEffect(() => {
        if (verifyState.success) {
            startTransition(() => {
                setTimeout(() => router.replace("/signin"), 1500);
            });
        }
    }, [verifyState.success, router]);

    return (
        <main
            className={`${serif.variable} ${sans.variable} ${mono.variable} dd-root grid min-h-screen bg-[#fafafb] text-[#12121f] lg:grid-cols-[1fr_1.05fr]`}
        >
            <style>{`
                .dd-root{--dd-accent:#a2151c;--dd-accent-soft:#f28b91;--dd-accent-tint:#f6e1e2;--dd-dark:#0e0e1a;font-family:var(--font-sans),ui-sans-serif,system-ui,sans-serif;-webkit-font-smoothing:antialiased}
                .dd-serif{font-family:var(--font-serif),Georgia,"Times New Roman",serif;font-weight:400}
                .dd-mono{font-family:var(--font-mono),ui-monospace,SFMono-Regular,Menlo,monospace}
                .dd-root a:focus-visible,.dd-root button:focus-visible{outline:2px solid var(--dd-accent);outline-offset:3px;border-radius:6px}
            `}</style>

            {/* Left: brand panel (desktop only) */}
            <aside className="relative hidden overflow-hidden bg-[var(--dd-dark)] text-white lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0"
                    style={{
                        background:
                            "radial-gradient(ellipse 70% 55% at 85% 90%, rgba(162,21,28,0.35), transparent 70%)",
                    }}
                />

                <Link href="/" className="relative flex items-center gap-2.5" aria-label="DineDesk home">
                    <span className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-[#12121f]">
                        <UtensilsCrossed size={14} strokeWidth={2.2} />
                    </span>
                    <span className="dd-serif text-[22px] leading-none tracking-tight">DineDesk</span>
                </Link>

                <div className="relative">
                    <h2 className="dd-serif max-w-[11ch] text-[clamp(3rem,5vw,4.75rem)] leading-[0.98] tracking-[-0.02em]">
                        Check your{" "}
                        <em className="italic text-[var(--dd-accent-soft)]">inbox.</em>
                    </h2>
                    <p className="mt-6 max-w-sm text-[15px] leading-7 text-white/55">
                        We sent a 6-digit verification code to your email. Enter it below to unlock your account.
                    </p>
                </div>

                <p className="relative text-xs text-white/35">
                    Restaurant management, with room for hospitality.
                </p>
            </aside>

            {/* Right: form */}
            <section className="flex min-h-screen flex-col px-6 py-8 sm:px-10">
                <div className="flex items-center justify-between lg:justify-end">
                    <Link href="/" className="flex items-center gap-2.5 lg:hidden" aria-label="DineDesk home">
                        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#12121f] text-white">
                            <UtensilsCrossed size={14} strokeWidth={2.2} />
                        </span>
                        <span className="dd-serif text-[22px] leading-none tracking-tight">DineDesk</span>
                    </Link>
                    <Link
                        href="/"
                        className="text-[13px] font-medium text-[#5b5b70] transition hover:text-[#12121f]"
                    >
                        Back to home
                    </Link>
                </div>

                <div className="mx-auto flex w-full max-w-[400px] flex-1 flex-col justify-center py-10">
                    <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--dd-accent-tint)] text-[var(--dd-accent)]">
                        <MailCheck size={22} />
                    </span>

                    <h1 className="dd-serif mt-5 text-[clamp(2.25rem,4.5vw,3.25rem)] leading-[1.02] tracking-[-0.015em]">
                        Verify your <em className="italic text-[var(--dd-accent)]">email.</em>
                    </h1>
                    <p className="mt-3 text-[15px] leading-7 text-[#5b5b70]">
                        Enter the 6-digit code we sent
                        {email ? (
                            <>
                                {" "}to{" "}
                                <span className="font-semibold text-[#12121f]">{email}</span>
                            </>
                        ) : (
                            " to your email"
                        )}
                        . The code expires in 15 minutes.
                    </p>

                    {/* Verify result banner */}
                    {verifyState.message && (
                        <div
                            role="status"
                            aria-live="polite"
                            className={`mt-6 rounded-lg border px-4 py-3 text-sm font-medium ${verifyState.success
                                    ? "border-green-200 bg-green-50 text-green-700"
                                    : "border-red-200 bg-red-50 text-red-700"
                                }`}
                        >
                            {verifyState.message}
                        </div>
                    )}

                    {email ? (
                        <>
                            {/* Code form */}
                            <form action={verifyFormAction} className="mt-8 space-y-5">
                                <input type="hidden" name="email" value={email} />

                                <div>
                                    <label htmlFor="code" className="mb-2 block text-[13px] font-semibold">
                                        Verification code
                                    </label>
                                    <input
                                        id="code"
                                        name="code"
                                        type="text"
                                        inputMode="numeric"
                                        autoComplete="one-time-code"
                                        required
                                        maxLength={6}
                                        minLength={6}
                                        pattern="[0-9]{6}"
                                        placeholder="123456"
                                        value={code}
                                        onChange={(e) =>
                                            setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                                        }
                                        disabled={verifyPending || verifyState.success}
                                        className={`${inputClass} text-center text-lg font-bold tracking-[0.5em]`}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={verifyPending || verifyState.success}
                                    className="w-full rounded-lg bg-[var(--dd-accent)] py-3.5 text-[13px] font-semibold text-white transition hover:bg-[#82101a] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {verifyPending
                                        ? "Verifying..."
                                        : verifyState.success
                                            ? "Verified"
                                            : "Verify email"}
                                </button>
                            </form>

                            {/* Resend form */}
                            <form action={resendFormAction} className="mt-5">
                                <input type="hidden" name="email" value={email} />
                                <button
                                    type="submit"
                                    disabled={resendPending || verifyState.success}
                                    className="w-full rounded-lg border border-black/10 bg-white py-3 text-[13px] font-semibold text-[#12121f] transition hover:border-[var(--dd-accent)] hover:text-[var(--dd-accent)] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {resendPending ? "Sending..." : "Resend code"}
                                </button>
                            </form>

                            {resendState.message && (
                                <div
                                    role="status"
                                    aria-live="polite"
                                    className={`mt-4 rounded-lg border px-4 py-3 text-sm font-medium ${resendState.success
                                            ? "border-green-200 bg-green-50 text-green-700"
                                            : "border-red-200 bg-red-50 text-red-700"
                                        }`}
                                >
                                    {resendState.message}
                                </div>
                            )}

                            <p className="mt-6 text-sm text-[#5b5b70]">
                                Wrong email?{" "}
                                <button
                                    type="button"
                                    onClick={() => setEmail("")}
                                    className="font-semibold text-[var(--dd-accent)] transition hover:text-[#82101a]"
                                >
                                    Enter a different email
                                </button>
                            </p>
                        </>
                    ) : (
                        <>
                            {/* Email entry (no ?email= provided) */}
                            <form
                                action={resendFormAction}
                                onSubmit={(e) => {
                                    const formData = new FormData(e.currentTarget);
                                    setEmail(String(formData.get("email") ?? "").trim());
                                }}
                                className="mt-8 space-y-5"
                            >
                                <div>
                                    <label htmlFor="email" className="mb-2 block text-[13px] font-semibold">
                                        Email address
                                    </label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        required
                                        autoComplete="email"
                                        placeholder="admin@restaurant.com"
                                        disabled={resendPending}
                                        className={inputClass}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={resendPending}
                                    className="w-full rounded-lg bg-[var(--dd-accent)] py-3.5 text-[13px] font-semibold text-white transition hover:bg-[#82101a] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {resendPending ? "Sending..." : "Send verification code"}
                                </button>
                            </form>

                            {resendState.message && (
                                <div
                                    role="status"
                                    aria-live="polite"
                                    className={`mt-4 rounded-lg border px-4 py-3 text-sm font-medium ${resendState.success
                                            ? "border-green-200 bg-green-50 text-green-700"
                                            : "border-red-200 bg-red-50 text-red-700"
                                        }`}
                                >
                                    {resendState.message}
                                </div>
                            )}
                        </>
                    )}

                    <div className="mt-9 border-t border-black/[0.07] pt-6">
                        <p className="text-sm text-[#5b5b70]">
                            Already verified?{" "}
                            <Link
                                href="/signin"
                                className="font-semibold text-[var(--dd-accent)] transition hover:text-[#82101a]"
                            >
                                Sign in to your account
                            </Link>
                        </p>
                    </div>
                </div>

                <p className="text-center text-xs text-[#8b8ba0] lg:text-left">
                    © {new Date().getFullYear()} DineDesk. All rights reserved.
                </p>
            </section>
        </main>
    );
};

const VerifyEmailPage = () => {
    return (
        <Suspense
            fallback={
                <main className="grid min-h-screen place-items-center bg-[#fafafb] text-sm text-[#5b5b70]">
                    Loading…
                </main>
            }
        >
            <VerifyEmailForm />
        </Suspense>
    );
};

export default VerifyEmailPage;
