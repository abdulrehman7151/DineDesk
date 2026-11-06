import { redirect } from "next/navigation";
import { getUserFromToken } from "@/lib/authtoke";
import { getStaffByRestaurant } from "@/services/StaffServices";
import StaffClient from "./StaffClient";
import type { StaffRole } from "@/types/staffKitchen";
import { requireRole } from "@/lib/authtoke";

export const dynamic = "force-dynamic";

export default async function StaffPage() {
    const user = await requireRole(["chef"]);
    if (!user) redirect("/signin");

    const memberships = await getStaffByRestaurant(user.restaurantId);

    const initialStaff = memberships.map((m) => ({
        id: m.id,                          // RestaurantUser.id
        name: m.user.name,
        email: m.user.email,
        role: m.role as StaffRole,
        isActive: m.isActive,
    }));

    return <StaffClient initialStaff={initialStaff} />;
}