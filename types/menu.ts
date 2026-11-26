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
    // Opening/closing hours as HH:MM (24-hour) strings, or null when the
    // owner has not set them. Optional so other constructors of this type
    // keep compiling; the guest page passes the real values.
    openingTime?: string | null;
    closingTime?: string | null;
};

export type MenuItemWithRestaurant = MenuItem & {
    restaurant: {
        name: string;
        slug: string;
    };
};