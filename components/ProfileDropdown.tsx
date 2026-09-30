"use client";
import { useState, useEffect, useRef } from "react";
import { logout } from "@/actions/signout";
type Props = {
    initial?: string;
    role?: string;
    name?: string;
    city?: string
};
export default function ProfileDropdown({ initial, role, name, city }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);
    const handleLogout = async () => {
        await logout();
    };
    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                aria-label="User menu"
                aria-expanded={isOpen}
                aria-haspopup="menu"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-xs font-bold text-white transition hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2"
            >
                {initial}
            </button>
            {isOpen && (
                <div
                    role="menu"
                    className="absolute right-0 top-12 z-50 w-48 rounded-xl border border-hairline bg-surface p-1.5 shadow-xl"
                >
                    <div className="border-b border-hairline px-3 py-2.5">
                        <p className="text-sm font-semibold text-ink">
                            {role}
                        </p>
                        <p className="mt-0.5 text-xs text-ink-muted">
                            {name}
                        </p>
                        <p className="mt-0.5 text-xs text-ink-muted">
                            {city}
                        </p>
                    </div>
                    <button
                        type="button"
                        role="menuitem"
                        onClick={handleLogout}
                        className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:hover:bg-red-950/30"
                    >
                        <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4m7 14l5-5-5-5m5 5H9"
                            />
                        </svg>
                        Sign out
                    </button>
                </div>
            )}
        </div>
    );
}