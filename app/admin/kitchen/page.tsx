"use client";

import { useEffect, useState } from "react";
import type { Order, OrderStatus } from "@/types/staffKitchen";

const FILTERS: OrderStatus[] = ["pending", "preparing", "ready"];

export default function KitchenPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [filter, setFilter] = useState<OrderStatus>("pending");

    // Example fetch — replace with your API
    useEffect(() => {
        const load = async () => {
            const res = await fetch("/api/orders");
            setOrders(await res.json());
        };
        load();
        const id = setInterval(load, 10_000); // auto-refresh every 10s
        return () => clearInterval(id);
    }, []);

    const updateStatus = async (id: string, status: OrderStatus) => {
        await fetch(`/api/orders/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status }),
        });
        setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    };

    const filtered = orders.filter((o) => o.status === filter);

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Kitchen</h1>
                <span className="text-sm text-gray-500">
                    {orders.filter((o) => o.status !== "served").length} active orders
                </span>
            </div>

            {/* Filter tabs */}
            <div className="flex gap-2">
                {FILTERS.map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-lg capitalize ${filter === f ? "bg-black text-white" : "bg-gray-100"
                            }`}
                    >
                        {f} ({orders.filter((o) => o.status === f).length})
                    </button>
                ))}
            </div>

            {/* Orders grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((order) => (
                    <div key={order.id} className="border rounded-xl p-4 space-y-3">
                        <div className="flex justify-between">
                            <h2 className="font-semibold">Table {order.tableNumber}</h2>
                            <span className="text-xs text-gray-500">
                                {new Date(order.createdAt).toLocaleTimeString()}
                            </span>
                        </div>
                        <ul className="text-sm space-y-1">
                            {order.items.map((i) => (
                                <li key={i.id}>
                                    {i.quantity}× {i.name}
                                    {i.notes && <span className="text-gray-400"> — {i.notes}</span>}
                                </li>
                            ))}
                        </ul>
                        <div className="flex gap-2 pt-2">
                            {filter === "pending" && (
                                <button
                                    onClick={() => updateStatus(order.id, "preparing")}
                                    className="flex-1 bg-yellow-500 text-white rounded-lg py-2"
                                >
                                    Start
                                </button>
                            )}
                            {filter === "preparing" && (
                                <button
                                    onClick={() => updateStatus(order.id, "ready")}
                                    className="flex-1 bg-green-600 text-white rounded-lg py-2"
                                >
                                    Mark Ready
                                </button>
                            )}
                            {filter === "ready" && (
                                <button
                                    onClick={() => updateStatus(order.id, "served")}
                                    className="flex-1 bg-blue-600 text-white rounded-lg py-2"
                                >
                                    Served
                                </button>
                            )}
                        </div>
                    </div>
                ))}
                {filtered.length === 0 && (
                    <p className="text-gray-400">No {filter} orders.</p>
                )}
            </div>
        </div>
    );
}