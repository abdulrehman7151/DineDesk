"use server";

import cloudinary from "@/lib/cloudinary";
import { MenuServices } from "@/services/MenuServices";
import { getUserFromToken } from "@/lib/authtoke";

type MenuSize = {
    name: string;
    price: number;
};

export async function MenuAction(
    prevState: any,
    formData: FormData
) {
    // =========================
    // Auth: get user + restaurantId
    // =========================

    const user = await getUserFromToken();

    if (!user) {
        return {
            success: false,
            message: "You must be signed in to add menu items.",
        };
    }

    // Optional: only admins should add menu items
    // if (user.role !== "admin") {
    //     return {
    //         success: false,
    //         message: "Only admins can add menu items.",
    //     };
    // }
    console.log("=== MENU ACTION DEBUG ===");
    console.log("user:", user);
    console.log("restaurantId:", user?.restaurantId);
    console.log("typeof restaurantId:", typeof user?.restaurantId);

    const restaurantId = user.restaurantId;

    // =========================
    // Get form values
    // =========================

    const name = formData.get("name");
    const category = formData.get("category");
    const price = formData.get("price");
    const description = formData.get("description");

    const sizesString = formData.get("sizes");
    const hasSizes = formData.get("hasSizes") === "true";

    const image = formData.get("image");

    const isAvailable = formData.get("isAvailable") === "on";


    // =========================
    // Validate name
    // =========================

    if (
        typeof name !== "string" ||
        name.trim().length < 2
    ) {
        return {
            success: false,
            message: "Item name must be at least 2 characters.",
        };
    }


    // =========================
    // Validate category
    // =========================

    if (
        typeof category !== "string" ||
        category.trim() === ""
    ) {
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

    if (
        typeof sizesString === "string" &&
        sizesString.trim() !== ""
    ) {
        try {
            const parsedSizes = JSON.parse(sizesString);

            if (!Array.isArray(parsedSizes)) {
                return {
                    success: false,
                    message: "Invalid sizes data.",
                };
            }

            sizes = parsedSizes.map((size) => ({
                name:
                    typeof size.name === "string"
                        ? size.name.trim()
                        : "",
                price: Number(size.price),
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


    // No sizes → normal price
    if (!hasSizes) {

        if (
            typeof price !== "string" ||
            price.trim() === ""
        ) {
            return {
                success: false,
                message: "Price is required.",
            };
        }

        singlePrice = Number(price);

        if (
            !Number.isFinite(singlePrice) ||
            singlePrice <= 0
        ) {
            return {
                success: false,
                message: "Price must be greater than 0.",
            };
        }
    }


    // =========================
    // Has sizes → validate them
    // =========================

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

            if (
                !Number.isFinite(size.price) ||
                size.price <= 0
            ) {
                return {
                    success: false,
                    message: `Invalid price for ${size.name}.`,
                };
            }
        }
    }


    // =========================
    // Validate image
    // =========================

    if (!(image instanceof File)) {
        return {
            success: false,
            message: "Please upload an image.",
        };
    }


    if (image.size === 0) {
        return {
            success: false,
            message: "Image cannot be empty.",
        };
    }


    // Maximum 2MB
    const maxSize = 2 * 1024 * 1024;

    if (image.size > maxSize) {
        return {
            success: false,
            message: "Image must be smaller than 2MB.",
        };
    }


    // =========================
    // Validate image type
    // =========================

    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
    ];

    if (!allowedTypes.includes(image.type)) {
        return {
            success: false,
            message: "Only JPG, PNG and WEBP images are allowed.",
        };
    }


    // =========================
    // Upload image to Cloudinary
    // =========================

    let secureUrl = "";
    let publicId = "";

    try {

        const bytes = await image.arrayBuffer();

        const buffer = Buffer.from(bytes);

        const result: any = await new Promise(
            (resolve, reject) => {

                cloudinary.uploader.upload_stream(
                    {
                        folder: "dinedesk/menu",
                        resource_type: "image",
                    },

                    (error, result) => {

                        if (error) {
                            reject(error);
                        } else {
                            resolve(result);
                        }

                    }
                ).end(buffer);
            }
        );


        secureUrl = result.secure_url;
        publicId = result.public_id;

    } catch {

        return {
            success: false,
            message: "Failed to upload image.",
        };
    }


    // =========================
    // Make sure Cloudinary
    // returned both values
    // =========================

    if (!secureUrl || !publicId) {

        return {
            success: false,
            message: "Image upload failed.",
        };
    }


    // =========================
    // Final data
    // =========================

    const data = {
        name: name.trim(),

        category: category.trim(),

        description: description.trim(),

        hasSizes,

        price: singlePrice,

        sizes: hasSizes ? sizes : [],

        imageUrl: secureUrl,

        imagePublicId: publicId,

        isAvailable,

        restaurantId,
    };


    // =========================
    // Save to database
    // =========================

    try {
        const menu = await MenuServices(data);

        return {
            success: true,
            message: "Menu item added successfully.",
            data: menu,
        };
    } catch (error) {
        console.error("Menu create error:", error);

        // Roll back the Cloudinary upload if DB write fails
        try {
            await cloudinary.uploader.destroy(publicId);
        } catch { }

        return {
            success: false,
            message: "Failed to save menu item. Please try again.",
        };
    }
}

// export async function EdiMenu(id:number) {
    
// }