"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { StaffRole } from "@/types/staffKitchen";
import AddStaffModal from "@/components/AddStaffModal";
import { addStaffAction, toggleStaffAction } from "@/actions/StaffActions";

type StaffRow = {
    id: number;
    name: string;
    email: string;
    role: StaffRole;
    isActive: boolean;
};

const ROLES: StaffRole[] = ["chef", "waiter", "manager", "cashier"];

export default function StaffClient({ initialStaff }: { initialStaff: StaffRow[] }) {
    const router = useRouter();
    const [staff, setStaff] = useState<StaffRow[]>(initialStaff);
    const [search, setSearch] = useState("");
    const [role, setRole] = useState<StaffRole | "all">("all");
    const [showModal, setShowModal] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);
    const [pendingId, setPendingId] = useState<number | null>(null);
    const [, startTransition] = useTransition();

    const filtered = useMemo(
        () =>
            staff.filter(
                (s) =>
                    (role === "all" || s.role === role) &&
                    s.name.toLowerCase().includes(search.toLowerCase())
            ),
        [staff, search, role]
    );

    const handleAddStaff = async (newStaff: {
        name: string;
        email: string;
        role: StaffRole;
        password: string;
    }) => {
        setError(null);
        setNotice(null);

        const result = await addStaffAction(newStaff);

        if (!result.success) return result;

        if (result.staff) {
            setStaff((prev) => [result.staff!, ...prev]);
        }

        setNotice(result.message);
        router.refresh();
        return result;
    };

    const toggleActive = (id: number) => {
        const current = staff.find((s) => s.id === id);
        if (!current) return;
        const next = !current.isActive;

        setError(null);
        setPendingId(id);

        // optimistic
        setStaff((prev) =>
            prev.map((s) => (s.id === id ? { ...s, isActive: next } : s))
        );

        startTransition(async () => {
            const result = await toggleStaffAction(id, next);

            if (!result.success) {
                // rollback
                setStaff((prev) =>
                    prev.map((s) =>
                        s.id === id ? { ...s, isActive: !next } : s
                    )
                );
                setError(result.message ?? "Update failed.");
            }

            setPendingId(null);
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Staff</h1>
                    <p className="mt-1 text-sm text-ink-soft">
                        Manage your restaurant staff.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => setShowModal(true)}
                    className="rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-white shadow-soft transition hover:bg-brand-deep"
                >
                    + Add Staff
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name..."
                    className="min-w-[200px] flex-1 rounded-full border border-hairline bg-surface-tint px-4 py-2.5 text-sm outline-none focus:border-brand"
                />

                <select
                    value={role}
                    onChange={(e) =>
                        setRole(e.target.value as StaffRole | "all")
                    }
                    className="rounded-full border border-hairline bg-surface-tint px-4 py-2.5 text-sm font-medium outline-none"
                >
                    <option value="all">All roles</option>
                    {ROLES.map((r) => (
                        <option key={r} value={r}>
                            {r.charAt(0).toUpperCase() + r.slice(1)}
                        </option>
                    ))}
                </select>
            </div>

            {error && (
                <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </p>
            )}
            {notice && (
                <p className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                    {notice}
                </p>
            )}

            {/* Table */}
            <div className="overflow-hidden rounded-card border border-hairline bg-surface shadow-soft">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-hairline text-left text-xs font-bold uppercase tracking-wider text-ink-muted">
                            <th className="px-6 py-3.5">Name</th>
                            <th className="px-6 py-3.5">Role</th>
                            <th className="px-6 py-3.5">Email</th>
                            <th className="px-6 py-3.5">Status</th>
                            <th className="px-6 py-3.5"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((s) => (
                            <tr
                                key={s.id}
                                className="border-b border-hairline last:border-0 hover:bg-surface-tint"
                            >
                                <td className="px-6 py-4 font-semibold text-ink">
                                    {s.name}
                                </td>
                                <td className="px-6 py-4 capitalize text-ink-soft">
                                    {s.role}
                                </td>
                                <td className="px-6 py-4 text-ink-soft">
                                    {s.email}
                                </td>
                                <td className="px-6 py-4">
                                    <span
                                        className={`rounded-full px-2.5 py-1 text-xs font-bold ${s.isActive
                                            ? "bg-success-bg text-success-text"
                                            : "bg-surface-warm text-ink-soft"
                                            }`}
                                    >
                                        {s.isActive ? "Active" : "Inactive"}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        type="button"
                                        disabled={pendingId === s.id}
                                        onClick={() => toggleActive(s.id)}
                                        className={
                                            s.isActive
                                                ? "text-xs font-bold text-brand hover:text-brand-deep disabled:opacity-50"
                                                : "text-xs font-bold text-success-text hover:opacity-80 disabled:opacity-50"
                                        }
                                    >
                                        {s.isActive ? "Deactivate" : "Activate"}
                                    </button>
                                </td>
                            </tr>
                        ))}

                        {filtered.length === 0 && (
                            <tr>
                                <td
                                    colSpan={5}
                                    className="px-6 py-10 text-center text-sm text-ink-soft"
                                >
                                    No staff found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <AddStaffModal
                    onClose={() => setShowModal(false)}
                    onAdd={handleAddStaff}
                />
            )}
        </div>
    );
}