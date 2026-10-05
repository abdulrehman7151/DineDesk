"use client";

import { useState } from "react";
import AddTableModal from "@/components/AddTableModal";

export default function AddTableButton() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-white shadow-soft transition hover:bg-brand-deep"
            >
                + Add Table
            </button>

            {isOpen && <AddTableModal onClose={() => setIsOpen(false)} />}
        </>
    );
}