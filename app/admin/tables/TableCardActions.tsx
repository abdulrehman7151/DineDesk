"use client";

import { useState } from "react";
import TableQRCode from "@/components/TableQRCode";
import ManageTableModal from "./ManageTableModal";

type Props = {
    tableId: number;
    tableQrId: string;
    tableNumber: number;
    tableSeats: number;
    restaurantSlug: string;
};

export default function TableCardActions({
    tableId,
    tableQrId,
    tableNumber,
    tableSeats,
    restaurantSlug,
}: Props) {
    const [isQrOpen, setIsQrOpen] = useState(false);
    const [isManageOpen, setIsManageOpen] = useState(false);

    return (
        <>
            <div className="mt-4 flex gap-2">
                <button
                    type="button"
                    onClick={() => setIsQrOpen(true)}
                    className="flex-1 rounded-full border border-hairline bg-surface-tint py-2 text-xs font-bold text-ink transition hover:border-brand hover:text-brand"
                >
                    QR Code
                </button>

                <button
                    type="button"
                    onClick={() => setIsManageOpen(true)}
                    className="flex-1 rounded-full border border-hairline bg-surface-tint py-2 text-xs font-bold text-ink transition hover:border-brand hover:text-brand"
                >
                    Manage
                </button>
            </div>

            {isQrOpen && (
                <TableQRCode
                    tableId={tableQrId}
                    tableNumber={tableNumber}
                    restaurantSlug={restaurantSlug}
                    onClose={() => setIsQrOpen(false)}
                />
            )}

            {isManageOpen && (
                <ManageTableModal
                    tableId={tableId}
                    initialNumber={tableNumber}
                    initialSeats={tableSeats}
                    onClose={() => setIsManageOpen(false)}
                />
            )}
        </>
    );
}