import { getUserFromToken } from "@/lib/authtoke";
import { getTables } from "@/services/TableServices";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import TableCardActions from "./TableCardActions";
import AddTableButton from "./AddTableButton";

const statusStyles: Record<string, string> = {
    AVAILABLE: "bg-success-bg text-success-text",
    OCCUPIED: "bg-brand-soft text-brand",
    RESERVED: "bg-surface-warm text-ink-soft",
};

export default async function AdminTables() {
    const user = await getUserFromToken();

    if (!user) {
        notFound();
    }

    const tables = await getTables(user.restaurantId);

    // NEW: fetch the restaurant slug for QR codes
    const restaurant = await prisma.restaurant.findUnique({
        where: { id: user.restaurantId },
        select: { slug: true },
    });

    if (!restaurant) {
        notFound();
    }

    const availableCount = tables.filter(
        (table) => table.status === "AVAILABLE"
    ).length;

    const occupiedCount = tables.filter(
        (table) => table.status === "OCCUPIED"
    ).length;

    const reservedCount = tables.filter(
        (table) => table.status === "RESERVED"
    ).length;

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Tables
                    </h1>

                    <p className="mt-1 text-sm text-ink-soft">
                        Live status of all tables in your restaurant.
                    </p>
                </div>


                <AddTableButton />
            </div>

            {/* Summary */}
            <div className="grid gap-4 sm:grid-cols-3">

                <div className="rounded-card border border-hairline bg-surface p-5 shadow-soft">
                    <p className="text-xs font-medium text-ink-soft">
                        Available
                    </p>
                    <p className="mt-2 text-2xl font-bold tracking-tight text-success-text">
                        {availableCount}
                    </p>
                </div>

                <div className="rounded-card border border-hairline bg-surface p-5 shadow-soft">
                    <p className="text-xs font-medium text-ink-soft">
                        Occupied
                    </p>
                    <p className="mt-2 text-2xl font-bold tracking-tight text-brand">
                        {occupiedCount}
                    </p>
                </div>

                <div className="rounded-card border border-hairline bg-surface p-5 shadow-soft">
                    <p className="text-xs font-medium text-ink-soft">
                        Reserved
                    </p>
                    <p className="mt-2 text-2xl font-bold tracking-tight text-ink-soft">
                        {reservedCount}
                    </p>
                </div>

            </div>

            {/* Table grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

                {tables.map((table) => (
                    <div
                        key={table.id}
                        className="rounded-card border border-hairline bg-surface p-5 shadow-soft transition hover:shadow-lift"
                    >
                        {/* Top */}
                        <div className="flex items-start justify-between">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-tint text-lg font-bold text-ink">
                                {table.number}
                            </div>

                            <span
                                className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${statusStyles[table.status]
                                    }`}
                            >
                                {table.status}
                            </span>
                        </div>

                        {/* Info */}
                        <div className="mt-4">
                            <p className="text-sm font-bold text-ink">
                                Table {table.number}
                            </p>
                            <p className="mt-0.5 text-xs text-ink-muted">
                                {table.seats} seats
                            </p>
                        </div>

                        {/* Buttons — now handled by client component */}
                        <TableCardActions
                            tableId={table.id}
                            tableQrId={table.qrToken}
                            tableNumber={table.number}
                            tableSeats={table.seats}
                            restaurantSlug={restaurant.slug}
                        />
                    </div>
                ))}

            </div>

        </div>
    );
}