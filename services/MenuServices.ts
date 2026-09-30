import { prisma } from "@/lib/prisma";

type sizes = {
    name: string,
    price: number
}

type MenuType = {
    name: string,
    category: string,
    description: string
    price?: number | null
    sizes?: sizes[],
    imageUrl: string,
    imagePublicId: string,
    isAvailable: boolean
    restaurantId: number
}

export const MenuServices = async (
    data: MenuType
) => {
    return await prisma.$transaction(async (tx) => {

        const menu = await tx.menuItem.create({
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

        return menu;
    });
};
export const getMenuItems = async (restaurantId: number) => {
    return prisma.menuItem.findMany({
        where: { restaurantId },
        include: { sizes: true },
        orderBy: { createdAt: "desc" },
    });
};