// actions/StaffActions.ts
"use server";

import { revalidatePath } from "next/cache";
import { getActiveStaff } from "@/lib/staffAuth";
import {
    createStaffMember,
    getStaffByRestaurant,
    setStaffActive,
} from "@/services/StaffServices";
import type { StaffRole } from "@/types/staffKitchen";

const ALLOWED_ROLES: StaffRole[] = ["chef", "manager", "cashier"];

const NOT_ALLOWED = {
    success: false as const,
    message: "Only the restaurant admin can manage staff.",
};

export async function addStaffAction(data: {
    name: string;
    email: string;
    role: StaffRole;
    password: string;
    phone: string;
}) {
    const user = await getActiveStaff();
    if (!user || user.role !== "admin") return NOT_ALLOWED;

    // ---- validation ----
    if (!data.name?.trim() || data.name.trim().length < 2) {
        return { success: false as const, message: "Name must be at least 2 characters." };
    }

    if (typeof data.password !== "string" || data.password.length < 8) {
        return {
            success: false as const,
            message: "Password must be at least 8 characters.",
        };
    }

    const email = data.email?.trim().toLowerCase();

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
        return {
            success: false as const,
            message: "Please enter a valid email.",
        };
    }

    if (!ALLOWED_ROLES.includes(data.role)) {
        return { success: false as const, message: "Invalid role." };
    }

    // Phone is optional, but must look like a phone number if given
    const phone = typeof data.phone === "string" ? data.phone.trim() : "";

    if (phone && !/^[0-9+\-\s()]{7,20}$/.test(phone)) {
        return {
            success: false as const,
            message: "Please enter a valid contact number.",
        };
    }

    try {
        const result = await createStaffMember({
            restaurantId: user.restaurantId,
            name: data.name.trim(),
            email,
            role: data.role,
            password: data.password,
            phone: phone || null,
        });

        revalidatePath("/admin/staff");

        return {
            success: true as const,
            message: result.createdUser
                ? "Staff member added."
                : "Staff added to the existing account. They must use their current password.",
            staff: {
                id: result.membership.id,
                name: result.membership.user.name,
                email: result.membership.user.email,
                phone: result.membership.user.phone,
                role: result.membership.role as StaffRole,
                isActive: result.membership.isActive,
            },
        };
    } catch (error) {
        console.error("addStaffAction:", error);
        const msg =
            error instanceof Error ? error.message : "Failed to add staff.";
        return { success: false as const, message: msg };
    }
}

export async function toggleStaffAction(id: number, isActive: boolean) {
    const user = await getActiveStaff();
    if (!user || user.role !== "admin") return NOT_ALLOWED;

    try {
        await setStaffActive(id, user.restaurantId, isActive);
        revalidatePath("/admin/staff");
        return { success: true as const };
    } catch (error) {
        console.error("toggleStaffAction:", error);
        return { success: false as const, message: "Failed to update staff." };
    }
}

/** Optional: server-side fetch used by the page. */
export async function listStaffAction() {
    const user = await getActiveStaff();
    if (!user || user.role !== "admin") return [];

    const rows = await getStaffByRestaurant(user.restaurantId);

    return rows.map((m) => ({
        id: m.id,
        name: m.user.name,
        email: m.user.email,
        phone: m.user.phone,
        role: m.role as StaffRole,
        isActive: m.isActive,
    }));
}