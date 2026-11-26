import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service | DineDesk",
  description:
    "Terms of Service for DineDesk, a restaurant-management platform. Read the terms that apply when you use DineDesk.",
};

const LEGAL_LINKS = [
  { href: "/terms", label: "Terms of Service" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/refund", label: "Refund Policy" },
];

export default function TermsPage() {
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
          Terms of Service
        </h1>
        <p className="mt-3 text-sm text-ink-muted">Effective date: 26 November 2026</p>

        <p className="mt-6 leading-relaxed text-ink-soft">
          These Terms of Service (&ldquo;Terms&rdquo;) govern your use of DineDesk, a
          restaurant-management platform that provides QR table ordering, a digital
          menu, a kitchen display, and an admin dashboard for managing menus, tables,
          orders, and sales (&ldquo;the Service&rdquo;). DineDesk is operated by Abdul
          Rehman, a sole proprietor based at Chah Array Wala, Kot Addu 34050,
          Pakistan (&ldquo;we&rdquo;, &ldquo;us&rdquo;). By creating an account or using the
          Service, you agree to these Terms. If you do not agree, do not use the
          Service.
        </p>

        <section className="mt-10">
          <h2 className="text-xl font-bold">1. The Service</h2>
          <p className="mt-3 leading-relaxed text-ink-soft">
            DineDesk provides restaurants with a subscription-based online platform.
            Guests of a restaurant can scan a QR code at their table, browse the
            restaurant&rsquo;s digital menu, and place orders from their own phone.
            Orders are shown on the restaurant&rsquo;s kitchen display, and restaurant
            staff manage menus, tables, orders, and sales from the admin dashboard.
            We may update or improve the Service from time to time.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-bold">2. Accounts</h2>
          <p className="mt-3 leading-relaxed text-ink-soft">
            To use the Service, a restaurant creates an account. You are responsible
            for keeping your account credentials confidential and for all activity
            that takes place under your account. You must provide accurate
            information when creating your account and keep it up to date. You must
            tell us promptly at{" "}
            <a
              href="mailto:abdulrehmaan7151@gmail.com"
              className="font-medium text-brand underline"
            >
              abdulrehmaan7151@gmail.com
            </a>{" "}
            if you believe your account has been used without your permission.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-bold">3. Subscriptions and billing</h2>
          <p className="mt-3 leading-relaxed text-ink-soft">
            The Service is billed monthly. The subscription price is Rs 1,500 per
            month for customers in Pakistan, and USD 5 per month for international
            customers, whose payments are processed by Paddle. Billing renews
            automatically each month until you cancel. You may cancel at any time
            from your account; your subscription stays active until the end of the
            current billing period, and no charge is made for the following period.
            Prices may change in future; we will tell you before any change applies
            to your subscription.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-bold">4. Acceptable use</h2>
          <p className="mt-3 leading-relaxed text-ink-soft">
            You agree not to use the Service for any unlawful purpose, to upload or
            display any content that is unlawful, misleading, or infringes the rights
            of others, or to interfere with the operation of the Service or other
            users&rsquo; access to it. We may suspend or close an account that
            breaches these Terms.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-bold">5. Your content</h2>
          <p className="mt-3 leading-relaxed text-ink-soft">
            Menus, prices, photos, and other content you add to the Service remain
            yours. You give us permission to store and display that content only as
            needed to run the Service for your restaurant and its guests. You are
            responsible for making sure the content you add is accurate and that you
            have the right to use it.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-bold">6. Availability and warranty</h2>
          <p className="mt-3 leading-relaxed text-ink-soft">
            The Service is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo;.
            We work to keep the Service running reliably, but we do not guarantee
            that it will always be available, error-free, or suitable for any
            particular purpose.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-bold">7. Limitation of liability</h2>
          <p className="mt-3 leading-relaxed text-ink-soft">
            To the fullest extent allowed by law, our total liability to you for any
            claim arising from the Service is limited to the amount you paid for the
            Service in the 12 months before the claim arose. We are not liable for
            any indirect, incidental, or consequential loss, including lost profits
            or lost orders.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-bold">8. Changes to these Terms</h2>
          <p className="mt-3 leading-relaxed text-ink-soft">
            We may update these Terms from time to time. When we do, we will update
            the effective date above. Continued use of the Service after a change
            means you accept the updated Terms.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-bold">9. Governing law</h2>
          <p className="mt-3 leading-relaxed text-ink-soft">
            These Terms are governed by the laws of Pakistan. Any dispute arising
            from these Terms or the Service will be dealt with under the laws of
            Pakistan.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-bold">10. Contact</h2>
          <p className="mt-3 leading-relaxed text-ink-soft">
            Questions about these Terms can be sent to{" "}
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
