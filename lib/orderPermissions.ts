export type UpdatableOrderStatus = "PREPARING" | "READY" | "SERVED";

// The status an order must currently have before it can move to the new one
export const REQUIRED_CURRENT: Record<
    UpdatableOrderStatus,
    "PENDING" | "PREPARING" | "READY"
> = {
    PREPARING: "PENDING",
    READY: "PREPARING",
    SERVED: "READY",
};

// Which statuses each role may move an order INTO
const ROLE_PERMISSIONS: Record<string, UpdatableOrderStatus[]> = {
    admin: ["PREPARING", "READY", "SERVED"],
    manager: ["PREPARING", "READY", "SERVED"],
    chef: ["PREPARING", "READY"],
    waiter: ["SERVED"],
    cashier: [],
};

export function canSetStatus(role: string, status: UpdatableOrderStatus) {
    return ROLE_PERMISSIONS[role]?.includes(status) ?? false;
}

export function isUpdatableStatus(value: unknown): value is UpdatableOrderStatus {
    return value === "PREPARING" || value === "READY" || value === "SERVED";
}