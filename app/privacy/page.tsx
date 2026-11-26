import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | DineDesk",
  description:
    "Privacy Policy for DineDesk. How we collect, use, and protect your information when you use DineDesk.",
};

const LEGAL_LINKS = [
  { href: "/terms", label: "Terms of Service" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/refund", label: "Refund Policy" },
];

export default function PrivacyPage() {
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
          Privacy Policy
        </h1>
        <p className="mt-3 text-sm text-ink-muted">Effective date: 26 November 2026</p>

        <p className="mt-6 leading-relaxed text-ink-soft">
          DineDesk is a restaurant-management platform that provides QR table
          ordering, a digital menu, a kitchen display, and an admin dashboard.
          DineDesk is operated by Abdul Rehman, a sole proprietor based at Chah
          Array Wala, Kot Addu 34050, Pakistan. This Privacy Policy explains what
          information we collect, how we use it, and the choices you have.
        </p>

        <section className="mt-10">
          <h2 className="text-xl font-bold">1. Information we collect</h2>
          <p className="mt-3 leading-relaxed text-ink-soft">
            We collect the following kinds of information:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-6 leading-relaxed text-ink-soft">
            <li>
              <strong className="text-ink">Account details:</strong> the name,
              email address, and password details you provide when you create a
              DineDesk account, and the restaurant details you enter, such as the
              restaurant name and address.
            </li>
            <li>
              <strong className="text-ink">Restaurant and order data:</strong>{" "}
              the menus, prices, tables, orders, and staff details you or your
              restaurant enter into the Service, and the orders guests place through
              the digital menu.
            </li>
            <li>
              <strong className="text-ink">Usage data:</strong> basic information
              about how the Service is used, such as pages visited, actions taken,
              and device and browser information, which helps us run and improve the
              Service.
            </li>
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-bold">2. Payments</h2>
          <p className="mt-3 leading-relaxed text-ink-soft">
            Card payments are processed by our payment providers: Paddle for
            international customers and SafePay for customers in Pakistan. When you
            pay, your card details go directly to the payment provider. DineDesk
            never sees, collects, or stores your card numbers. The payment providers
            handle your payment information under their own privacy policies.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-bold">3. How we use information</h2>
          <p className="mt-3 leading-relaxed text-ink-soft">
            We use the information we collect only to run the Service: to provide
            your account, process orders and subscriptions, show your restaurant its
            menus and orders, keep the Service secure, fix problems, and contact you
            about your account or the Service. We do not sell your personal
            information to anyone, and we do not use it for advertising.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-bold">4. Sharing information</h2>
          <p className="mt-3 leading-relaxed text-ink-soft">
            We share information only as needed to run the Service: with our payment
            providers to process subscriptions, with hosting and infrastructure
            providers that store and serve the Service on our behalf, and where we
            are required to do so by law. Our service providers may only use the
            information to provide their services to us.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-bold">5. Data security and retention</h2>
          <p className="mt-3 leading-relaxed text-ink-soft">
            We take reasonable steps to protect your information from unauthorised
            access, loss, or misuse, including password-protected accounts and
            secure connections. No system is completely secure, so we cannot
            guarantee absolute security. We keep your information only for as long
            as your account is active and as needed to run the Service, and for a
            reasonable period afterwards where the law requires it.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-bold">6. Your choices and rights</h2>
          <p className="mt-3 leading-relaxed text-ink-soft">
            You can update your account and restaurant details at any time from the
            admin dashboard. You can ask us for a copy of the personal information
            we hold about you, ask us to correct it, or ask us to delete your
            account and its data by writing to{" "}
            <a
              href="mailto:abdulrehmaan7151@gmail.com"
              className="font-medium text-brand underline"
            >
              abdulrehmaan7151@gmail.com
            </a>
            . We will respond to reasonable requests as promptly as we can.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-bold">7. Children</h2>
          <p className="mt-3 leading-relaxed text-ink-soft">
            The Service is intended for restaurants and their staff, not for
            children. We do not knowingly collect personal information from children
            under 18.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-bold">8. Changes to this policy</h2>
          <p className="mt-3 leading-relaxed text-ink-soft">
            We may update this Privacy Policy from time to time. When we do, we will
            update the effective date above. Continued use of the Service after a
            change means you accept the updated policy.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-bold">9. Contact</h2>
          <p className="mt-3 leading-relaxed text-ink-soft">
            Questions or requests about your personal information can be sent to{" "}
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
