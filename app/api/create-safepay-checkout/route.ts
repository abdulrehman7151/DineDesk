
import { NextResponse } from "next/server";
import { createSafepayCheckout } from "@/lib/payments/safepay";

export async function POST() {
    try {
        // Rs. 100 = 10,000 paisa
        const { tracker, checkoutUrl } =
            await createSafepayCheckout(10000);

        return NextResponse.json({
            success: true,
            tracker,
            checkoutUrl,
        });

    } catch (error) {
        console.error("Safepay Checkout Error:", error);

        return NextResponse.json(
            {
                success: false,
                message:
                    error instanceof Error
                        ? error.message
                        : "Checkout creation failed",
            },
            { status: 500 }
        );
    }
}
