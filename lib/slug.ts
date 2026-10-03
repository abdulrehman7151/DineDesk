// hotel-mangement/lib/slug.ts
import { prisma } from "@/lib/prisma";


function createSlug(value: string): string {
    return value
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")        // spaces -> hyphens
        .replace(/[^a-z0-9-]/g, "")  // drop non-alphanumeric (keep hyphens)
        .replace(/-+/g, "-")         // collapse multiple hyphens
        .replace(/^-|-$/g, "");      // trim leading/trailing hyphens
}


export async function createUniqueSlug(name: string): Promise<string> {
    const baseSlug = createSlug(name);

    let slug = baseSlug;
    let count = 2;

    while (await prisma.restaurant.findUnique({ where: { slug } })) {
        slug = `${baseSlug}-${count}`;
        count++;
    }

    return slug;
}