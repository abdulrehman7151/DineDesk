"use server";

import { getUserFromToken } from "@/lib/authtoke";
import { prisma } from "@/lib/prisma";

export type RestaurantSettingsState = {
    success: boolean;
    message: string;
    invalidFields?: string[];
};

// 24-hour HH:MM, e.g. "09:00" or "23:00".
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export async function updateRestaurantSettings(
    prevState: RestaurantSettingsState,
    formData: FormData
): Promise<RestaurantSettingsState> {
    const user = await getUserFromToken();

    if (!user || user.role !== "admin") {
        return {
            success: false,
            message: "You must be signed in as an admin to change settings.",
        };
    }

    const text = (value: FormDataEntryValue | null): string =>
        typeof value === "string" ? value.trim() : "";

    const name = text(formData.get("name"));
    const city = text(formData.get("city"));
    const address = text(formData.get("address"));
    const phone = text(formData.get("phone"));
    const openingTime = text(formData.get("openingTime"));
    const closingTime = text(formData.get("closingTime"));
    const servedAutoCloseMinutesRaw = text(
        formData.get("servedAutoCloseMinutes")
    );

    const invalidFields: string[] = [];

    if (!name) invalidFields.push("name");
    if (!city) invalidFields.push("city");
    if (!address) invalidFields.push("address");
    if (!phone) invalidFields.push("phone");
    // Hours are optional — blank clears them — but a filled value must be
    // a valid HH:MM time.
    if (openingTime !== "" && !TIME_RE.test(openingTime)) {
        invalidFields.push("openingTime");
    }
    if (closingTime !== "" && !TIME_RE.test(closingTime)) {
        invalidFields.push("closingTime");
    }
    // Auto-close minutes: a whole number of minutes, 5–240. Blank means
    // the 30-minute default.
    const servedAutoCloseMinutes =
        servedAutoCloseMinutesRaw === ""
            ? 30
            : Number(servedAutoCloseMinutesRaw);
    if (
        !Number.isInteger(servedAutoCloseMinutes) ||
        servedAutoCloseMinutes < 5 ||
        servedAutoCloseMinutes > 240
    ) {
        invalidFields.push("servedAutoCloseMinutes");
    }

    if (invalidFields.length > 0) {
        return {
            success: false,
            message: "Please check the highlighted fields.",
            invalidFields,
        };
    }

    try {
        // The restaurant is looked up from the signed-in user's session —
        // never from the form — so an owner can only ever edit their own
        // restaurant. The slug is deliberately left untouched: it is in
        // the guest QR URL and printed QR codes must keep working even
        // when the restaurant is renamed.
        await prisma.restaurant.update({
            where: { id: user.restaurantId },
            data: {
                name,
                city,
                address,
                phone,
                openingTime: openingTime === "" ? null : openingTime,
                closingTime: closingTime === "" ? null : closingTime,
                servedAutoCloseMinutes,
            },
        });

        return {
            success: true,
            message: "Settings saved.",
        };
    } catch (error) {
        console.error("Restaurant settings error:", error);

        return {
            success: false,
            message: "Something went wrong. Please try again.",
        };
    }
}
