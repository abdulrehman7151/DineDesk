"use client";

import React, { useActionState, useEffect, useState, startTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Instrument_Serif, JetBrains_Mono, Manrope } from "next/font/google";
import { Eye, EyeOff, UtensilsCrossed } from "lucide-react";
import { signup } from "@/actions/authAction";

const serif = Instrument_Serif({
    subsets: ["latin"],
    weight: "400",
    style: ["normal", "italic"],
    variable: "--font-serif",
});
const sans = Manrope({ subsets: ["latin"], variable: "--font-sans" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const initialState = { success: false, message: "" };

const STEPS = [
    { n: "01", title: "Restaurant profile", note: "Name, address, contact" },
    { n: "02", title: "Admin account", note: "Your login credentials" },
    { n: "03", title: "Start serving", note: "Menu, tables, orders" },
];

const inputClass =
    "w-full rounded-lg border border-black/10 bg-white px-3.5 py-3 text-sm text-[#12121f] outline-none transition placeholder:text-[#a6a6b8] focus:border-[var(--dd-accent)] focus:ring-4 focus:ring-[var(--dd-accent-tint)] disabled:opacity-60";

const SignUpPage = () => {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [state, formAction, isPending] = useActionState(signup, initialState);

    useEffect(() => {
        if (state.success) {
            startTransition(() => {
                setTimeout(() => router.replace("/signin"), 1500);
            });
        }
    }, [state.success, router]);

    return (
        <main
            className={`${serif.variable} ${sans.variable} ${mono.variable} dd-root grid min-h-screen bg-[#fafafb] text-[#12121f] lg:grid-cols-[1fr_1.15fr]`}
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
                            "radial-gradient(ellipse 70% 55% at 15% 10%, rgba(162,21,28,0.35), transparent 70%)",
                    }}
                />

                <Link href="/" className="relative flex items-center gap-2.5" aria-label="DineDesk home">
                    <span className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-[#12121f]">
                        <UtensilsCrossed size={14} strokeWidth={2.2} />
                    </span>
                    <span className="dd-serif text-[22px] leading-none tracking-tight">DineDesk</span>
                </Link>

                <div className="relative">
                    <h2 className="dd-serif max-w-[12ch] text-[clamp(3rem,5vw,4.75rem)] leading-[0.98] tracking-[-0.02em]">
                        Set the table{" "}
                        <em className="italic text-[var(--dd-accent-soft)]">for service.</em>
                    </h2>
                    <p className="mt-6 max-w-sm text-[15px] leading-7 text-white/55">
                        Create your restaurant account and bring menu, tables, and kitchen into one calm place.
                    </p>

                    <ol className="mt-10 max-w-sm space-y-0">
                        {STEPS.map((s, i) => (
                            <li
                                key={s.n}
                                className={`flex items-baseline gap-4 border-t border-white/10 py-4 ${i === STEPS.length - 1 ? "border-b" : ""
                                    }`}
                            >
                                <span className="dd-mono text-[11px] tracking-[0.14em] text-[var(--dd-accent-soft)]">
                                    {s.n}
                                </span>
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold">{s.title}</p>
                                    <p className="dd-mono mt-0.5 text-[10px] uppercase tracking-[0.12em] text-white/40">
                                        {s.note}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ol>
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

                <div className="mx-auto flex w-full max-w-[440px] flex-1 flex-col justify-center py-10">
                    <h1 className="dd-serif text-[clamp(2.25rem,4.5vw,3.25rem)] leading-[1.02] tracking-[-0.015em]">
                        Create your <em className="italic text-[var(--dd-accent)]">account.</em>
                    </h1>
                    <p className="mt-3 text-[15px] leading-7 text-[#5b5b70]">
                        Set up your restaurant and start managing everything from one place.
                    </p>

                    {/* Message banner */}
                    {state.message && (
                        <div
                            role="status"
                            aria-live="polite"
                            className={`mt-6 rounded-lg border px-4 py-3 text-sm font-medium ${state.success
                                    ? "border-green-200 bg-green-50 text-green-700"
                                    : "border-red-200 bg-red-50 text-red-700"
                                }`}
                        >
                            {state.message}
                        </div>
                    )}

                    <form action={formAction} className="mt-8 space-y-7">
                        {/* ── Restaurant details ── */}
                        <fieldset disabled={isPending || state.success} className="space-y-4">
                            <legend className="dd-mono mb-3 text-[10px] uppercase tracking-[0.16em] text-[#8b8ba0]">
                                01 — Restaurant
                            </legend>

                            <div>
                                <label htmlFor="restaurantName" className="mb-2 block text-[13px] font-semibold">
                                    Restaurant name
                                </label>
                                <input
                                    id="restaurantName"
                                    name="restaurantName"
                                    type="text"
                                    required
                                    placeholder="The Urban Kitchen"
                                    className={inputClass}
                                />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="phone" className="mb-2 block text-[13px] font-semibold">
                                        Phone number
                                    </label>
                                    <input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        required
                                        autoComplete="tel"
                                        placeholder="+92 300 1234567"
                                        className={inputClass}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="city" className="mb-2 block text-[13px] font-semibold">
                                        City
                                    </label>
                                    <input
                                        id="city"
                                        name="city"
                                        type="text"
                                        required
                                        placeholder="Islamabad"
                                        className={inputClass}
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="address" className="mb-2 block text-[13px] font-semibold">
                                    Restaurant address
                                </label>
                                <input
                                    id="address"
                                    name="address"
                                    type="text"
                                    required
                                    placeholder="F-7 Markaz, Islamabad"
                                    className={inputClass}
                                />
                            </div>
                        </fieldset>

                        {/* ── Admin account ── */}
                        <fieldset
                            disabled={isPending || state.success}
                            className="space-y-4 border-t border-black/[0.07] pt-7"
                        >
                            <legend className="dd-mono mb-3 text-[10px] uppercase tracking-[0.16em] text-[#8b8ba0]">
                                02 — Admin account
                            </legend>
                            <p className="-mt-1 mb-3 text-xs text-[#8b8ba0]">
                                These credentials will be used to manage your restaurant.
                            </p>

                            <div>
                                <label htmlFor="adminName" className="mb-2 block text-[13px] font-semibold">
                                    Full name
                                </label>
                                <input
                                    id="adminName"
                                    name="adminName"
                                    type="text"
                                    required
                                    autoComplete="name"
                                    placeholder="Abdul Rehman"
                                    className={inputClass}
                                />
                            </div>

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
                                    className={inputClass}
                                />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="password" className="mb-2 block text-[13px] font-semibold">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="password"
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            required
                                            autoComplete="new-password"
                                            placeholder="Create a password"
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

                                <div>
                                    <label htmlFor="confirmPassword" className="mb-2 block text-[13px] font-semibold">
                                        Confirm password
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            type={showConfirm ? "text" : "password"}
                                            required
                                            autoComplete="new-password"
                                            placeholder="Confirm your password"
                                            className={`${inputClass} pr-11`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirm((v) => !v)}
                                            aria-label={showConfirm ? "Hide password" : "Show password"}
                                            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-[#8b8ba0] transition hover:text-[#12121f]"
                                        >
                                            {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </fieldset>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isPending || state.success}
                            className="w-full rounded-lg bg-[var(--dd-accent)] py-3.5 text-[13px] font-semibold text-white transition hover:bg-[#82101a] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isPending
                                ? "Creating account..."
                                : state.success
                                    ? "Account created"
                                    : "Create restaurant account"}
                        </button>
                    </form>

                    <div className="mt-9 border-t border-black/[0.07] pt-6">
                        <p className="text-sm text-[#5b5b70]">
                            Already have a DineDesk account?{" "}
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

export default SignUpPage;