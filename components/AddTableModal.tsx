"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createTableAction } from "@/actions/TableActions";

type Props = {
    onClose: () => void;
};

export default function AddTableModal({ onClose }: Props) {
    const router = useRouter();

    const [number, setNumber] = useState("");
    const [seats, setSeats] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(
        e: React.FormEvent<HTMLFormElement>
    ) {
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
            setLoading(true);

            const result = await createTableAction({
                number: tableNumber,
                seats: seatCount,
            });

            if (!result.success) {
                setError(result.message);
                return;
            }

            onClose();

            router.refresh();

        } catch (error) {
            console.error("Create table error:", error);

            setError("Something went wrong.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">

            <div className="w-full max-w-md rounded-card border border-hairline bg-surface p-6 shadow-lift">

                {/* Header */}
                <div className="flex items-start justify-between">

                    <div>
                        <h2 className="text-xl font-bold text-ink">
                            Add Table
                        </h2>

                        <p className="mt-1 text-sm text-ink-soft">
                            Create a new table for your restaurant.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="text-xl text-ink-muted transition hover:text-ink"
                    >
                        ×
                    </button>

                </div>

                {/* Form */}
                <form
                    onSubmit={handleSubmit}
                    className="mt-6 space-y-4"
                >

                    {/* Table Number */}
                    <div>
                        <label
                            htmlFor="tableNumber"
                            className="text-sm font-semibold text-ink"
                        >
                            Table Number
                        </label>

                        <input
                            id="tableNumber"
                            type="number"
                            min="1"
                            value={number}
                            onChange={(e) =>
                                setNumber(e.target.value)
                            }
                            placeholder="e.g. 13"
                            className="mt-2 w-full rounded-xl border border-hairline bg-surface-tint px-4 py-3 text-sm outline-none transition focus:border-brand"
                        />
                    </div>

                    {/* Seats */}
                    <div>
                        <label
                            htmlFor="tableSeats"
                            className="text-sm font-semibold text-ink"
                        >
                            Number of Seats
                        </label>

                        <input
                            id="tableSeats"
                            type="number"
                            min="1"
                            value={seats}
                            onChange={(e) =>
                                setSeats(e.target.value)
                            }
                            placeholder="e.g. 4"
                            className="mt-2 w-full rounded-xl border border-hairline bg-surface-tint px-4 py-3 text-sm outline-none transition focus:border-brand"
                        />
                    </div>

                    {/* Error */}
                    {error && (
                        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                            {error}
                        </p>
                    )}

                    {/* Buttons */}
                    <div className="flex gap-3 pt-2">

                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 rounded-full border border-hairline bg-surface-tint py-3 text-sm font-bold text-ink transition hover:border-brand"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 rounded-full bg-brand py-3 text-sm font-bold text-white transition hover:bg-brand-deep disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading
                                ? "Creating..."
                                : "Create Table"}
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}