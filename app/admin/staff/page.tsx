"use client";

import { useMemo, useState } from "react";
import type { StaffMember, StaffRole } from "@/types/staffKitchen";

const ROLES: StaffRole[] = ["chef", "waiter", "manager", "cashier"];

export default function StaffPage() {
    const [staff, setStaff] = useState<StaffMember[]>([
        // Replace with fetch("/api/staff")
    ]);
    const [search, setSearch] = useState("");
    const [role, setRole] = useState<StaffRole | "all">("all");

    const filtered = useMemo(
        () =>
            staff.filter(
                (s) =>
                    (role === "all" || s.role === role) &&
                    s.name.toLowerCase().includes(search.toLowerCase())
            ),
        [staff, search, role]
    );

    const toggleActive = async (id: string, isActive: boolean) => {
        await fetch(`/api/staff/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isActive }),
        });
        setStaff((prev) =>
            prev.map((s) => (s.id === id ? { ...s, isActive } : s))
        );
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Staff</h1>
                <button className="bg-black text-white px-4 py-2 rounded-lg">
                    + Add Staff
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name…"
                    className="border rounded-lg px-3 py-2 flex-1 min-w-[200px]"
                />
                <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as StaffRole | "all")}
                    className="border rounded-lg px-3 py-2"
                >
                    <option value="all">All roles</option>
                    {ROLES.map((r) => (
                        <option key={r} value={r}>{r}</option>
                    ))}
                </select>
            </div>

            {/* Staff table */}
            <div className="border rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-left">
                        <tr>
                            <th className="p-3">Name</th>
                            <th className="p-3">Role</th>
                            <th className="p-3">Email</th>
                            <th className="p-3">Status</th>
                            <th className="p-3"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((s) => (
                            <tr key={s.id} className="border-t">
                                <td className="p-3 font-medium">{s.name}</td>
                                <td className="p-3 capitalize">{s.role}</td>
                                <td className="p-3">{s.email}</td>
                                <td className="p-3">
                                    <span
                                        className={`px-2 py-1 rounded-full text-xs ${s.isActive
                                            ? "bg-green-100 text-green-700"
                                            : "bg-gray-200 text-gray-600"
                                            }`}
                                    >
                                        {s.isActive ? "Active" : "Inactive"}
                                    </span>
                                </td>
                                <td className="p-3 text-right">
                                    <button
                                        onClick={() => toggleActive(s.id, !s.isActive)}
                                        className="text-blue-600 hover:underline"
                                    >
                                        {s.isActive ? "Deactivate" : "Activate"}
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan={6} className="p-6 text-center text-gray-400">
                                    No staff found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}