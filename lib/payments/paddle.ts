import "server-only";

// Paddle catalog ids for the DineDesk Basic plan.
//
// The plan is sold in US dollars, but the price a visitor sees depends on
// where they are:
// - Pakistan: USD 9.00/month, shown as "Rs 2,499/month".
// - United States: USD 39.00/month, shown as "$39/month".
// - Everywhere else: USD 25.00/month, shown as "$25/month".
// Paddle shows the amount in the customer's local currency at checkout.
// Paddle does not support PKR as a billing currency, so there is no PKR
// price in the catalog — the Pakistan tier is a USD price, displayed in
// rupees. The old USD 5.00 price (pri_01m8cq9pqm4t83zgp9s5psmdnn) is no
// longer sold. These are Paddle catalog ids, not secrets, and are safe to
// expose to the browser — the client checkout button receives the price id
// as a prop from the subscription page.
//
// Sandbox: each price id below can be overridden with an environment
// variable (NEXT_PUBLIC_PADDLE_PRICE_PAKISTAN,
// NEXT_PUBLIC_PADDLE_PRICE_UNITED_STATES,
// NEXT_PUBLIC_PADDLE_PRICE_INTERNATIONAL), set on the Preview environment
// in Vercel, so a preview deployment can point at the Paddle sandbox
// catalog while production keeps the live ids below. Without those
// variables the live ids are used.
export const PADDLE_PRODUCT_ID = "pro_01m8cq886aepj07e7p5jtb8abk";

export type PriceTierKey = "pakistan" | "unitedStates" | "international";

export type PriceTier = {
    key: PriceTierKey;
    paddlePriceId: string;
    // What Paddle charges for one month, in the smallest currency unit
    // (USD cents). Paddle reports transaction totals in minor units
    // (a $9.00 payment arrives as 900). The webhook only activates a
    // subscription when the payment is at least this much — tax can push
    // the charged total above the list price, but never below it.
    amountMinor: number;
    currency: "USD";
    // What the visitor sees on the site.
    displayCurrency: string;
    displayAmount: string;
    // Short note shown under the price, explaining the charge currency.
    displayNote: string;
};

// A Paddle price id for one tier: the environment override wins when set
// (a Preview deployment pointed at the sandbox catalog), otherwise the
// live catalog id.
function envPriceId(envName: string, liveId: string): string {
    const override = process.env[envName];
    return override && override.length > 0 ? override : liveId;
}

export const PRICE_TIERS: Record<PriceTierKey, PriceTier> = {
    pakistan: {
        key: "pakistan",
        paddlePriceId: envPriceId(
            "NEXT_PUBLIC_PADDLE_PRICE_PAKISTAN",
            "pri_01m8cw8va4mh23w73kvmwabvxp"
        ),
        amountMinor: 900,
        currency: "USD",
        displayCurrency: "Rs",
        displayAmount: "2,499",
        displayNote: "Charged as USD 9.00/month",
    },
    unitedStates: {
        key: "unitedStates",
        paddlePriceId: envPriceId(
            "NEXT_PUBLIC_PADDLE_PRICE_UNITED_STATES",
            "pri_01m8cvygz883bdv0nzees2r69g"
        ),
        amountMinor: 3900,
        currency: "USD",
        displayCurrency: "$",
        displayAmount: "39",
        displayNote:
            "Charged in USD — Paddle shows the amount in your local currency at checkout.",
    },
    international: {
        key: "international",
        paddlePriceId: envPriceId(
            "NEXT_PUBLIC_PADDLE_PRICE_INTERNATIONAL",
            "pri_01m8cvyx049w3vrms5axtknfjq"
        ),
        amountMinor: 2500,
        currency: "USD",
        displayCurrency: "$",
        displayAmount: "25",
        displayNote:
            "Charged in USD — Paddle shows the amount in your local currency at checkout.",
    },
};

// Vercel sends the visitor's country as the `x-vercel-ip-country` header.
// Pakistan gets the local tier, the USA gets the US tier, and every other
// country gets the international tier. An absent header (e.g. local
// development) falls back to the international tier.
export function getPriceTier(country: string | null | undefined): PriceTier {
    const code = country?.toUpperCase();
    if (code === "PK") return PRICE_TIERS.pakistan;
    if (code === "US") return PRICE_TIERS.unitedStates;
    return PRICE_TIERS.international;
}

export function getPriceTierByPriceId(priceId: string): PriceTier | null {
    return (
        Object.values(PRICE_TIERS).find(
            (tier) => tier.paddlePriceId === priceId
        ) ?? null
    );
}
