import { MenuAction } from "@/actions/MenuAdd";
import MenuItemForm from "@/components/MenuItemForm";

export default function AddItemPage() {
    return <MenuItemForm mode="add" action={MenuAction} />;
}