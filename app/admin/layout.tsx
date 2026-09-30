
import React from "react";
import Link from "next/link";
import { getUserFromToken } from "@/lib/authtoke";
import ProfileDropdown from "@/components/ProfileDropdown";
import { prisma } from "@/lib/prisma";

const navItems = [
    { href: "/admin", label: "Dashboard", icon: "M3 12l9-9 9 9M5 10v10h14V10" },
    { href: "/admin/menu", label: "Menu", icon: "M4 6h16M4 12h16M4 18h10" },
    { href: "/admin/tables", label: "Tables", icon: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" },
    { href: "/admin/orders", label: "Orders", icon: "M6 2l1.5 3h9L18 2M6 5v15a2 2 0 002 2h8a2 2 0 002-2V5" },
    { href: "/admin/inventory", label: "Inventory", icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-14L4 7m8 4v10M4 7v10l8 4" },
    { href: "/admin/sales", label: "Sales", icon: "M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" },
    { href: "/admin/analytics", label: "Analytics", icon: "M3 3v18h18M7 16l4-4 3 3 5-6" },
];

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await getUserFromToken();
    const restaurant = user
        ? await prisma.restaurant.findUnique({
            where: { id: user.restaurantId },
            select: { name: true, city: true },
        })
        : null;

    return (
        <div className="flex min-h-screen bg-surface text-ink">
            {/* Sidebar */}
            <aside className="hidden w-64 shrink-0 border-r border-hairline bg-surface p-5 lg:block">
                <Link href="/" className="mb-8 flex items-center gap-2.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-sm font-bold text-white">
                        D
                    </span>
                    <span className="text-lg font-bold tracking-tight text-ink">
                        DineDesk
                    </span>
                </Link>

                <p className="mb-3 px-2 text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                    Manage
                </p>

                <nav className="space-y-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-soft transition hover:bg-surface-tint hover:text-ink"
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
                                    d={item.icon}
                                />
                            </svg>
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="mt-8 rounded-xl border border-hairline bg-surface-tint p-4">
                    <p className="text-xs font-bold text-ink">
                        {restaurant?.name}
                    </p>
                    <p className="mt-0.5 text-[11px] text-ink-muted">
                        Admin account
                    </p>
                </div>
            </aside>

            {/* Main */}
            <div className="flex min-w-0 flex-1 flex-col">
                {/* Topbar */}
                <header className="sticky top-0 z-40 border-b border-hairline bg-surface/85 backdrop-blur-md">
                    <div className="flex items-center justify-between px-5 py-3.5 lg:px-8">
                        <div className="flex items-center gap-3 lg:hidden">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-xs font-bold text-white">
                                D
                            </span>
                            <span className="text-sm font-bold">
                                DineDesk
                            </span>
                        </div>

                        <div className="hidden lg:block">
                            <p className="text-xs text-ink-soft">
                                Admin Panel
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Notification */}
                            <button
                                type="button"
                                aria-label="Notifications"
                                className="flex h-9 w-9 items-center justify-center rounded-full border border-hairline bg-surface text-ink-soft transition hover:text-ink"
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
                                        d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0a3 3 0 11-6 0"
                                    />
                                </svg>
                            </button>

                            {/* Client dropdown */}
                            <ProfileDropdown
                                initial={user?.email[0]}
                                role={user?.role}
                                name={restaurant?.name}
                                city={restaurant?.city}
                            />
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 px-5 py-6 lg:px-8 lg:py-8">
                    {children}
                </main>
            </div>
        </div>
    );
}