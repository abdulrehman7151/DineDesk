import { getMenuItemById } from "@/services/MenuServices";
import { updateMenuAction } from "@/actions/editMenu";
import { getUserFromToken } from "@/lib/authtoke";
import MenuItemForm from "@/components/MenuItemForm";
import { notFound, redirect } from "next/navigation";

type EditItemPageProps = {
    searchParams?: Promise<{ id?: string }> | { id?: string };
};

export default async function EditItemPage({ searchParams }: EditItemPageProps) {
    const user = await getUserFromToken();
    if (!user) redirect("/signin");

    const params = searchParams ? await searchParams : {};
    const { id } = params;

    if (id == null) {
        // No id given → go back to menu
        redirect("/admin/menu");
    }

    const itemId = Number(id);
    if (Number.isNaN(itemId)) {
        notFound();
    }

    const item = await getMenuItemById(itemId, user.restaurantId);
    if (!item) {
        notFound();
    }

    return (
        <MenuItemForm
            mode="edit"
            item={item}
            action={updateMenuAction}
        />
    );
}