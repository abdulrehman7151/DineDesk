import { headers } from "next/headers";
import HomePage from "@/components/HomePageClient";
import { getPriceTier } from "@/lib/payments/paddle";

// Server wrapper around the (client) homepage. It reads the visitor's
// country from Vercel's `x-vercel-ip-country` header so the pricing
// section shows the price in the visitor's currency: Rs 2,499 in Pakistan,
// $39 everywhere else. All charges are in USD.
export default async function Home() {
    const tier = getPriceTier((await headers()).get("x-vercel-ip-country"));
    return (
        <HomePage
            priceCurrency={tier.displayCurrency}
            priceAmount={tier.displayAmount}
            priceNote={tier.displayNote}
        />
    );
}
