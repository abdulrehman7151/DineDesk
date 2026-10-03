// services/MenuServices.ts
import { prisma } from "@/lib/prisma";

type sizes = {
    name: string;
    price: number;
};

type MenuType = {
    name: string;
    category: string;
    description: string;
    price?: number | null;
    sizes?: sizes[];
    imageUrl: string;
    imagePublicId: string;
    isAvailable: boolean;
    restaurantId: number;
};

export const MenuServices = async (data: MenuType) => {
    const existingItem = await prisma.menuItem.findFirst({
        where: {
            restaurantId: data.restaurantId,
            ProductName: data.name,
        },
    });

    if (existingItem) {
        const duplicateError = new Error(
            "A menu item with this name already exists for this restaurant."
        );
        (duplicateError as Error & { code?: string }).code = "P2002";
        throw duplicateError;
    }

    return prisma.menuItem.create({
        data: {
            ProductName: data.name,
            category: data.category,
            description: data.description,
            imageUrl: data.imageUrl,
            isAvailable: data.isAvailable,
            basePrice: data.price,
            restaurantId: data.restaurantId,
            sizes: {
                create: (data.sizes ?? []).map((size) => ({
                    Size: size.name,
                    price: size.price,
                })),
            },
        },
    });
};

/**
 * Fetch the full menu for a restaurant in one query.
 * Category filtering now happens on the client, so we
 * intentionally do not accept a category filter here.
 */
export const getMenuItems = async (restaurantId: number) => {
    return prisma.menuItem.findMany({
        where: { restaurantId },
        include: { sizes: true },
        orderBy: { createdAt: "desc" },
    });
};

export const getMenuItemById = async (
    id: number,
    restaurantId: number
) => {
    return prisma.menuItem.findFirst({
        where: {
            id,
            restaurantId,
        },
        include: { sizes: true },
    });
};