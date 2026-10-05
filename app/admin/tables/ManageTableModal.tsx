"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    updateTableAction,
    deleteTableAction,
} from "@/actions/TableActions";

type Props = {
    tableId: number;
    initialNumber: number;
    initialSeats: number;
    onClose: () => void;
};

export default function ManageTableModal({
    tableId,
    initialNumber,
    initialSeats,
    onClose,
}: Props) {
    const router = useRouter();

    const [number, setNumber] = useState(String(initialNumber));
    const [seats, setSeats] = useState(String(initialSeats));

    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState("");
    const [confirmDelete, setConfirmDelete] = useState(false);

    // =========================
    // Save (update)
    // =========================
    async function handleSave(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError("");

        const tableNumber = Number(number);
        const seatCount = Number(seats);

        if (!tableNumber || tableNumber < 1) {
            setError("Enter a valid table number.");
            return;
        }
        if (!seatCount || seatCount < 1) {
            setError("Enter a valid number of seats.");
            return;
        }

        try {
            setSaving(true);

            const result = await updateTableAction(tableId, {
                number: tableNumber,
                seats: seatCount,
            });

            if (!result.success) {
                setError(result.message);
                return;
            }

            onClose();
            router.refresh();
        } catch (err) {
            console.error("Update table error:", err);
            setError("Something went wrong.");
        } finally {
            setSaving(false);
        }
    }

    // =========================
    // Delete
    // =========================
    async function handleDelete() {
        setError("");
        try {
            setDeleting(true);

            const result = await deleteTableAction(tableId);

            if (!result.success) {
                setError(result.message);
                return;
            }

            onClose();
            router.refresh();
        } catch (err) {
            console.error("Delete table error:", err);
            setError("Something went wrong.");
        } finally {
            setDeleting(false);
        }
    }

    const busy = saving || deleting;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-md rounded-card border border-hairline bg-surface p-6 shadow-lift">

                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-ink">
                            Manage Table {initialNumber}
                        </h2>
                        <p className="mt-1 text-sm text-ink-soft">
                            Edit details or delete this table.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={busy}
                        className="text-xl text-ink-muted transition hover:text-ink disabled:opacity-50"
                    >
                        ×
                    </button>
                </div>

                {!confirmDelete ? (
                    <form onSubmit={handleSave} className="mt-6 space-y-4">
                        <div>
                            <label
                                htmlFor="edit-tableNumber"
                                className="text-sm font-semibold text-ink"
                            >
                                Table Number
                            </label>
                            <input
                                id="edit-tableNumber"
                                type="number"
                                min="1"
                                value={number}
                                onChange={(e) => setNumber(e.target.value)}
                                disabled={busy}
                                className="mt-2 w-full rounded-xl border border-hairline bg-surface-tint px-4 py-3 text-sm outline-none transition focus:border-brand disabled:opacity-60"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="edit-tableSeats"
                                className="text-sm font-semibold text-ink"
                            >
                                Number of Seats
                            </label>
                            <input
                                id="edit-tableSeats"
                                type="number"
                                min="1"
                                value={seats}
                                onChange={(e) => setSeats(e.target.value)}
                                disabled={busy}
                                className="mt-2 w-full rounded-xl border border-hairline bg-surface-tint px-4 py-3 text-sm outline-none transition focus:border-brand disabled:opacity-60"
                            />
                        </div>

                        {error && (
                            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                                {error}
                            </p>
                        )}

                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setConfirmDelete(true)}
                                disabled={busy}
                                className="rounded-full border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600 transition hover:bg-red-100 disabled:opacity-60"
                            >
                                Delete
                            </button>

                            <button
                                type="button"
                                onClick={onClose}
                                disabled={busy}
                                className="flex-1 rounded-full border border-hairline bg-surface-tint py-3 text-sm font-bold text-ink transition hover:border-brand disabled:opacity-60"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={busy}
                                className="flex-1 rounded-full bg-brand py-3 text-sm font-bold text-white transition hover:bg-brand-deep disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {saving ? "Saving..." : "Save"}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="mt-6">
                        <div className="rounded-xl bg-red-50 p-4">
                            <p className="text-sm font-bold text-red-700">
                                Delete this table?
                            </p>
                            <p className="mt-1 text-xs text-red-600">
                                This action cannot be undone.
                            </p>
                        </div>

                        {error && (
                            <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                                {error}
                            </p>
                        )}

                        <div className="mt-6 flex gap-3">
                            <button
                                type="button"
                                onClick={() => setConfirmDelete(false)}
                                disabled={busy}
                                className="flex-1 rounded-full border border-hairline bg-surface-tint py-3 text-sm font-bold text-ink transition hover:border-brand disabled:opacity-60"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={busy}
                                className="flex-1 rounded-full bg-red-600 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {deleting ? "Deleting..." : "Yes, Delete"}
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}