"use server";

import cloudinary from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";
import { getUserFromToken } from "@/lib/authtoke";
import { revalidatePath } from "next/cache";

import { redirect } from "next/navigation";

type MenuSize = {
    name: string;
    price: number;
};

export type EditState = {
    success: boolean;
    message: string;
};

export async function updateMenuAction(
    prevState: EditState,
    formData: FormData
): Promise<EditState> {
    // =========================
    // Auth
    // =========================

    const user = await getUserFromToken();

    if (!user) {
        return {
            success: false,
            message: "You must be signed in to edit menu items.",
        };
    }

    const restaurantId = user.restaurantId;

    // =========================
    // Get form values
    // =========================

    const idRaw = formData.get("id");
    const name = formData.get("name");
    const category = formData.get("category");
    const price = formData.get("price");
    const description = formData.get("description");
    const sizesString = formData.get("sizes");
    const hasSizes = formData.get("hasSizes") === "true";
    const image = formData.get("image");
    const existingImageUrl = formData.get("existingImageUrl");
    const isAvailable = formData.get("isAvailable") === "on";

    // =========================
    // Validate id
    // =========================

    if (typeof idRaw !== "string" || idRaw.trim() === "") {
        return {
            success: false,
            message: "Missing item id.",
        };
    }

    const id = Number(idRaw);

    if (!Number.isInteger(id) || id <= 0) {
        return {
            success: false,
            message: "Invalid item id.",
        };
    }

    // =========================
    // Confirm item belongs to this restaurant
    // =========================

    const existing = await prisma.menuItem.findFirst({
        where: { id, restaurantId },
        select: { id: true, imageUrl: true },
    });

    if (!existing) {
        return {
            success: false,
            message: "Menu item not found.",
        };
    }

    // =========================
    // Validate name
    // =========================

    if (typeof name !== "string" || name.trim().length < 2) {
        return {
            success: false,
            message: "Item name must be at least 2 characters.",
        };
    }

    // =========================
    // Validate category
    // =========================

    if (typeof category !== "string" || category.trim() === "") {
        return {
            success: false,
            message: "Please select a category.",
        };
    }

    // =========================
    // Validate description
    // =========================

    if (
        typeof description !== "string" ||
        description.trim().length < 5
    ) {
        return {
            success: false,
            message: "Description must be at least 5 characters.",
        };
    }

    // =========================
    // Parse sizes
    // =========================

    let sizes: MenuSize[] = [];

    if (typeof sizesString === "string" && sizesString.trim() !== "") {
        try {
            const parsed = JSON.parse(sizesString);

            if (!Array.isArray(parsed)) {
                return {
                    success: false,
                    message: "Invalid sizes data.",
                };
            }

            sizes = parsed.map((s) => ({
                name:
                    typeof s.name === "string" ? s.name.trim() : "",
                price: Number(s.price),
            }));
        } catch {
            return {
                success: false,
                message: "Invalid sizes data.",
            };
        }
    }

    // =========================
    // Validate pricing
    // =========================

    let singlePrice: number | null = null;

    if (!hasSizes) {
        if (typeof price !== "string" || price.trim() === "") {
            return {
                success: false,
                message: "Price is required.",
            };
        }

        singlePrice = Number(price);

        if (!Number.isFinite(singlePrice) || singlePrice <= 0) {
            return {
                success: false,
                message: "Price must be greater than 0.",
            };
        }
    }

    if (hasSizes) {
        if (sizes.length === 0) {
            return {
                success: false,
                message: "Please add at least one size.",
            };
        }

        for (const size of sizes) {
            if (size.name === "") {
                return {
                    success: false,
                    message: "Every size must have a name.",
                };
            }

            if (!Number.isFinite(size.price) || size.price <= 0) {
                return {
                    success: false,
                    message: `Invalid price for ${size.name}.`,
                };
            }
        }
    }

    // =========================
    // Image handling
    // =========================

    let newImageUrl: string | null = null;
    let newImagePublicId: string | null = null;
    let imageWasReplaced = false;

    const hasNewFile = image instanceof File && image.size > 0;

    if (hasNewFile) {
        const maxSize = 2 * 1024 * 1024;

        if ((image as File).size > maxSize) {
            return {
                success: false,
                message: "Image must be smaller than 2MB.",
            };
        }

        const allowed = ["image/jpeg", "image/png", "image/webp"];

        if (!allowed.includes((image as File).type)) {
            return {
                success: false,
                message: "Only JPG, PNG and WEBP images are allowed.",
            };
        }

        try {
            const bytes = await (image as File).arrayBuffer();
            const buffer = Buffer.from(bytes);

            const result: any = await new Promise((resolve, reject) => {
                cloudinary.uploader
                    .upload_stream(
                        {
                            folder: "dinedesk/menu",
                            resource_type: "image",
                        },
                        (error, result) => {
                            if (error) reject(error);
                            else resolve(result);
                        }
                    )
                    .end(buffer);
            });

            newImageUrl = result.secure_url;
            newImagePublicId = result.public_id;
            imageWasReplaced = true;
        } catch {
            return {
                success: false,
                message: "Failed to upload image.",
            };
        }
    } else if (
        typeof existingImageUrl === "string" &&
        existingImageUrl.trim() !== ""
    ) {
        newImageUrl = existingImageUrl;
    } else {
        return {
            success: false,
            message: "Please upload an image.",
        };
    }

    // =========================
    // Save to DB
    // =========================

    try {
        await prisma.$transaction(async (tx) => {
            await tx.menuItem.update({
                where: { id },
                data: {
                    ProductName: name.trim(),
                    category: category.trim(),
                    description: description.trim(),
                    isAvailable,
                    basePrice: hasSizes ? null : singlePrice,
                    imageUrl: newImageUrl,
                    sizes: {
                        deleteMany: {},
                        create: hasSizes
                            ? sizes.map((s) => ({
                                Size: s.name,
                                price: s.price,
                            }))
                            : [],
                    },
                },
            });
        });
    } catch (error) {
        console.error("Menu update error:", error);

        if (newImagePublicId) {
            try {
                await cloudinary.uploader.destroy(newImagePublicId);
            } catch { }
        }

        return {
            success: false,
            message:
                "Failed to update item. The name might already be in use.",
        };
    }

    // =========================
    // Delete old Cloudinary image if replaced
    // =========================

    if (imageWasReplaced && existing.imageUrl) {
        try {
            const match = existing.imageUrl.match(
                /\/dinedesk\/menu\/[^/]+$/
            );

            if (match) {
                const publicId = match[0].replace(/^\//, "");
                await cloudinary.uploader.destroy(publicId);
            }
        } catch (error) {
            console.warn("Failed to delete old Cloudinary image:", error);
        }
    }

    // =========================
    // Refresh menu list
    // =========================

    revalidatePath("/admin/menu");

    return {
        success: true,
        message: "Menu item updated successfully.",
    };
    redirect("/admin/menu");
}