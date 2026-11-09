
import Safepay from "@sfpy/node-core";

const environment = process.env.SAFEPAY_ENV || "sandbox";

const host = environment === "production"
    ? "https://api.getsafepay.com"
    : "https://sandbox.api.getsafepay.com";

export async function createSafepayCheckout(amount: number) {
    const secretKey = process.env.SAFEPAY_SECRET_KEY;
    const apiKey = process.env.SAFEPAY_API_KEY;
    const appUrl = process.env.APP_URL;

    if (!secretKey || !apiKey || !appUrl) {
        throw new Error("Missing Safepay environment variables");
    }

    const safepay = new Safepay(secretKey, {
        authType: "secret",
        host,
    });

    // 1. Create payment tracker
    const session = await safepay.payments.session.setup({
        merchant_api_key: apiKey,
        intent: "CYBERSOURCE",
        mode: "payment",
        entry_mode: "raw",
        currency: "PKR",
        amount,
        include_fees: false,
    });

    const tracker = session.data.tracker.token;

    // 2. Generate authentication token
    const authResponse = await fetch(
        `${host}/client/passport/v1/token`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-SFPY-MERCHANT-SECRET": secretKey,
            },
            body: JSON.stringify({}),
            cache: "no-store",
        }
    );

    const authData = await authResponse.json();

    if (!authResponse.ok) {
        throw new Error(
            authData?.message || "Safepay authentication failed"
        );
    }

    const authToken = authData.data;

    // 3. Generate checkout URL
    const checkoutUrl = safepay.checkout.createCheckoutUrl({
        tracker,
        tbt: authToken,
        env: environment as "sandbox" | "production",
        source: "hosted",
        redirect_url: `${appUrl}/payment/success`,
        cancel_url: `${appUrl}/payment/cancel`,
    });

    return {
        tracker,
        checkoutUrl,
    };
}
