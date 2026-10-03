"use server";

import { prisma } from "@/lib/prisma";
import { getUserFromToken } from "@/lib/authtoke";
import { revalidatePath } from "next/cache";
import cloudinary from "@/lib/cloudinary";

export type DeleteState = {
    success: boolean;
    message: string;
};

export async function deleteMenuAction(
    prevState: DeleteState,
    formData: FormData
): Promise<DeleteState> {
    const user = await getUserFromToken();

    if (!user) {
        return { success: false, message: "Not authenticated." };
    }

    const idRaw = formData.get("id");

    if (typeof idRaw !== "string" || idRaw.trim() === "") {
        return { success: false, message: "Missing id." };
    }

    const id = Number(idRaw);

    if (!Number.isInteger(id) || id <= 0) {
        return { success: false, message: "Invalid id." };
    }

    // Verify ownership
    const existing = await prisma.menuItem.findFirst({
        where: { id, restaurantId: user.restaurantId },
        select: { id: true, imageUrl: true },
    });

    if (!existing) {
        return { success: false, message: "Item not found." };
    }

    // Delete from DB
    try {
        await prisma.menuItem.delete({ where: { id } });
    } catch (error) {
        console.error("Delete error:", error);
        return { success: false, message: "Failed to delete item." };
    }

    // Best-effort: delete Cloudinary image
    if (existing.imageUrl) {
        try {
            const match = existing.imageUrl.match(/\/dinedesk\/menu\/[^/]+$/);
            if (match) {
                const publicId = match[0].replace(/^\//, "");
                await cloudinary.uploader.destroy(publicId);
            }
        } catch (error) {
            console.warn("Cloudinary cleanup failed:", error);
        }
    }

    revalidatePath("/admin/menu");

    return { success: true, message: "Item deleted." };
}