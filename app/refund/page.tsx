import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Refund Policy | DineDesk",
  description:
    "Refund Policy for DineDesk. When refunds are available and how to request one.",
};

const LEGAL_LINKS = [
  { href: "/terms", label: "Terms of Service" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/refund", label: "Refund Policy" },
];

export default function RefundPage() {
  return (
    <main className="min-h-screen bg-surface text-ink">
      <header className="border-b border-hairline">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-4 lg:px-10">
          <Link href="/" className="text-lg font-bold tracking-tight">
            Dine<span className="text-brand">Desk</span>
          </Link>
          <Link href="/" className="text-sm text-ink-soft transition hover:text-brand">
            Back to home
          </Link>
        </div>
      </header>

      <article className="mx-auto max-w-[800px] px-6 py-12 lg:px-10">
        <p className="text-sm font-semibold text-brand">DineDesk</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          Refund Policy
        </h1>
        <p className="mt-3 text-sm text-ink-muted">Effective date: 26 November 2026</p>

        <p className="mt-6 leading-relaxed text-ink-soft">
          DineDesk is a restaurant-management platform billed by monthly
          subscription: Rs 1,500 per month for customers in Pakistan, and USD 5
          per month for international customers (paid via Paddle). This policy
          explains when a refund is available.
        </p>

        <section className="mt-10">
          <h2 className="text-xl font-bold">1. Cancelling your subscription</h2>
          <p className="mt-3 leading-relaxed text-ink-soft">
            You may cancel your subscription at any time from your account. Your
            subscription stays active until the end of the current billing period,
            and you will not be charged for the following period.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-bold">2. No refunds for partial months</h2>
          <p className="mt-3 leading-relaxed text-ink-soft">
            We do not give refunds for part of a month after you cancel. Because
            your subscription stays active until the end of the billing period you
            have already paid for, you keep full use of the Service for that whole
            period.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-bold">3. Refunds for service outages</h2>
          <p className="mt-3 leading-relaxed text-ink-soft">
            If the Service was unavailable because of a fault on DineDesk&rsquo;s
            side for more than 48 hours within a single billing period, you may
            request a full refund of the subscription fee for that billing period.
            To request it, write to{" "}
            <a
              href="mailto:abdulrehmaan7151@gmail.com"
              className="font-medium text-brand underline"
            >
              abdulrehmaan7151@gmail.com
            </a>{" "}
            within 14 days of the end of the affected billing period, describing the
            outage. We will review the request and, if the outage is confirmed,
            refund the fee for that period to the original payment method.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-bold">4. What this policy does not cover</h2>
          <p className="mt-3 leading-relaxed text-ink-soft">
            Refunds are not given for a change of mind, for a restaurant closing,
            for problems caused by your own internet connection, devices, or
            third-party services, or for time when the Service was available but not
            used. Charges made by your bank or payment provider, such as currency
            conversion fees, are not refundable by DineDesk.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-bold">5. Contact</h2>
          <p className="mt-3 leading-relaxed text-ink-soft">
            Refund requests and questions about this policy can be sent to{" "}
            <a
              href="mailto:abdulrehmaan7151@gmail.com"
              className="font-medium text-brand underline"
            >
              abdulrehmaan7151@gmail.com
            </a>
            . DineDesk is operated by Abdul Rehman, Chah Array Wala, Kot Addu 34050,
            Pakistan.
          </p>
        </section>
      </article>

      <footer className="border-t border-hairline">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-3 px-6 py-6 text-xs text-ink-soft sm:flex-row sm:items-center sm:justify-between lg:px-10">
          <p>© {new Date().getFullYear()} DineDesk. All rights reserved.</p>
          <nav className="flex items-center gap-5">
            <Link href="/" className="transition hover:text-brand">
              Home
            </Link>
            {LEGAL_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="transition hover:text-brand">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </footer>
    </main>
  );
}
