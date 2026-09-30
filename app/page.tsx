import { getMenuItems } from "@/services/MenuServices";
import { getUserFromToken } from "@/lib/authtoke";
import HomeClient from "./Homeclinet";

export default async function HomePage() {
  const user = await getUserFromToken();

  // If a logged-in user has a restaurantId, use it.
  // Otherwise fall back to 1 (for QR-code / public menu access).
  const restaurantId = user?.restaurantId ?? 1;

  const items = await getMenuItems(restaurantId);

  return <HomeClient items={items} />;
}