// types/menu.ts

export type MenuSize = {
    id: number;
    Size: string;
    price: number;
    menuItemId: number;
};

export type MenuItem = {
    id: number;
    ProductName: string;
    category: string;
    description: string | null;
    imageUrl: string | null;
    isAvailable: boolean;
    createdAt: Date;
    basePrice: number | null;
    restaurantId: number;
    sizes: MenuSize[];
};

export type Restaurant = {
    id: number;
    name: string;
    slug: string;
    city: string;
    address: string;
    phone: string;
};

export type MenuItemWithRestaurant = MenuItem & {
    restaurant: {
        name: string;
        slug: string;
    };
};