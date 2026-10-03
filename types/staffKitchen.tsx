export type OrderStatus = "pending" | "preparing" | "ready" | "served" | "cancelled";

export interface OrderItem {
    id: string;
    name: string;
    quantity: number;
    notes?: string;
}

export interface Order {
    id: string;
    tableNumber: number;
    items: OrderItem[];
    status: OrderStatus;
    createdAt: string;
    total: number;
}

export type StaffRole = "chef" | "waiter" | "manager" | "cashier";

export interface StaffMember {
    id: string;
    name: string;
    role: StaffRole;
    email: string;
    phone?: string;
    isActive: boolean;
    shift?: "morning" | "evening" | "night";
}