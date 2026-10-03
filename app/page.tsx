// app/page.tsx
import { redirect } from "next/navigation";
import { getUserFromToken } from "@/lib/authtoke";
import { prisma } from "@/lib/prisma";

export default async function HomePage() {
  const user = await getUserFromToken();

  // 1. Logged-in admin → their own restaurant's menu
  if (user) {
    const own = await prisma.restaurant.findUnique({
      where: { id: user.restaurantId },
      select: { slug: true },
    });
    if (own) redirect(`/r/${own.slug}`);
  }

  // 2. Anonymous (QR scan that somehow hit "/", or someone typing the URL)
  //    → send them to a default restaurant for demo purposes,
  //      or better: show a "scan a QR / enter a slug" landing page.
  const fallback = await prisma.restaurant.findFirst({
    orderBy: { id: "asc" },
    select: { slug: true },
  });

  if (!fallback) {
    // No restaurants exist yet
    redirect("/signup");
  }

  redirect(`/r/${fallback.slug}`);
}