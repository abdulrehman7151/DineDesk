import Link from "next/link";
import { redirect } from "next/navigation";
import { getUserFromToken } from "@/lib/authtoke";
import { getMenuItems } from "@/services/MenuServices";
import MenuClient from "./MenuClient";

export default async function AdminMenu() {
    const user = await getUserFromToken();

    if (!user) {
        redirect("/signin");
    }

    const items = await getMenuItems(user.restaurantId);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Menu</h1>
                    <p className="mt-1 text-sm text-ink-soft">
                        Manage your restaurant menu items.
                    </p>
                </div>

                <Link
                    href="/admin/menu/additems"
                    className="rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-white shadow-soft transition hover:bg-brand-deep"
                >
                    + Add Item
                </Link>
            </div>

            <MenuClient items={items} />
        </div>
    );
}
