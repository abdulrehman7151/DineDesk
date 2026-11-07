"use client";

import React, { useActionState, useEffect, useState, startTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Instrument_Serif, JetBrains_Mono, Manrope } from "next/font/google";
import { Eye, EyeOff, UtensilsCrossed } from "lucide-react";
import { signInAction } from "@/actions/authAction";

const serif = Instrument_Serif({
    subsets: ["latin"],
    weight: "400",
    style: ["normal", "italic"],
    variable: "--font-serif",
});
const sans = Manrope({ subsets: ["latin"], variable: "--font-sans" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

const initialState = {
    success: false,
    message: "",
    role: "",
};

const PREVIEW = [
    { id: "#024", table: "Table 08", name: "Truffle mushroom burger", status: "Ready", tone: "bg-emerald-100 text-emerald-700" },
    { id: "#025", table: "Table 03", name: "Crispy chicken bowl", status: "Preparing", tone: "bg-[var(--dd-accent-tint)] text-[var(--dd-accent)]" },
    { id: "#026", table: "Table 11", name: "Garden greens", status: "New", tone: "bg-amber-100 text-amber-800" },
];

const inputClass =
    "w-full rounded-lg border border-black/10 bg-white px-3.5 py-3 text-sm text-[#12121f] outline-none transition placeholder:text-[#a6a6b8] focus:border-[var(--dd-accent)] focus:ring-4 focus:ring-[var(--dd-accent-tint)] disabled:opacity-60";

const SignInPage = () => {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);

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
                        Make room for{" "}
                        <em className="italic text-[var(--dd-accent-soft)]">great service.</em>
                    </h2>
                    <p className="mt-6 max-w-sm text-[15px] leading-7 text-white/55">
                        Sign in to manage your menu, follow incoming orders, and keep your kitchen in sync.
                    </p>

                    <div
                        aria-hidden="true"
                        className="mt-10 max-w-sm rounded-2xl bg-white p-4 text-[#12121f] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)]"
                    >
                        <p className="dd-mono text-[10px] uppercase tracking-[0.14em] text-[#8b8ba0]">
                            Kitchen orders
                        </p>
                        <ul className="mt-3 divide-y divide-black/[0.06]">
                            {PREVIEW.map((o) => (
                                <li key={o.id} className="flex items-center justify-between gap-3 py-2.5">
                                    <div className="min-w-0">
                                        <p className="truncate text-xs font-bold">{o.name}</p>
                                        <p className="dd-mono mt-0.5 text-[10px] text-[#8b8ba0]">
                                            {o.id}, {o.table}
                                        </p>
                                    </div>
                                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${o.tone}`}>
                                        {o.status}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
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
                    <h1 className="dd-serif text-[clamp(2.5rem,5vw,3.5rem)] leading-[1.02] tracking-[-0.015em]">
                        Welcome <em className="italic text-[var(--dd-accent)]">back.</em>
                    </h1>
                    <p className="mt-3 text-[15px] leading-7 text-[#5b5b70]">
                        Sign in to manage your restaurant.
                    </p>

                    <form action={formAction} className="mt-9 space-y-5">
                        {/* Email */}
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
                                disabled={isPending || state.success}
                                className={inputClass}
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <div className="mb-2 flex items-center justify-between">
                                <label htmlFor="password" className="block text-[13px] font-semibold">
                                    Password
                                </label>
                                <Link
                                    href="/forgot-password"
                                    className="text-xs font-semibold text-[var(--dd-accent)] transition hover:text-[#82101a]"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    autoComplete="current-password"
                                    placeholder="Enter your password"
                                    disabled={isPending || state.success}
                                    className={`${inputClass} pr-11`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                    className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-[#8b8ba0] transition hover:text-[#12121f]"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* Remember me */}
                        <div className="flex items-center gap-2.5">
                            <input
                                id="remember"
                                type="checkbox"
                                className="h-4 w-4 rounded border-black/20 accent-[#a2151c]"
                            />
                            <label htmlFor="remember" className="text-sm text-[#5b5b70]">
                                Remember me
                            </label>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isPending || state.success}
                            className="w-full rounded-lg bg-[var(--dd-accent)] py-3.5 text-[13px] font-semibold text-white transition hover:bg-[#82101a] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isPending ? "Signing in..." : state.success ? "Signed in" : "Sign in"}
                        </button>

                        {/* Message */}
                        {state.message && (
                            <div
                                role="status"
                                aria-live="polite"
                                className={`rounded-lg border px-4 py-3 text-sm font-medium ${state.success
                                        ? "border-green-200 bg-green-50 text-green-700"
                                        : "border-red-200 bg-red-50 text-red-700"
                                    }`}
                            >
                                {state.message}
                            </div>
                        )}
                    </form>

                    <div className="mt-9 border-t border-black/[0.07] pt-6">
                        <p className="text-sm text-[#5b5b70]">
                            Don&apos;t have a DineDesk account?{" "}
                            <Link
                                href="/signup"
                                className="font-semibold text-[var(--dd-accent)] transition hover:text-[#82101a]"
                            >
                                Create your restaurant account
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

export default SignInPage;