import "server-only";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

// The user's own test restaurant. It is free forever and is exempt from
// the subscription paywall, in the admin area and on the guest menu.
// Identified by slug — the same slug in its guest-menu URL /r/eastern-cusine.
// This is a single hardcoded exemption, not a general bypass: no env flag,
// no toggle, no other restaurant is exempt.
export const FREE_RESTAURANT_SLUG = "eastern-cusine";

// True when the restaurant may use DineDesk without paying: either it is
// the free test restaurant, or it has an ACTIVE subscription. A PENDING
// subscription does not count — the payment must be confirmed first
// (by the Paddle webhook) before the app unlocks.
export async function hasActiveSubscriptionOrExempt(
    restaurantId: number
): Promise<boolean> {
    const [restaurant, subscription] = await Promise.all([
        prisma.restaurant.findUnique({
            where: { id: restaurantId },
            select: { slug: true },
        }),
        prisma.subscription.findFirst({
            where: { restaurantId, status: "ACTIVE" },
            // Explicit select: only the id is read, so this stays safe
            // even if the Paddle migration (which adds provider-id columns)
            // has not been applied to the production database yet.
            select: { id: true },
        }),
    ]);

    if (restaurant?.slug === FREE_RESTAURANT_SLUG) {
        return true;
    }

    return subscription !== null;
}

// Admin-area gate: call at the top of an admin page, right after the
// sign-in check. Restaurants without an ACTIVE subscription are sent to
// the subscription page to pay. The subscription page itself must NOT
// call this — otherwise nobody could ever pay. Sign-in, sign-up and the
// subscription success/cancel pages are outside the admin area and are
// unaffected.
//
// Note: this lives in each admin page (following the existing requireRole
// convention) rather than in the admin layout, because a server layout
// cannot reliably tell which page it is wrapping — and the subscription
// page sits inside that layout, so a layout-level redirect to it would
// loop forever.
export async function requireActiveSubscription(
    restaurantId: number
): Promise<void> {
    if (!(await hasActiveSubscriptionOrExempt(restaurantId))) {
        redirect("/admin/subscription");
    }
}
