"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Instrument_Serif, JetBrains_Mono, Manrope } from "next/font/google";
import {
  ArrowRight,
  ArrowUp,
  Check,
  UtensilsCrossed,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Fonts                                                               */
/* ------------------------------------------------------------------ */

const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-serif",
});
const sans = Manrope({ subsets: ["latin"], variable: "--font-sans" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

/* ------------------------------------------------------------------ */
/* Content                                                             */
/* ------------------------------------------------------------------ */

type Status = "new" | "prep" | "ready" | "served" | null;

const TICKETS = [
  { id: 24, table: "08", name: "Truffle mushroom burger", note: "No onions" },
  { id: 25, table: "03", name: "Crispy chicken bowl", note: "Extra dressing" },
  { id: 26, table: "11", name: "Garden greens", note: "Dressing on the side" },
  { id: 27, table: "05", name: "Margherita flatbread", note: "Two lemon sodas" },
  { id: 28, table: "02", name: "Chicken wrap x2", note: "Sauce on the side" },
];

// Status of each ticket at each story step (null = hasn't arrived yet)
const STATES: Status[][] = [
  ["new", "new", "new", null, null],
  ["prep", "prep", "new", null, null],
  ["ready", "prep", "prep", "new", "new"],
  ["served", "served", "served", "served", "served"],
];

const BANNERS = [
  { text: "Live: new orders arriving", busy: false },
  { text: "Live: the kitchen is on it", busy: false },
  { text: "Busy: 5 open orders", busy: true },
  { text: "All caught up", busy: false },
];

const SERVED_TONIGHT = [18, 21, 33, 41];

const STORY = [
  {
    time: "6:48 pm, Friday",
    title: "The restaurant is full.",
    text: "Table 8 scans the QR code and picks a burger, no onions. The order lands in the kitchen before the guest has put the phone down.",
  },
  {
    time: "6:52 pm",
    title: "The kitchen finds its rhythm.",
    text: "Every order arrives in one calm queue. Cooks mark it preparing, then ready, and the floor sees the change straight away.",
  },
  {
    time: "7:15 pm",
    title: "Then the rush hits.",
    text: "Five tables order inside ten minutes. Nothing is shouted across the pass, and nothing slips between the cracks.",
  },
  {
    time: "9:30 pm",
    title: "Everything was served.",
    text: "Plates out, tables turned, every order handled from the first scan to the last plate. Ordinary, which is exactly the point.",
  },
];

const GLOWS = [
  "rgba(16,185,129,0.20)",
  "rgba(245,158,11,0.16)",
  "rgba(244,63,94,0.16)",
  "rgba(16,185,129,0.20)",
];

const FEATURES = [
  {
    label: "At the table",
    title: "Scan, browse, order.",
    text: "Guests scan the QR code on their table, browse the digital menu, and place their order from their own phone. No waiting for a physical menu or a waiter.",
    tags: ["QR codes", "Digital menu", "Smartphone ordering"],
  },
  {
    label: "In the kitchen",
    title: "A calmer kitchen.",
    text: "Kitchen staff get their own screen. Incoming orders arrive in one clear queue, so the team always knows what to make next.",
    tags: ["Kitchen interface", "Live orders", "Order status"],
  },
  {
    label: "In the dashboard",
    title: "Your menu, your way.",
    text: "Manage menus, food categories, prices, and images from one intuitive dashboard, and keep an eye on incoming orders as they arrive.",
    tags: ["Menus", "Categories", "Prices", "Images", "Orders"],
  },
];

const POINTS = [
  {
    title: "No more paper menus",
    text: "The full menu lives on the guest's phone. Change a price or a photo in the dashboard and every table sees it.",
  },
  {
    title: "Orders go straight to the kitchen",
    text: "Nobody has to take an order down and carry it across the room. It appears on the kitchen screen the moment it is sent.",
  },
  {
    title: "A screen for every role",
    text: "Administrators manage the menu and orders. Kitchen staff get a focused view of what to prepare next.",
  },
];

const STEPS = [
  { n: "01", title: "Build your menu", text: "Add categories, dishes, prices, and images in the dashboard." },
  { n: "02", title: "Welcome your guests", text: "Guests scan the QR code on their table and order from their phone." },
  { n: "03", title: "Keep service flowing", text: "Orders reach the kitchen screen as soon as they are placed." },
];

// Pricing: change these three to update the whole section
const PRICE = "1,500";
const CURRENCY = "Rs";
const PERIOD = "month";

const INCLUDED = [
  "QR-code ordering for every table",
  "Digital menu with categories, prices, and images",
  "Admin dashboard for your menu and orders",
  "Kitchen interface for incoming orders",
];

const HERO_TRANSFORM_START =
  "perspective(1600px) rotateX(22deg) rotateZ(-2.5deg) scale(0.92)";

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function HomePage() {
  const progressRef = useRef<HTMLDivElement>(null);
  const heroBoardRef = useRef<HTMLDivElement>(null);
  const storyRef = useRef<HTMLElement>(null);
  const [step, setStep] = useState(0);
  const [onDark, setOnDark] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;

    const update = () => {
      raf = 0;
      const vh = window.innerHeight;

      // Reading progress bar in the nav
      const max = document.documentElement.scrollHeight - vh;
      const p = max > 0 ? window.scrollY / max : 0;
      if (progressRef.current) {
        progressRef.current.style.transform = `scaleX(${Math.min(1, Math.max(0, p))})`;
      }

      // Hero board starts tilted and settles flat as you scroll
      if (heroBoardRef.current) {
        const t = reduce ? 1 : Math.min(1, Math.max(0, window.scrollY / (vh * 0.7)));
        const e = 1 - Math.pow(1 - t, 3);
        heroBoardRef.current.style.transform = `perspective(1600px) rotateX(${(1 - e) * 22}deg) rotateZ(${(1 - e) * -2.5}deg) scale(${0.92 + e * 0.08})`;
      }

      // Which beat of the story is on screen
      const el = storyRef.current;
      if (el) {
        const r = el.getBoundingClientRect();
        const total = r.height - vh;
        const sp = total > 0 ? Math.min(0.9999, Math.max(0, -r.top / total)) : 0;
        setStep(Math.floor(sp * STORY.length));
        setOnDark(r.top <= 68 && r.bottom >= 68);
      }
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <main
      id="top"
      className={`${serif.variable} ${sans.variable} ${mono.variable} dd-root relative min-h-screen overflow-x-clip bg-[#fafafb] text-[#12121f]`}
    >
      <style>{`
        .dd-root{--dd-accent:#a2151c;--dd-accent-soft:#f28b91;--dd-accent-tint:#f6e1e2;--dd-dark:#0e0e1a;font-family:var(--font-sans),ui-sans-serif,system-ui,sans-serif;-webkit-font-smoothing:antialiased}
        .dd-serif{font-family:var(--font-serif),Georgia,"Times New Roman",serif;font-weight:400}
        .dd-mono{font-family:var(--font-mono),ui-monospace,SFMono-Regular,Menlo,monospace}
        .dd-scallop{height:12px;background:radial-gradient(circle at 12px 12px,var(--dd-dark) 11.5px,transparent 12px) repeat-x;background-size:24px 12px}
        .dd-ticket{animation:dd-ticket-in .5s cubic-bezier(.2,.7,.2,1) both}
        @keyframes dd-ticket-in{from{opacity:0;transform:translateY(8px) scale(.97)}to{opacity:1;transform:none}}
        .dd-root a:focus-visible,.dd-root button:focus-visible{outline:2px solid var(--dd-accent);outline-offset:3px;border-radius:6px}
        @media (prefers-reduced-motion:reduce){.dd-ticket{animation:none}}
      `}</style>

      {/* ---------------------------- Header ---------------------------- */}
      <header className="pointer-events-none sticky top-0 z-50 px-4 pt-3 sm:px-6">
        <div
          className={`pointer-events-auto relative mx-auto flex h-14 max-w-[1100px] items-center justify-between overflow-hidden rounded-full border pl-5 pr-2 backdrop-blur-xl transition-colors duration-500 ${onDark
              ? "border-white/15 bg-white/[0.07] shadow-[0_8px_30px_rgba(0,0,0,0.3)]"
              : "border-white/70 bg-white/45 shadow-[0_8px_30px_rgba(18,18,31,0.08)]"
            }`}
        >
          <div
            ref={progressRef}
            aria-hidden="true"
            className="absolute bottom-0 left-0 h-[2px] w-full origin-left bg-[var(--dd-accent)]"
            style={{ transform: "scaleX(0)" }}
          />

          <Link href="/" className="flex items-center gap-2.5" aria-label="DineDesk home">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--dd-accent)] text-white">
              <UtensilsCrossed size={14} strokeWidth={2.2} />
            </span>
            <span
              className={`dd-serif text-[22px] leading-none tracking-tight transition-colors duration-500 ${onDark ? "text-white" : "text-[#12121f]"
                }`}
            >
              DineDesk
            </span>
          </Link>

          <nav aria-label="Main navigation" className="hidden items-center gap-7 md:flex">
            {[
              ["Service", "#story"],
              ["Features", "#features"],
              ["How it works", "#how-it-works"],
              ["Pricing", "#pricing"],
            ].map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className={`text-[13px] font-medium transition-colors ${onDark
                    ? "text-white/65 hover:text-white"
                    : "text-[#5b5b70] hover:text-[#12121f]"
                  }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1.5">
            <Link
              href="/signin"
              className={`hidden px-3 py-2 text-[13px] font-semibold transition-colors sm:inline-flex ${onDark ? "text-white hover:text-white/70" : "text-[#12121f] hover:text-[var(--dd-accent)]"
                }`}
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center rounded-lg bg-[var(--dd-accent)] px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-[#82101a]"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* ----------------------------- Hero ----------------------------- */}
      <section className="mx-auto max-w-[1200px] px-6 pt-16 sm:pt-20 lg:px-10 lg:pt-28">
        <p className="dd-mono text-[11px] uppercase tracking-[0.18em] text-[#8b8ba0]">
          Restaurant management, reimagined
        </p>

        <div className="mt-7 grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:items-end lg:gap-14">
          <div>
            <h1 className="dd-serif max-w-[11ch] text-[clamp(3.5rem,9vw,7.75rem)] leading-[0.96] tracking-[-0.02em]">
              Make room for{" "}
              <em className="italic text-[var(--dd-accent)]">great service.</em>
            </h1>
            <p className="mt-8 max-w-md text-[15px] leading-7 text-[#3d3d52]">
              QR menus, a kitchen display, and an easy dashboard for restaurants and cafés.
            </p>
          </div>

          <div className="lg:pb-2">
            <p className="max-w-md text-[15px] leading-7 text-[#5b5b70]">
              DineDesk brings your menu and incoming orders into one centralized system. Guests
              scan a QR code at the table, browse the menu, and order from their phone, with no
              waiting for a printed menu or a waiter.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--dd-accent)] px-5 py-3 text-[13px] font-semibold text-white transition hover:bg-[#82101a]"
              >
                Create your restaurant account <ArrowRight size={14} />
              </Link>
              <Link
                href="#story"
                className="border-b border-black/20 pb-0.5 text-[13px] text-[#5b5b70] transition hover:border-[#12121f] hover:text-[#12121f]"
              >
                Watch a night of service
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Hero board: tilts flat on scroll */}
      <div className="mx-auto mt-14 max-w-[1000px] px-6 pb-28 lg:mt-20 lg:px-10 lg:pb-36">
        <div
          ref={heroBoardRef}
          aria-hidden="true"
          style={{
            transformOrigin: "50% 0%",
            transform: HERO_TRANSFORM_START,
            willChange: "transform",
          }}
        >
          <KitchenBoard step={2} />
        </div>
      </div>

      {/* ------------------------ Scroll story (dark) ------------------------ */}
      <section
        id="story"
        ref={storyRef}
        aria-label="A night of service"
        className="relative bg-[var(--dd-dark)] text-white"
        style={{ height: `${(STORY.length + 1) * 100}vh` }}
      >
        <div aria-hidden="true" className="dd-scallop absolute inset-x-0 -top-[12px]" />

        <div className="sticky top-0 h-screen overflow-hidden">
          {GLOWS.map((color, i) => (
            <div
              key={color + i}
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 transition-opacity duration-1000 motion-reduce:transition-none"
              style={{
                opacity: i === step ? 1 : 0,
                background: `radial-gradient(ellipse 55% 60% at 72% 50%, ${color}, transparent 70%)`,
              }}
            />
          ))}

          <div className="relative mx-auto flex h-full max-w-[1200px] items-center px-6 pt-20 lg:px-10">
            <div className="grid w-full items-center gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
              <div>
                <div className="grid">
                  {STORY.map((s, i) => (
                    <div
                      key={s.title}
                      aria-hidden={i !== step}
                      className={`col-start-1 row-start-1 transition-all duration-700 ease-out motion-reduce:transition-none ${i === step
                          ? "translate-y-0 opacity-100"
                          : "pointer-events-none translate-y-4 opacity-0"
                        }`}
                    >
                      <p className="dd-mono text-[11px] tracking-[0.14em] text-white/40">{s.time}</p>
                      <h2 className="dd-serif mt-4 text-[clamp(2.5rem,5vw,4.25rem)] leading-[1.02] tracking-[-0.01em]">
                        {s.title}
                      </h2>
                      <p className="mt-5 max-w-md text-[15px] leading-7 text-white/55">{s.text}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex gap-1.5" aria-hidden="true">
                  {STORY.map((s, i) => (
                    <span
                      key={s.title}
                      className={`h-[3px] rounded-full transition-all duration-500 ${i === step ? "w-8 bg-white" : "w-4 bg-white/20"
                        }`}
                    />
                  ))}
                </div>
              </div>

              <div aria-hidden="true">
                <KitchenBoard step={step} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------------------- Features ----------------------------- */}
      <section id="features" className="mx-auto max-w-[1200px] scroll-mt-20 px-6 py-28 lg:px-10 lg:py-36">
        <p className="dd-mono text-[11px] uppercase tracking-[0.18em] text-[#8b8ba0]">
          Everything it runs
        </p>
        <h2 className="dd-serif mt-5 max-w-[16ch] text-[clamp(2.5rem,5.5vw,4.5rem)] leading-[1.02] tracking-[-0.015em]">
          One system for the whole restaurant.
        </h2>

        <div className="mt-16 lg:mt-20">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className="grid items-center gap-10 border-t border-black/[0.07] py-14 lg:grid-cols-2 lg:gap-20 lg:py-20"
            >
              <div className={i % 2 === 1 ? "lg:order-2" : ""}>
                <p className="dd-mono text-[11px] uppercase tracking-[0.18em] text-[#8b8ba0]">
                  {f.label}
                </p>
                <h3 className="dd-serif mt-4 text-[clamp(2rem,3.4vw,2.9rem)] leading-[1.05] tracking-[-0.01em]">
                  {f.title}
                </h3>
                <p className="mt-5 max-w-md text-[15px] leading-7 text-[#5b5b70]">{f.text}</p>
                <p className="mt-6 flex flex-wrap gap-x-5 gap-y-1 text-xs text-[#8b8ba0]">
                  {f.tags.map((t) => (
                    <span key={t}>{t}</span>
                  ))}
                </p>
              </div>
              <div
                aria-hidden="true"
                className={`flex ${i % 2 === 1 ? "lg:order-1 lg:justify-start" : "lg:justify-end"} justify-center`}
              >
                <FeatureVisual index={i} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------- Built for service ------------------------- */}
      <section className="border-t border-black/[0.07]">
        <div className="mx-auto grid max-w-[1200px] gap-14 px-6 py-28 lg:grid-cols-[1fr_0.9fr] lg:gap-24 lg:px-10 lg:py-36">
          <div>
            <p className="dd-mono text-[11px] uppercase tracking-[0.18em] text-[#8b8ba0]">
              Built for busy service
            </p>
            <h2 className="dd-serif mt-5 text-[clamp(2.5rem,5vw,4.25rem)] leading-[1.02] tracking-[-0.015em]">
              Less chaos,
              <br />
              <em className="italic text-[var(--dd-accent)]">more hospitality.</em>
            </h2>
            <p className="mt-6 max-w-md text-[15px] leading-7 text-[#5b5b70]">
              DineDesk connects the moments that make a great restaurant run, from the first scan
              at the table to the last plate leaving the kitchen.
            </p>

            <div className="mt-10 border-b border-black/[0.07]">
              {POINTS.map((p) => (
                <div key={p.title} className="border-t border-black/[0.07] py-6">
                  <h3 className="text-[15px] font-bold">{p.title}</h3>
                  <p className="mt-2 max-w-md text-sm leading-6 text-[#5b5b70]">{p.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div aria-hidden="true" className="flex items-center lg:justify-end">
            <div className="w-full max-w-[340px] rounded-2xl border border-black/[0.07] bg-white p-7 text-center shadow-[0_24px_60px_-20px_rgba(18,18,31,0.18)]">
              <p className="dd-mono text-[10px] uppercase tracking-[0.14em] text-[#8b8ba0]">
                Table 08
              </p>
              <div className="mx-auto mt-5 h-48 w-48 rounded-xl border border-black/[0.07] bg-white p-3">
                <QrPattern />
              </div>
              <p className="dd-serif mt-6 text-[32px] leading-none tracking-[-0.01em]">
                Scan. Order. Enjoy.
              </p>
              <p className="mt-3 text-xs leading-5 text-[#8b8ba0]">
                Open the menu on your phone and send your order to the kitchen.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------- How it works ---------------------------- */}
      <section id="how-it-works" className="scroll-mt-20 border-t border-black/[0.07]">
        <div className="mx-auto max-w-[1200px] px-6 py-28 lg:px-10 lg:py-36">
          <p className="dd-mono text-[11px] uppercase tracking-[0.18em] text-[#8b8ba0]">
            How it works
          </p>
          <h2 className="dd-serif mt-5 max-w-[16ch] text-[clamp(2.5rem,5vw,4.25rem)] leading-[1.02] tracking-[-0.015em]">
            A better flow, from table to kitchen.
          </h2>
          <p className="mt-6 max-w-md text-[15px] leading-7 text-[#5b5b70]">
            Set up your restaurant once, then let one connected system keep your service on
            track.
          </p>

          <div className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
            {STEPS.map((s) => (
              <div key={s.n} className="border-t border-[#12121f] pt-5">
                <span className="dd-mono text-[11px] text-[var(--dd-accent)]">{s.n}</span>
                <h3 className="dd-serif mt-4 text-[28px] leading-tight tracking-[-0.01em]">
                  {s.title}
                </h3>
                <p className="mt-3 max-w-xs text-sm leading-6 text-[#5b5b70]">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------- Pricing ------------------------------- */}
      <section id="pricing" className="scroll-mt-20 border-t border-black/[0.07]">
        <div className="mx-auto grid max-w-[1200px] items-center gap-14 px-6 py-28 lg:grid-cols-[1fr_0.9fr] lg:gap-24 lg:px-10 lg:py-36">
          <div>
            <p className="dd-mono text-[11px] uppercase tracking-[0.18em] text-[#8b8ba0]">
              Pricing
            </p>
            <h2 className="dd-serif mt-5 max-w-[12ch] text-[clamp(2.5rem,5vw,4.25rem)] leading-[1.02] tracking-[-0.015em]">
              One plan,{" "}
              <em className="italic text-[var(--dd-accent)]">one price.</em>
            </h2>
            <p className="mt-6 max-w-md text-[15px] leading-7 text-[#5b5b70]">
              Everything DineDesk does for your restaurant, for one simple monthly price.
            </p>
          </div>

          <div className="w-full max-w-[440px] rounded-2xl border border-black/[0.07] bg-white p-7 shadow-[0_24px_60px_-20px_rgba(18,18,31,0.18)] sm:p-8 lg:justify-self-end">
            <p className="dd-mono text-[10px] uppercase tracking-[0.14em] text-[#8b8ba0]">
              DineDesk
            </p>
            <p className="mt-4 flex items-baseline gap-2">
              <span className="dd-serif text-[28px] text-[#8b8ba0]">{CURRENCY}</span>
              <span className="dd-serif text-[80px] leading-none tracking-[-0.02em]">{PRICE}</span>
              <span className="text-sm text-[#8b8ba0]">/ {PERIOD}</span>
            </p>

            <Link
              href="/signup"
              className="mt-7 flex items-center justify-center gap-2 rounded-lg bg-[var(--dd-accent)] px-5 py-3 text-[13px] font-semibold text-white transition hover:bg-[#82101a]"
            >
              Get started <ArrowRight size={14} />
            </Link>

            <p className="dd-mono mt-8 text-[10px] uppercase tracking-[0.14em] text-[#8b8ba0]">
              Includes
            </p>
            <ul className="mt-4 space-y-3">
              {INCLUDED.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-[#3d3d52]">
                  <Check size={15} strokeWidth={2.5} className="mt-0.5 shrink-0 text-[var(--dd-accent)]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* --------------------------------- CTA --------------------------------- */}
      <section className="bg-[var(--dd-dark)] text-white">
        <div className="mx-auto max-w-[1200px] px-6 py-28 lg:px-10 lg:py-36">
          <h2 className="dd-serif max-w-[14ch] text-[clamp(3rem,6.5vw,5.5rem)] leading-[1] tracking-[-0.02em]">
            Set up your restaurant{" "}
            <em className="italic text-[var(--dd-accent-soft)]">this week.</em>
          </h2>
          <p className="mt-7 max-w-md text-[15px] leading-7 text-white/55">
            Create your account, add your menu, and let your guests scan their first
            order.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-3 text-[13px] font-semibold text-[#12121f] transition hover:bg-white/90"
            >
              Create your restaurant account <ArrowRight size={14} />
            </Link>
            <Link
              href="/signin"
              className="border-b border-white/25 pb-0.5 text-[13px] text-white/70 transition hover:border-white hover:text-white"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* -------------------------------- Footer -------------------------------- */}
      <footer>
        <div className="mx-auto flex max-w-[1200px] flex-col gap-4 px-6 py-6 text-xs text-[#8b8ba0] sm:flex-row sm:items-center sm:justify-between lg:px-10">
          <div>
            <p>
              © {new Date().getFullYear()} DineDesk. Restaurant management, with room for
              hospitality.
            </p>
            <p className="mt-1 text-[11px] text-[#a6a6b8]">
              Built with Next.js, Prisma, MariaDB, and Cloudinary.
            </p>
          </div>
          <div className="flex items-center gap-5">
            <Link href="/signin" className="transition hover:text-[#12121f]">
              Sign in
            </Link>
            <Link href="/signup" className="transition hover:text-[#12121f]">
              Create account
            </Link>
            <Link href="#top" className="inline-flex items-center gap-1 transition hover:text-[#12121f]">
              Back to top <ArrowUp size={12} />
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

/* ------------------------------------------------------------------ */
/* Kitchen board (hero + story mockup)                                 */
/* ------------------------------------------------------------------ */

const COLUMNS = [
  { key: "new", label: "New", dot: "bg-amber-400" },
  { key: "prep", label: "Preparing", dot: "bg-[var(--dd-accent)]" },
  { key: "ready", label: "Ready", dot: "bg-emerald-500" },
] as const;

function KitchenBoard({ step }: { step: number }) {
  const states = STATES[step];
  const banner = BANNERS[step];
  const open = states.filter((s) => s && s !== "served").length;

  return (
    <div className="overflow-hidden rounded-2xl border border-black/[0.08] bg-white text-[#12121f] shadow-[0_40px_100px_-30px_rgba(18,18,31,0.4)]">
      <div className="flex items-center justify-between bg-[#14142b] px-4 py-3 text-white sm:px-5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[var(--dd-accent)]">
            <UtensilsCrossed size={13} />
          </span>
          <span className="text-[13px] font-bold">DineDesk</span>
          <span className="hidden text-[11px] text-white/45 sm:inline">
            Friday evening service
          </span>
        </div>
        <span className="text-[11px] text-white/45">Kitchen view</span>
      </div>

      <div
        className={`flex items-center gap-2 px-4 py-2 text-[11px] font-semibold transition-colors duration-500 sm:px-5 ${banner.busy ? "bg-amber-50 text-amber-800" : "bg-emerald-50 text-emerald-800"
          }`}
      >
        <span
          className={`h-1.5 w-1.5 animate-pulse rounded-full ${banner.busy ? "bg-amber-500" : "bg-emerald-500"
            }`}
        />
        {banner.text}
      </div>

      <div className="grid grid-cols-3 gap-2 p-3 sm:gap-3 sm:p-4">
        {COLUMNS.map((col) => {
          const items = TICKETS.filter((_, i) => states[i] === col.key);
          return (
            <div
              key={col.key}
              className="min-h-[190px] rounded-xl bg-[#f5f5f8] p-2 sm:min-h-[240px] sm:p-2.5"
            >
              <div className="dd-mono mb-2 flex items-center justify-between px-1 text-[9px] uppercase tracking-[0.14em] text-[#8b8ba0]">
                <span className="inline-flex items-center gap-1.5">
                  <span className={`h-1.5 w-1.5 rounded-full ${col.dot}`} />
                  {col.label}
                </span>
                <span>{items.length}</span>
              </div>
              <div className="space-y-2">
                {items.map((t) => (
                  <div
                    key={t.id}
                    className="dd-ticket rounded-lg border border-black/[0.06] bg-white p-2 shadow-[0_1px_2px_rgba(18,18,31,0.05)] sm:p-2.5"
                  >
                    <div className="dd-mono flex items-center justify-between text-[9px] text-[#8b8ba0]">
                      <span>#{String(t.id).padStart(3, "0")}</span>
                      <span>
                        <span className="hidden sm:inline">Table </span>
                        {t.table}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-[11px] font-bold sm:text-xs">{t.name}</p>
                    <p className="mt-0.5 truncate text-[10px] text-[#8b8ba0]">{t.note}</p>
                  </div>
                ))}
                {items.length === 0 && (
                  <p className="px-1 pt-4 text-center text-[10px] text-[#a6a6b8]">Nothing waiting</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between border-t border-black/[0.06] px-4 py-3 text-[11px] text-[#8b8ba0] sm:px-5">
        <span>
          Open orders <b className="ml-1 text-[#12121f]">{open}</b>
        </span>
        <span>
          Served tonight <b className="ml-1 text-[#12121f]">{SERVED_TONIGHT[step]}</b>
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Small feature visuals                                               */
/* ------------------------------------------------------------------ */

const cardClass =
  "w-full max-w-[300px] rounded-2xl border border-black/[0.07] bg-white p-4 shadow-[0_24px_60px_-20px_rgba(18,18,31,0.18)]";

function FeatureVisual({ index }: { index: number }) {
  // Customer view: the QR menu on a phone
  if (index === 0) {
    const items = [
      { name: "Truffle mushroom burger", price: "950", tint: "bg-amber-100" },
      { name: "Crispy chicken bowl", price: "780", tint: "bg-rose-100" },
      { name: "Garden greens", price: "620", tint: "bg-emerald-100" },
    ];
    return (
      <div className="w-[250px] rounded-[2.2rem] border-[7px] border-[#12121f] bg-white p-3.5 shadow-[0_24px_60px_-20px_rgba(18,18,31,0.3)]">
        <div className="flex items-center justify-between px-1">
          <span className="dd-mono text-[10px] uppercase tracking-[0.14em] text-[#8b8ba0]">
            Table 08
          </span>
          <span className="text-[10px] font-bold">Menu</span>
        </div>
        <div className="mt-3 flex gap-1.5">
          {["Burgers", "Bowls", "Drinks"].map((c, i) => (
            <span
              key={c}
              className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${i === 0 ? "bg-[var(--dd-accent)] text-white" : "bg-[#f1f1f6] text-[#5b5b70]"
                }`}
            >
              {c}
            </span>
          ))}
        </div>
        <ul className="mt-3 space-y-2.5">
          {items.map((it) => (
            <li key={it.name} className="flex items-center gap-3">
              <span className={`h-11 w-11 shrink-0 rounded-lg ${it.tint}`} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[11px] font-bold">{it.name}</p>
                <p className="mt-0.5 text-[10px] text-[#8b8ba0]">
                  {CURRENCY} {it.price}
                </p>
              </div>
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--dd-accent)] text-xs font-bold text-white">
                +
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-4 rounded-xl bg-[var(--dd-accent)] py-2.5 text-center text-[11px] font-bold text-white">
          Send order to kitchen
        </div>
      </div>
    );
  }

  // Kitchen view: one order moving through
  if (index === 1) {
    const steps = [
      { label: "Order received", done: true },
      { label: "In preparation", done: true },
      { label: "Ready to serve", done: false },
    ];
    return (
      <div className={cardClass}>
        <span className="dd-mono text-[10px] uppercase tracking-[0.14em] text-[#8b8ba0]">
          Order #024, Table 08
        </span>
        <p className="mt-2 text-sm font-bold">Truffle mushroom burger</p>
        <ul className="mt-4 space-y-3.5">
          {steps.map((s) => (
            <li key={s.label} className="flex items-center gap-3">
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full ${s.done ? "bg-emerald-100 text-emerald-700" : "border border-dashed border-black/20"
                  }`}
              >
                {s.done && <Check size={11} strokeWidth={3} />}
              </span>
              <span className={`text-xs ${s.done ? "font-semibold" : "text-[#a6a6b8]"}`}>
                {s.label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // Admin view: managing the menu
  const rows = [
    { name: "Truffle mushroom burger", cat: "Burgers", price: "950", tint: "bg-amber-100" },
    { name: "Crispy chicken bowl", cat: "Bowls", price: "780", tint: "bg-rose-100" },
    { name: "Mint lemonade", cat: "Drinks", price: "320", tint: "bg-emerald-100" },
  ];
  return (
    <div className={cardClass}>
      <div className="flex items-center justify-between">
        <span className="dd-mono text-[10px] uppercase tracking-[0.14em] text-[#8b8ba0]">
          Menu
        </span>
        <span className="rounded-md bg-[var(--dd-accent)] px-2.5 py-1 text-[10px] font-bold text-white">
          Add item
        </span>
      </div>
      <ul className="mt-3 divide-y divide-black/[0.06]">
        {rows.map((r) => (
          <li key={r.name} className="flex items-center gap-3 py-2.5">
            <span className={`h-9 w-9 shrink-0 rounded-lg ${r.tint}`} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold">{r.name}</p>
              <p className="mt-0.5 text-[11px] text-[#8b8ba0]">{r.cat}</p>
            </div>
            <span className="text-[11px] font-bold">
              {CURRENCY} {r.price}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* Decorative QR code for the table card (not scannable) */
function QrPattern() {
  const N = 21;
  const corners: [number, number][] = [
    [0, 0],
    [N - 7, 0],
    [0, N - 7],
  ];
  const cells: { x: number; y: number }[] = [];

  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const corner = corners.find(
        ([ox, oy]) => x >= ox - 1 && x <= ox + 7 && y >= oy - 1 && y <= oy + 7,
      );
      let dark: boolean;
      if (corner) {
        const dx = x - corner[0];
        const dy = y - corner[1];
        if (dx < 0 || dy < 0 || dx > 6 || dy > 6) {
          dark = false;
        } else {
          const ring = Math.max(Math.abs(dx - 3), Math.abs(dy - 3));
          dark = ring === 3 || ring <= 1;
        }
      } else {
        dark = (x * 7 + y * 13 + x * y * 3) % 5 < 2;
      }
      if (dark) cells.push({ x, y });
    }
  }

  return (
    <svg viewBox="0 0 21 21" className="h-full w-full" shapeRendering="crispEdges" fill="#12121f">
      {cells.map((c) => (
        <rect key={`${c.x}-${c.y}`} x={c.x} y={c.y} width="1" height="1" />
      ))}
    </svg>
  );
}
