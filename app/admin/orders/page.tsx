import { redirect } from "next/navigation";
import { getUserFromToken } from "@/lib/authtoke";
import { prisma } from "@/lib/prisma";

const statusTone: Record<string, string> = {
    PENDING: "bg-surface-warm text-ink-soft",
    PREPARING: "bg-brand-soft text-brand",
    READY: "bg-success-bg text-success-text",
    SERVED: "bg-surface-tint text-ink-soft",
    CANCELLED: "bg-red-100 text-red-700",
};

export default async function AdminOrders() {
    const user = await getUserFromToken();
    if (!user) redirect("/signin");

    const orders = await prisma.order.findMany({
        where: { restaurantId: user.restaurantId },
        include: { orderItems: true },
        orderBy: { createdAt: "desc" },
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
                    <p className="mt-1 text-sm text-ink-soft">
                        Track and manage incoming orders.
                    </p>
                </div>
            </div>

            {orders.length === 0 ? (
                <div className="rounded-card border border-hairline bg-surface-tint p-10 text-center">
                    <p className="text-sm text-ink-soft">No orders yet.</p>
                </div>
            ) : (
                <div className="overflow-hidden rounded-card border border-hairline bg-surface shadow-soft">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-hairline text-left text-xs font-bold uppercase tracking-wider text-ink-muted">
                                    <th className="px-6 py-3.5">Order ID</th>
                                    <th className="px-6 py-3.5">Table</th>
                                    <th className="px-6 py-3.5">Items</th>
                                    <th className="px-6 py-3.5">Total</th>
                                    <th className="px-6 py-3.5">Time</th>
                                    <th className="px-6 py-3.5">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order) => (
                                    <tr key={order.id} className="border-b border-hairline last:border-0 hover:bg-surface-tint">
                                        <td className="px-6 py-4 font-semibold text-ink">#{order.id}</td>
                                        <td className="px-6 py-4 text-ink-soft">
                                            {order.tableNumber == null ? "-" : `Table ${order.tableNumber}`}
                                        </td>
                                        <td className="px-6 py-4 text-ink-soft">
                                            {order.orderItems.reduce((count, item) => count + item.quantity, 0)} items
                                        </td>
                                        <td className="px-6 py-4 font-bold text-price">
                                            Rs. {order.total.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-ink-muted">
                                            {order.createdAt.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusTone[order.status]}`}>
                                                {order.status.charAt(0) + order.status.slice(1).toLowerCase()}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}