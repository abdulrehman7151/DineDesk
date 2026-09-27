"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function NotFound() {
    const [mounted, setMounted] = useState(false);

    const [mouse, setMouse] = useState({
        x: 0,
        y: 0,
    });

    const [tilt, setTilt] = useState({
        x: 0,
        y: 0,
    });

    const cardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);

        const handleMouseMove = (event: MouseEvent) => {
            const mouseX = event.clientX;
            const mouseY = event.clientY;

            setMouse({
                x: mouseX,
                y: mouseY,
            });

            if (!cardRef.current) return;

            const rect = cardRef.current.getBoundingClientRect();

            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            const rotateY = ((mouseX - centerX) / rect.width) * 12;
            const rotateX = ((mouseY - centerY) / rect.height) * -12;

            setTilt({
                x: rotateX,
                y: rotateY,
            });
        };

        const handleMouseLeave = () => {
            setTilt({
                x: 0,
                y: 0,
            });
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseleave", handleMouseLeave);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseleave", handleMouseLeave);
        };
    }, []);

    return (
        <main className="relative min-h-screen overflow-hidden bg-white text-slate-900">

            {/* ========================================================= */}
            {/* GLOBAL BACKGROUND */}
            {/* ========================================================= */}

            <div className="pointer-events-none absolute inset-0 overflow-hidden">

                {/* Top red glow */}
                <div
                    className="
                        absolute
                        -left-48
                        -top-48
                        h-[550px]
                        w-[550px]
                        rounded-full
                        bg-red-100
                        blur-[110px]
                        opacity-70
                    "
                />

                {/* Bottom red glow */}
                <div
                    className="
                        absolute
                        -bottom-60
                        -right-48
                        h-[650px]
                        w-[650px]
                        rounded-full
                        bg-red-50
                        blur-[120px]
                    "
                />

                {/* Center glow */}
                <div
                    className="
                        absolute
                        left-1/2
                        top-1/2
                        h-80
                        w-80
                        -translate-x-1/2
                        -translate-y-1/2
                        rounded-full
                        bg-red-50
                        blur-[100px]
                        opacity-60
                    "
                />

                {/* Grid */}
                <div
                    className="
                        absolute
                        inset-0
                        opacity-[0.035]
                        [background-image:linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)]
                        [background-size:40px_40px]
                    "
                />

                {/* Dots */}

                <span
                    className="
                        absolute
                        left-[8%]
                        top-[25%]
                        h-2
                        w-2
                        rounded-full
                        bg-red-400
                        animate-ping
                    "
                />

                <span
                    className="
                        absolute
                        left-[18%]
                        top-[70%]
                        h-1.5
                        w-1.5
                        rounded-full
                        bg-red-300
                        animate-pulse
                    "
                />

                <span
                    className="
                        absolute
                        right-[12%]
                        top-[28%]
                        h-2
                        w-2
                        rounded-full
                        bg-red-400
                        animate-ping
                    "
                />

                <span
                    className="
                        absolute
                        bottom-[20%]
                        right-[25%]
                        h-1.5
                        w-1.5
                        rounded-full
                        bg-red-300
                        animate-pulse
                    "
                />

                {/* Floating circles */}

                <div
                    className="
                        absolute
                        left-[12%]
                        top-[45%]
                        h-5
                        w-5
                        rounded-full
                        border
                        border-red-200
                        animate-[bounce_5s_ease-in-out_infinite]
                    "
                />

                <div
                    className="
                        absolute
                        right-[10%]
                        top-[55%]
                        h-8
                        w-8
                        rounded-full
                        border
                        border-red-100
                        animate-[bounce_7s_ease-in-out_infinite]
                    "
                />

                <div
                    className="
                        absolute
                        left-[30%]
                        top-[15%]
                        h-3
                        w-3
                        rounded-full
                        bg-red-100
                        animate-[bounce_6s_ease-in-out_infinite]
                    "
                />
            </div>

            {/* ========================================================= */}
            {/* MOUSE FOLLOW GLOW */}
            {/* ========================================================= */}

            <div
                className="
                    pointer-events-none
                    fixed
                    z-50
                    hidden
                    h-72
                    w-72
                    -translate-x-1/2
                    -translate-y-1/2
                    rounded-full
                    bg-red-500/[0.07]
                    blur-3xl
                    transition-transform
                    duration-150
                    md:block
                "
                style={{
                    left: mouse.x,
                    top: mouse.y,
                }}
            />

            {/* ========================================================= */}
            {/* NAVBAR */}
            {/* ========================================================= */}

            <header
                className={`
                    relative
                    z-20
                    mx-auto
                    flex
                    w-full
                    max-w-7xl
                    items-center
                    justify-between
                    px-5
                    py-6
                    transition-all
                    duration-1000
                    sm:px-8
                    lg:px-10
                    ${mounted
                        ? "translate-y-0 opacity-100"
                        : "-translate-y-5 opacity-0"
                    }
                `}
            >

                {/* Logo */}

                <Link
                    href="/"
                    className="
                        group
                        flex
                        items-center
                        gap-2.5
                    "
                >
                    <div
                        className="
                            relative
                            flex
                            h-10
                            w-10
                            items-center
                            justify-center
                            overflow-hidden
                            rounded-xl
                            bg-red-600
                            shadow-lg
                            shadow-red-200
                            transition-all
                            duration-300
                            group-hover:scale-110
                            group-hover:rotate-6
                            group-hover:shadow-red-300
                        "
                    >
                        {/* Plate */}

                        <div
                            className="
                                h-6
                                w-6
                                rounded-full
                                border-2
                                border-white
                            "
                        />

                        <div
                            className="
                                absolute
                                h-2
                                w-2
                                rounded-full
                                bg-white
                            "
                        />
                    </div>

                    <span
                        className="
                            text-xl
                            font-black
                            tracking-tight
                            text-slate-900
                        "
                    >
                        Dine<span className="text-red-600">Desk</span>
                    </span>
                </Link>

                {/* Status */}

                <div
                    className="
                        hidden
                        items-center
                        gap-2
                        rounded-full
                        border
                        border-slate-200
                        bg-white/80
                        px-4
                        py-2
                        text-xs
                        font-medium
                        text-slate-500
                        shadow-sm
                        backdrop-blur
                        sm:flex
                    "
                >
                    <span
                        className="
                            h-2
                            w-2
                            rounded-full
                            bg-red-500
                            shadow-[0_0_0_4px_rgba(239,68,68,0.12)]
                        "
                    />

                    Looking for a table?
                </div>
            </header>

            {/* ========================================================= */}
            {/* MAIN */}
            {/* ========================================================= */}

            <section
                className="
                    relative
                    z-10
                    mx-auto
                    flex
                    min-h-[calc(100vh-90px)]
                    w-full
                    max-w-7xl
                    flex-col
                    items-center
                    justify-center
                    px-5
                    pb-16
                    pt-8
                    sm:px-8
                    lg:flex-row
                    lg:gap-20
                    lg:px-10
                    lg:pb-20
                    lg:pt-0
                "
            >

                {/* ===================================================== */}
                {/* LEFT CONTENT */}
                {/* ===================================================== */}

                <div
                    className={`
                        w-full
                        max-w-xl
                        text-center
                        transition-all
                        duration-1000
                        lg:text-left
                        ${mounted
                            ? "translate-x-0 opacity-100"
                            : "-translate-x-10 opacity-0"
                        }
                    `}
                >

                    {/* Small label */}

                    <div
                        className="
                            mb-5
                            inline-flex
                            items-center
                            gap-2
                            rounded-full
                            border
                            border-red-100
                            bg-red-50
                            px-4
                            py-2
                            text-xs
                            font-bold
                            uppercase
                            tracking-[0.18em]
                            text-red-600
                        "
                    >
                        <span className="h-1.5 w-1.5 rounded-full bg-red-500" />

                        Table not found
                    </div>

                    {/* 404 */}

                    <div className="relative">

                        <h1
                            className="
                                select-none
                                text-[clamp(7rem,25vw,15rem)]
                                font-black
                                leading-[0.72]
                                tracking-[-0.09em]
                                text-red-600
                            "
                        >
                            404
                        </h1>

                        {/* Ghost 404 */}

                        <div
                            aria-hidden="true"
                            className="
                                pointer-events-none
                                absolute
                                left-1/2
                                top-1/2
                                -z-10
                                -translate-x-1/2
                                -translate-y-1/2
                                select-none
                                whitespace-nowrap
                                text-[clamp(7rem,25vw,15rem)]
                                font-black
                                leading-none
                                tracking-[-0.09em]
                                text-red-100/60
                                blur-sm
                            "
                        >
                            404
                        </div>

                    </div>

                    {/* Heading */}

                    <h2
                        className="
                            mt-8
                            text-3xl
                            font-black
                            tracking-tight
                            text-slate-900
                            sm:text-4xl
                            lg:text-5xl
                        "
                    >
                        Looks like this table
                        <br className="hidden sm:block" />

                        <span className="text-red-600">
                            {" "}is missing.
                        </span>
                    </h2>

                    {/* Description */}

                    <p
                        className="
                            mx-auto
                            mt-5
                            max-w-md
                            text-sm
                            leading-7
                            text-slate-500
                            sm:text-base
                            lg:mx-0
                        "
                    >
                        The page you&apos;re looking for has moved,
                        disappeared, or maybe the chef took it away.
                        Let&apos;s get you back to the DineDesk kitchen.
                    </p>

                    {/* Buttons */}

                    <div
                        className="
                            mt-8
                            flex
                            flex-col
                            items-center
                            justify-center
                            gap-3
                            sm:flex-row
                            lg:justify-start
                        "
                    >

                        {/* Home */}

                        <MagneticButton>
                            <Link
                                href="/"
                                className="
                                    group
                                    flex
                                    w-full
                                    items-center
                                    justify-center
                                    gap-2.5
                                    rounded-xl
                                    bg-red-600
                                    px-6
                                    py-3.5
                                    text-sm
                                    font-bold
                                    text-white
                                    shadow-lg
                                    shadow-red-200
                                    transition-all
                                    duration-300
                                    hover:-translate-y-1
                                    hover:bg-red-700
                                    hover:shadow-xl
                                    hover:shadow-red-200
                                    sm:w-auto
                                "
                            >
                                <svg
                                    className="
                                        h-4
                                        w-4
                                        transition-transform
                                        duration-300
                                        group-hover:-translate-x-1
                                    "
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <path
                                        d="M3 11.5L12 4l9 7.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />

                                    <path
                                        d="M5.5 10v9h13v-9"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />

                                    <path
                                        d="M9.5 19v-5h5v5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>

                                Back to Dashboard
                            </Link>
                        </MagneticButton>

                        {/* Go Back */}

                        <button
                            onClick={() => window.history.back()}
                            className="
                                group
                                flex
                                w-full
                                items-center
                                justify-center
                                gap-2
                                rounded-xl
                                border
                                border-slate-200
                                bg-white
                                px-6
                                py-3.5
                                text-sm
                                font-bold
                                text-slate-700
                                shadow-sm
                                transition-all
                                duration-300
                                hover:-translate-y-1
                                hover:border-red-200
                                hover:bg-red-50
                                hover:text-red-600
                                sm:w-auto
                            "
                        >
                            <svg
                                className="
                                    h-4
                                    w-4
                                    transition-transform
                                    duration-300
                                    group-hover:-translate-x-1
                                "
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <path
                                    d="M19 12H5"
                                    strokeLinecap="round"
                                />

                                <path
                                    d="M12 19l-7-7 7-7"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>

                            Go Back
                        </button>

                    </div>

                    {/* Bottom message */}

                    <div
                        className="
                            mt-7
                            flex
                            items-center
                            justify-center
                            gap-2
                            text-xs
                            text-slate-400
                            lg:justify-start
                        "
                    >
                        <span>🍽️</span>

                        <span>
                            Even the best restaurants lose a table sometimes.
                        </span>
                    </div>

                </div>

                {/* ===================================================== */}
                {/* RIGHT INTERACTIVE CARD */}
                {/* ===================================================== */}

                <div
                    className={`
                        mt-16
                        w-full
                        max-w-md
                        transition-all
                        duration-1000
                        lg:mt-0
                        ${mounted
                            ? "translate-x-0 opacity-100"
                            : "translate-x-10 opacity-0"
                        }
                    `}
                >

                    <div
                        ref={cardRef}
                        className="
                            relative
                            mx-auto
                            aspect-square
                            w-full
                            max-w-[430px]
                            [perspective:1000px]
                        "
                        style={{
                            transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
                            transition:
                                "transform 180ms cubic-bezier(0.2,0.8,0.2,1)",
                        }}
                    >

                        {/* Outer floating ring */}

                        <div
                            className="
                                absolute
                                inset-[-15px]
                                rounded-[40px]
                                border
                                border-red-100
                                opacity-70
                                animate-[spin_25s_linear_infinite]
                            "
                        />

                        {/* Dashed ring */}

                        <div
                            className="
                                absolute
                                inset-[-30px]
                                rounded-[50px]
                                border
                                border-dashed
                                border-red-100
                                opacity-50
                                animate-[spin_35s_linear_infinite_reverse]
                            "
                        />

                        {/* Main card */}

                        <div
                            className="
                                relative
                                h-full
                                w-full
                                overflow-hidden
                                rounded-[32px]
                                border
                                border-red-100
                                bg-white
                                shadow-[0_30px_100px_rgba(185,28,28,0.14)]
                            "
                        >

                            {/* Red top area */}

                            <div
                                className="
                                    absolute
                                    inset-x-0
                                    top-0
                                    h-[42%]
                                    bg-gradient-to-br
                                    from-red-600
                                    via-red-500
                                    to-red-700
                                "
                            />

                            {/* Decorative circles */}

                            <div
                                className="
                                    absolute
                                    -right-16
                                    -top-16
                                    h-48
                                    w-48
                                    rounded-full
                                    border-[20px]
                                    border-white/10
                                "
                            />

                            <div
                                className="
                                    absolute
                                    -left-10
                                    top-10
                                    h-24
                                    w-24
                                    rounded-full
                                    bg-white/5
                                "
                            />

                            {/* Restaurant plate */}

                            <div
                                className="
                                    absolute
                                    left-1/2
                                    top-[36%]
                                    flex
                                    h-48
                                    w-48
                                    -translate-x-1/2
                                    -translate-y-1/2
                                    items-center
                                    justify-center
                                    rounded-full
                                    border-[10px]
                                    border-white
                                    bg-white
                                    shadow-[0_20px_50px_rgba(0,0,0,0.15)]
                                    transition-transform
                                    duration-500
                                    hover:scale-110
                                "
                            >

                                {/* Plate inner */}

                                <div
                                    className="
                                        flex
                                        h-32
                                        w-32
                                        items-center
                                        justify-center
                                        rounded-full
                                        border-2
                                        border-red-100
                                    "
                                >

                                    {/* Food */}

                                    <div
                                        className="
                                            relative
                                            flex
                                            h-20
                                            w-20
                                            items-center
                                            justify-center
                                            rounded-full
                                            bg-red-50
                                        "
                                    >

                                        {/* Food center */}

                                        <div
                                            className="
                                                h-10
                                                w-10
                                                rounded-full
                                                bg-red-500
                                                shadow-lg
                                                shadow-red-200
                                            "
                                        />

                                        {/* Food dots */}

                                        <span
                                            className="
                                                absolute
                                                left-4
                                                top-4
                                                h-2
                                                w-2
                                                rounded-full
                                                bg-red-300
                                            "
                                        />

                                        <span
                                            className="
                                                absolute
                                                bottom-4
                                                right-4
                                                h-2
                                                w-2
                                                rounded-full
                                                bg-red-300
                                            "
                                        />

                                        <span
                                            className="
                                                absolute
                                                right-5
                                                top-3
                                                h-1.5
                                                w-1.5
                                                rounded-full
                                                bg-red-300
                                            "
                                        />

                                    </div>

                                </div>

                            </div>

                            {/* Fork */}

                            <div
                                className="
                                    absolute
                                    left-8
                                    top-24
                                    rotate-[-20deg]
                                    text-white/80
                                "
                            >
                                <svg
                                    width="40"
                                    height="80"
                                    viewBox="0 0 40 80"
                                    fill="none"
                                >
                                    <path
                                        d="M10 5v25M20 5v25M30 5v25"
                                        stroke="currentColor"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                    />

                                    <path
                                        d="M20 28v45"
                                        stroke="currentColor"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                    />
                                </svg>
                            </div>

                            {/* Knife */}

                            <div
                                className="
                                    absolute
                                    right-8
                                    top-24
                                    rotate-[20deg]
                                    text-white/80
                                "
                            >
                                <svg
                                    width="40"
                                    height="80"
                                    viewBox="0 0 40 80"
                                    fill="none"
                                >
                                    <path
                                        d="M20 8v65"
                                        stroke="currentColor"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                    />

                                    <path
                                        d="M20 8C30 12 33 22 20 30"
                                        stroke="currentColor"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                    />
                                </svg>
                            </div>

                            {/* Bottom white section */}

                            <div
                                className="
                                    absolute
                                    inset-x-0
                                    bottom-0
                                    h-[58%]
                                    rounded-t-[45px]
                                    bg-white
                                "
                            />

                            {/* Content on card */}

                            <div
                                className="
                                    absolute
                                    inset-x-0
                                    bottom-8
                                    text-center
                                "
                            >

                                <div
                                    className="
                                        mx-auto
                                        mb-3
                                        flex
                                        h-9
                                        w-9
                                        items-center
                                        justify-center
                                        rounded-full
                                        bg-red-50
                                    "
                                >
                                    <svg
                                        className="h-4 w-4 text-red-500"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    >
                                        <circle
                                            cx="12"
                                            cy="12"
                                            r="9"
                                        />

                                        <path
                                            d="M12 8v4"
                                            strokeLinecap="round"
                                        />

                                        <circle
                                            cx="12"
                                            cy="16"
                                            r=".5"
                                            fill="currentColor"
                                        />
                                    </svg>
                                </div>

                                <p
                                    className="
                                        text-xs
                                        font-bold
                                        uppercase
                                        tracking-[0.2em]
                                        text-red-500
                                    "
                                >
                                    Error 404
                                </p>

                                <p
                                    className="
                                        mt-2
                                        px-8
                                        text-sm
                                        font-medium
                                        leading-6
                                        text-slate-500
                                    "
                                >
                                    This table doesn&apos;t exist on
                                    today&apos;s menu.
                                </p>

                            </div>

                            {/* Shine */}

                            <div
                                className="
                                    pointer-events-none
                                    absolute
                                    -left-[100%]
                                    top-0
                                    h-full
                                    w-[50%]
                                    rotate-12
                                    bg-gradient-to-r
                                    from-transparent
                                    via-white/20
                                    to-transparent
                                    transition-all
                                    duration-1000
                                    hover:left-[150%]
                                "
                            />

                        </div>

                        {/* Floating notification */}

                        <div
                            className="
                                absolute
                                -right-3
                                top-[18%]
                                flex
                                items-center
                                gap-2
                                rounded-2xl
                                border
                                border-slate-100
                                bg-white
                                px-3
                                py-2
                                shadow-xl
                                shadow-slate-200/50
                                animate-[bounce_4s_ease-in-out_infinite]
                                sm:-right-8
                            "
                        >
                            <span
                                className="
                                    flex
                                    h-7
                                    w-7
                                    items-center
                                    justify-center
                                    rounded-lg
                                    bg-red-50
                                    text-sm
                                "
                            >
                                🍽️
                            </span>

                            <div className="text-left">
                                <p
                                    className="
                                        text-[9px]
                                        font-bold
                                        uppercase
                                        tracking-wider
                                        text-slate-400
                                    "
                                >
                                    DineDesk
                                </p>

                                <p
                                    className="
                                        text-xs
                                        font-bold
                                        text-slate-700
                                    "
                                >
                                    Table missing
                                </p>
                            </div>
                        </div>

                        {/* Floating check */}

                        <div
                            className="
                                absolute
                                -bottom-3
                                -left-3
                                flex
                                h-14
                                w-14
                                items-center
                                justify-center
                                rounded-2xl
                                border
                                border-red-100
                                bg-white
                                text-red-500
                                shadow-xl
                                shadow-red-100
                                animate-[bounce_5s_ease-in-out_infinite]
                                sm:-left-7
                            "
                        >
                            <svg
                                className="h-6 w-6"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <path
                                    d="M5 12l4 4L19 6"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </div>

                    </div>

                </div>

            </section>

            {/* ========================================================= */}
            {/* FOOTER */}
            {/* ========================================================= */}

            <div
                className="
                    absolute
                    bottom-5
                    left-0
                    right-0
                    z-20
                    text-center
                    text-[10px]
                    font-medium
                    uppercase
                    tracking-[0.25em]
                    text-slate-300
                    sm:text-xs
                "
            >
                DineDesk · Restaurant Management
            </div>

        </main>
    );
}


/* ============================================================= */
/* MAGNETIC BUTTON                                                */
/* ============================================================= */

function MagneticButton({
    children,
}: {
    children: React.ReactNode;
}) {
    const buttonRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = (
        event: React.MouseEvent<HTMLDivElement>
    ) => {
        if (!buttonRef.current) return;

        const rect = buttonRef.current.getBoundingClientRect();

        const x =
            (event.clientX - rect.left - rect.width / 2) * 0.12;

        const y =
            (event.clientY - rect.top - rect.height / 2) * 0.12;

        buttonRef.current.style.transform = `translate(${x}px, ${y}px)`;
    };

    const handleMouseLeave = () => {
        if (!buttonRef.current) return;

        buttonRef.current.style.transform =
            "translate(0px, 0px)";
    };

    return (
        <div
            ref={buttonRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="
                w-full
                transition-transform
                duration-200
                ease-out
                sm:w-auto
            "
        >
            {children}
        </div>
    );
}