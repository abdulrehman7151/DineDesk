import Link from "next/link";
import {
  ArrowRight,
  ArrowUp,
  BarChart3,
  Check,
  ChefHat,
  ClipboardList,
  Clock3,
  QrCode,
  UtensilsCrossed,
} from "lucide-react";

const features = [
  {
    icon: QrCode,
    title: "Ordering without the wait",
    description:
      "Give every table its own QR menu. Guests browse, customize, and send orders straight to your team.",
    color: "bg-amber-100 text-amber-800",
  },
  {
    icon: ChefHat,
    title: "A calmer kitchen",
    description:
      "Keep incoming orders moving with a clear kitchen display and simple preparation status updates.",
    color: "bg-rose-100 text-brand",
  },
  {
    icon: BarChart3,
    title: "The whole picture",
    description:
      "Manage your menu, tables, team, and sales from one workspace built for the rhythm of service.",
    color: "bg-emerald-100 text-emerald-800",
  },
];

const orderItems = [
  { name: "Truffle mushroom burger", detail: "No onions · Table 08", time: "2 min", color: "bg-amber-400" },
  { name: "Crispy chicken bowl", detail: "Extra dressing · Table 03", time: "6 min", color: "bg-rose-400" },
  { name: "Garden greens", detail: "Table 11", time: "8 min", color: "bg-emerald-400" },
];

export default function HomePage() {
  return (
    <main id="top" className="relative isolate min-h-screen overflow-hidden bg-[#faf8f5] text-ink">
      {/* Background Orbs */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -right-36 -top-40 h-[34rem] w-[34rem] rounded-full bg-rose-200/50 blur-[100px]" />
        <div className="absolute -left-48 top-[36rem] h-[30rem] w-[30rem] rounded-full bg-amber-100/70 blur-[100px]" />
        <div className="absolute right-[35%] top-[48rem] h-72 w-72 rounded-full bg-emerald-100/50 blur-[100px]" />
      </div>

      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
        <Link href="/" className="flex items-center gap-2.5" aria-label="DineDesk home">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand text-white shadow-soft">
            <UtensilsCrossed size={19} strokeWidth={2.2} />
          </span>
          <span className="text-xl font-extrabold tracking-tight">dinedesk</span>
        </Link>

        <nav aria-label="Main navigation" className="hidden items-center gap-8 md:flex">
          <Link href="#features" className="text-sm font-medium text-ink-soft transition hover:text-brand">
            Features
          </Link>
          <Link href="#how-it-works" className="text-sm font-medium text-ink-soft transition hover:text-brand">
            How it works
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/signin"
            className="hidden rounded-full px-4 py-2.5 text-sm font-bold text-ink transition hover:bg-white/70 sm:inline-flex"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-white shadow-[0_8px_24px_rgba(162,21,28,0.2)] transition hover:-translate-y-0.5 hover:bg-brand-deep"
          >
            Get started <ArrowRight size={15} />
          </Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl items-center gap-14 px-5 pb-24 pt-12 sm:px-8 sm:pt-16 lg:grid-cols-[1.02fr_0.98fr] lg:gap-10 lg:px-12 lg:pb-32 lg:pt-20">
        <div className="relative z-10 max-w-2xl">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/65 px-3.5 py-2 text-xs font-bold tracking-wide text-brand shadow-soft backdrop-blur-xl">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            RESTAURANT MANAGEMENT, REIMAGINED
          </div>
          <h1 className="max-w-[13ch] text-5xl font-black leading-[1.04] tracking-[-0.055em] sm:text-6xl lg:text-[4.5rem]">
            Make room for{" "}
            <span className="relative whitespace-nowrap text-brand">
              great service.
              <svg aria-hidden="true" viewBox="0 0 295 14" className="absolute -bottom-2 left-0 w-full text-amber-400">
                <path d="M3 10C80 3 205 2 291 8" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="5" />
              </svg>
            </span>
          </h1>
          <p className="mt-7 max-w-xl text-base leading-7 text-ink-soft sm:text-lg sm:leading-8">
            Your menu, tables, orders, kitchen, and sales—together in one
            refreshingly simple workspace. Spend less time juggling tools
            and more time looking after your guests.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2.5 rounded-full bg-brand px-6 py-3.5 text-sm font-bold text-white shadow-[0_12px_30px_rgba(162,21,28,0.22)] transition hover:-translate-y-0.5 hover:bg-brand-deep"
            >
              Create your restaurant account <ArrowRight size={16} />
            </Link>
            <Link
              href="/signin"
              className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/55 px-6 py-3.5 text-sm font-bold text-ink backdrop-blur-xl transition hover:bg-white"
            >
              Sign in
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-ink-soft">
            <span className="inline-flex items-center gap-1.5"><Check size={14} className="text-emerald-700" /> Simple to get started</span>
            <span className="inline-flex items-center gap-1.5"><Check size={14} className="text-emerald-700" /> Built for busy service</span>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[570px] lg:ml-auto">
          <div aria-hidden="true" className="absolute -inset-8 rounded-[3rem] bg-gradient-to-br from-rose-200/60 via-amber-100/40 to-emerald-100/70 blur-2xl" />

          <div className="relative rounded-[2rem] border border-white/80 bg-white/55 p-3 shadow-[0_30px_90px_rgba(67,39,33,0.14)] backdrop-blur-2xl sm:p-4">
            <div className="overflow-hidden rounded-[1.45rem] border border-white/80 bg-[#fffdfa]/90">
              <div className="flex items-center justify-between border-b border-black/[0.06] px-5 py-4 sm:px-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-white">
                    <ClipboardList size={17} />
                  </div>
                  <div>
                    <p className="text-sm font-extrabold">Kitchen orders</p>
                    <p className="mt-0.5 text-[11px] text-ink-muted">Friday evening service</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1.5 text-[10px] font-bold text-emerald-800">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                  LIVE
                </span>
              </div>

              <div className="flex items-center justify-between px-5 pb-1 pt-5 sm:px-6">
                <div>
                  <p className="text-xs font-semibold text-ink-soft">Ready for your team</p>
                  <p className="mt-1 text-2xl font-black tracking-tight">3 new orders</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
                  <ChefHat size={21} />
                </div>
              </div>

              <div className="space-y-2.5 p-4 sm:p-5">
                {orderItems.map((item, index) => (
                  <div key={item.name} className="flex items-center gap-3.5 rounded-2xl border border-black/[0.055] bg-white/80 p-3.5 shadow-[0_4px_14px_rgba(41,28,23,0.035)] sm:gap-4 sm:p-4">
                    <span className={`h-10 w-1.5 shrink-0 rounded-full ${item.color}`} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">{item.name}</p>
                      <p className="mt-1 truncate text-[11px] text-ink-muted">{item.detail}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-[11px] font-bold text-ink-soft">#{String(index + 24).padStart(3, "0")}</p>
                      <p className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-ink-muted">
                        <Clock3 size={11} /> {item.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mx-4 mb-4 flex items-center justify-between rounded-xl bg-[#f7f3ef] px-4 py-3 sm:mx-5 sm:mb-5">
                <span className="text-xs font-semibold text-ink-soft">Everything in sync</span>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-800">
                  <Check size={13} /> All systems ready
                </span>
              </div>
            </div>
          </div>

          {/* Adjusted position from -left-5 / lg:-left-12 to right-4 / lg:-right-6 to prevent overlap with header */}
          <div className="absolute right-4 top-20 hidden items-center gap-3 rounded-2xl border border-white/80 bg-white/75 px-4 py-3 shadow-[0_12px_35px_rgba(67,39,33,0.13)] backdrop-blur-2xl sm:flex lg:-right-6">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800"><QrCode size={17} /></span>
            <span><span className="block text-xs font-extrabold">Scan. Order. Enjoy.</span><span className="mt-0.5 block text-[10px] text-ink-muted">A smoother table experience</span></span>
          </div>

          <div className="absolute -bottom-7 right-2 hidden items-center gap-3 rounded-2xl border border-white/80 bg-white/75 px-4 py-3 shadow-[0_12px_35px_rgba(67,39,33,0.13)] backdrop-blur-2xl sm:flex lg:-right-8">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 text-brand"><BarChart3 size={17} /></span>
            <span><span className="block text-xs font-extrabold">Your service, at a glance</span><span className="mt-0.5 block text-[10px] text-ink-muted">One clear view for your whole team</span></span>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl scroll-mt-8 px-5 pb-24 sm:px-8 lg:px-12 lg:pb-32">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-extrabold tracking-[0.18em] text-brand">LESS CHAOS, MORE HOSPITALITY</p>
          <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] sm:text-4xl">The moving parts, moving together.</h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-ink-soft sm:text-base">
            DineDesk connects the moments that make a great restaurant run—from the first menu view to the final order of the night.
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {features.map(({ icon: Icon, title, description, color }) => (
            <article key={title} className="group rounded-[1.65rem] border border-white/90 bg-white/55 p-6 shadow-[0_12px_40px_rgba(67,39,33,0.055)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:bg-white/80 hover:shadow-[0_20px_50px_rgba(67,39,33,0.1)] sm:p-7">
              <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${color}`}>
                <Icon size={22} strokeWidth={1.9} />
              </span>
              <h3 className="mt-6 text-lg font-extrabold tracking-tight">{title}</h3>
              <p className="mt-2.5 text-sm leading-6 text-ink-soft">{description}</p>
              <Link href="/signup" className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-brand transition group-hover:gap-3">
                Explore DineDesk <ArrowRight size={14} />
              </Link>
            </article>
          ))}
        </div>
      </section>

      {/* REDESIGNED HOW IT WORKS SECTION */}
      <section id="how-it-works" className="mx-auto max-w-7xl scroll-mt-8 px-5 pb-24 sm:px-8 lg:px-12 lg:pb-32">
        <div className="relative overflow-hidden rounded-[2.5rem] border border-white/60 bg-white/40 px-6 py-12 shadow-[0_20px_60px_rgba(67,39,33,0.06)] backdrop-blur-3xl sm:px-12 sm:py-16 lg:px-16">
          {/* Subtle decorative glows inside the glass card */}
          <div aria-hidden="true" className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-brand/10 blur-[80px]" />
          <div aria-hidden="true" className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-amber-400/10 blur-[80px]" />

          <div className="relative grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="text-xs font-extrabold tracking-[0.18em] text-brand">MADE FOR THE WAY YOU WORK</p>
              <h2 className="mt-4 max-w-lg text-3xl font-black leading-tight tracking-[-0.04em] sm:text-4xl">
                A better flow, from table to kitchen.
              </h2>
              <p className="mt-4 max-w-lg text-sm leading-6 text-ink-soft">
                Set up your restaurant once, then let one connected workspace keep your service on track.
              </p>
              <Link
                href="/signup"
                className="mt-7 inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3.5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(162,21,28,0.2)] transition hover:-translate-y-0.5 hover:bg-brand-deep"
              >
                Get started <ArrowRight size={15} />
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { number: "01", title: "Set up your space", text: "Add your restaurant, menu, and tables." },
                { number: "02", title: "Welcome your guests", text: "Let guests open your menu with a QR scan." },
                { number: "03", title: "Keep service flowing", text: "Follow orders from kitchen to served." },
              ].map((step) => (
                <div key={step.number} className="rounded-[1.5rem] border border-white bg-white/70 p-5 shadow-[0_8px_20px_rgba(67,39,33,0.04)] backdrop-blur-xl transition hover:bg-white/90">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand/10 text-xs font-black text-brand">
                    {step.number}
                  </span>
                  <h3 className="mt-4 text-sm font-extrabold text-ink">{step.title}</h3>
                  <p className="mt-2 text-xs leading-5 text-ink-soft">{step.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-black/[0.06]">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-7 text-xs text-ink-muted sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
          <Link href="/" className="inline-flex items-center gap-2 font-extrabold text-ink">
            <UtensilsCrossed size={15} className="text-brand" /> dinedesk
          </Link>
          <p>Restaurant management, with room for hospitality.</p>
          <div className="flex items-center gap-5 font-semibold">
            <Link href="/signin" className="transition hover:text-brand">Sign in</Link>
            <Link href="/signup" className="transition hover:text-brand">Create account</Link>
            <Link href="#top" className="inline-flex items-center gap-1 transition hover:text-brand">
              Back to top <ArrowUp size={12} />
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}