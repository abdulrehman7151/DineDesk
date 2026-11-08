"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

type NavItem = {
    href: string;
    label: string;
    icon: string;
};

export default function MobileAdminNav({ items }: { items: NavItem[] }) {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        if (!isOpen) return;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") setIsOpen(false);
        }

        window.addEventListener("keydown", handleKeyDown);
        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen]);

    const drawer = isOpen ? (
        <div
            className="fixed inset-0 z-[100] bg-ink/40 lg:hidden"
            onClick={() => setIsOpen(false)}
        >
            <nav
                id="mobile-admin-navigation"
                aria-label="Admin navigation"
                className="h-full w-72 max-w-[85vw] overflow-y-auto bg-surface p-5 shadow-lift"
                onClick={(event) => event.stopPropagation()}
            >
                <p className="mb-4 px-2 text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                    Manage
                </p>
                <div className="space-y-1">
                    {items.map((item) => {
                        const isActive =
                            item.href === "/admin"
                                ? pathname === item.href
                                : pathname.startsWith(item.href);

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                aria-current={isActive ? "page" : undefined}
                                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                                    isActive
                                        ? "bg-brand-soft text-brand"
                                        : "text-ink-soft hover:bg-surface-tint hover:text-ink"
                                }`}
                            >
                                <svg
                                    className="h-4 w-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d={item.icon}
                                    />
                                </svg>
                                {item.label}
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </div>
    ) : null;

    return (
        <>
            <button
                type="button"
                aria-label={
                    isOpen ? "Close navigation menu" : "Open navigation menu"
                }
                aria-expanded={isOpen}
                aria-controls="mobile-admin-navigation"
                onClick={() => setIsOpen((open) => !open)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-hairline bg-surface text-ink-soft transition hover:text-ink lg:hidden"
            >
                <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                >
                    {isOpen ? (
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M6 18 18 6M6 6l12 12"
                        />
                    ) : (
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4 6h16M4 12h16M4 18h16"
                        />
                    )}
                </svg>
            </button>
            {drawer && typeof document !== "undefined"
                ? createPortal(drawer, document.body)
                : null}
        </>
    );
}
