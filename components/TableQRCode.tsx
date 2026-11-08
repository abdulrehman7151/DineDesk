"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

type Props = {
    tableId: string;
    tableNumber: number;
    restaurantSlug: string;
    onClose: () => void;
};

export default function TableQRCode({
    tableId,
    tableNumber,
    restaurantSlug,
    onClose,
}: Props) {
    const [qrCode, setQrCode] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function generateQR() {
            try {
                const url = new URL(
                    `/r/${restaurantSlug}`,
                    window.location.origin
                );
                url.searchParams.set("tableId", tableId);

                const qr = await QRCode.toDataURL(url.toString(), {
                    width: 400,
                    margin: 2,
                });

                setQrCode(qr);
            } catch (error) {
                console.error("QR generation failed:", error);
            } finally {
                setLoading(false);
            }
        }

        generateQR();
    }, [tableId, restaurantSlug]);

    function downloadQR() {
        if (!qrCode) return;

        const link = document.createElement("a");

        link.href = qrCode;
        link.download = `table-${tableNumber}-qr.png`;

        link.click();
    }

    function printQR() {
        if (!qrCode) return;

        const printWindow = window.open("", "_blank");

        if (!printWindow) return;

        printWindow.document.write(`
            <html>
                <head>
                    <title>Table ${tableNumber} QR</title>

                    <style>
                        body {
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            justify-content: center;
                            min-height: 100vh;
                            font-family: Arial, sans-serif;
                        }

                        img {
                            width: 350px;
                            height: 350px;
                        }

                        h1 {
                            margin-bottom: 20px;
                        }
                    </style>
                </head>

                <body>
                    <h1>Table ${tableNumber}</h1>

                    <img src="${qrCode}" />

                    <p>Scan to view the menu</p>
                </body>
            </html>
        `);

        printWindow.document.close();

        printWindow.focus();

        printWindow.print();
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">

            <div className="w-full max-w-md rounded-card bg-surface p-6 shadow-lift">

                {/* Header */}
                <div className="flex items-start justify-between">

                    <div>
                        <h2 className="text-xl font-bold text-ink">
                            Table {tableNumber}
                        </h2>

                        <p className="mt-1 text-sm text-ink-soft">
                            Customer menu QR code
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="text-xl text-ink-muted hover:text-ink"
                    >
                        ×
                    </button>

                </div>

                {/* QR */}
                <div className="mt-6 flex justify-center">

                    {loading ? (
                        <div className="flex h-64 w-64 items-center justify-center rounded-xl bg-surface-tint">
                            <p className="text-sm text-ink-soft">
                                Generating QR...
                            </p>
                        </div>
                    ) : qrCode ? (
                        <div className="rounded-xl bg-white p-4">
                            <img
                                src={qrCode}
                                alt={`QR code for table ${tableNumber}`}
                                className="h-64 w-64"
                            />
                        </div>
                    ) : (
                        <p className="text-sm text-red-500">
                            Failed to generate QR code.
                        </p>
                    )}

                </div>

                {/* Buttons */}
                <div className="mt-6 flex gap-3">

                    <button
                        type="button"
                        onClick={downloadQR}
                        disabled={!qrCode}
                        className="flex-1 rounded-full bg-brand px-4 py-3 text-sm font-bold text-white disabled:opacity-50"
                    >
                        Download
                    </button>

                    <button
                        type="button"
                        onClick={printQR}
                        disabled={!qrCode}
                        className="flex-1 rounded-full border border-hairline bg-surface-tint px-4 py-3 text-sm font-bold text-ink disabled:opacity-50"
                    >
                        Print
                    </button>

                </div>

            </div>

        </div>
    );
}