import { redirect } from "next/navigation";
import { getUserFromToken } from "@/lib/authtoke";
import { requireActiveSubscription } from "@/lib/subscriptionGate";
import { MenuAction } from "@/actions/MenuAdd";
import MenuItemForm from "@/components/MenuItemForm";

export default async function AddItemPage() {
    const user = await getUserFromToken();
    if (!user) redirect("/signin");
    await requireActiveSubscription(user.restaurantId);

    return <MenuItemForm mode="add" action={MenuAction} />;
}
