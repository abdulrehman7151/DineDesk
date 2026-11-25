import { redirect } from "next/navigation";
import { getUserFromToken } from "@/lib/authtoke";
import { prisma } from "@/lib/prisma";
import NewOrderForm from "./NewOrderForm";

export default async function AdminNewOrder() {
    const user = await getUserFromToken();

    if (!user) redirect("/signin");
    if (user.role !== "admin") redirect("/kitchen");

    const [tables, items] = await Promise.all([
        prisma.table.findMany({
            where: { restaurantId: user.restaurantId },
            select: { id: true, number: true, seats: true, status: true },
            orderBy: { number: "asc" },
        }),
        prisma.menuItem.findMany({
            where: { restaurantId: user.restaurantId, isAvailable: true },
            select: {
                id: true,
                ProductName: true,
                category: true,
                basePrice: true,
                sizes: {
                    select: { id: true, Size: true, price: true },
                    orderBy: { price: "asc" },
                },
            },
            orderBy: { ProductName: "asc" },
        }),
    ]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">New Order</h1>
                <p className="mt-1 text-sm text-ink-soft">
                    Take a walk-in or phone order for a table.
                </p>
            </div>

            <NewOrderForm tables={tables} items={items} />
        </div>
    );
}
