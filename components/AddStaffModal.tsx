"use client";

import { useState } from "react";
import type { StaffRole } from "@/types/staffKitchen";

type AddStaffModalProps = {
    onClose: () => void;
    onAdd: (staff: {
        name: string;
        email: string;
        role: StaffRole;
        password: string;
        phone: string;
    }) => Promise<{ success: boolean; message: string }>;
};

const ROLES: StaffRole[] = ["chef", "manager", "cashier"];

export default function AddStaffModal({ onClose, onAdd }: AddStaffModalProps) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [role, setRole] = useState<StaffRole>("chef");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isSubmitting) return;

        setError(null);
        setIsSubmitting(true);

        try {
            const result = await onAdd({
                name: name.trim(),
                email: email.trim(),
                phone: phone.trim(),
                role,
                password,
            });

            if (!result.success) {
                setError(result.message);
                return;
            }

            setName("");
            setEmail("");
            setPhone("");
            setRole("chef");
            setPassword("");
            onClose();
        } catch {
            setError("Could not add staff. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) onClose();
    };

    const inputClass =
        "w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100";

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
            onClick={handleClose}
        >
            <div
                className="max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="mb-6 flex items-start justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">
                            Add Staff
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Add a new member to your restaurant.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={isSubmitting}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-xl text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                    >
                        ×
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                            Full Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter staff name"
                            required
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="staff@example.com"
                            required
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                            Contact Number{" "}
                            <span className="font-normal text-gray-400">
                                (optional)
                            </span>
                        </label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="0300 1234567"
                            autoComplete="tel"
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="At least 8 characters"
                            autoComplete="new-password"
                            minLength={8}
                            required
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                            Role
                        </label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value as StaffRole)}
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                        >
                            {ROLES.map((item) => (
                                <option key={item} value={item}>
                                    {item.charAt(0).toUpperCase() + item.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>

                    {error && (
                        <p role="alert" className="text-sm text-red-700">
                            {error}
                        </p>
                    )}

                    <div className="flex gap-3 pt-3">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={isSubmitting}
                            className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700"
                        >
                            {isSubmitting ? "Adding..." : "Add Staff"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}