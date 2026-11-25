
import "server-only";

const environments = {
    production: {
        api: "https://api.getsafepay.com",
        checkout: "https://getsafepay.com",
    },
    sandbox: {
        api: "https://sandbox.api.getsafepay.com",
        checkout: "https://sandbox.api.getsafepay.com",
    },
} as const;

export async function createSafepaySubscriptionCheckout(
    reference: string,
    planId: string
) {
    const environment = process.env.SAFEPAY_ENV || "sandbox";
    const secretKey = process.env.SAFEPAY_SECRET_KEY;
    const appUrl = process.env.APP_URL;
    const hosts =
        environment === "production" || environment === "sandbox"
            ? environments[environment]
            : null;

    if (!secretKey || !appUrl || !hosts) {
        throw new Error("Safepay is not configured correctly.");
    }

    if (!reference.trim() || !planId.trim()) {
        throw new Error("Subscription reference is required");
    }

    const appUrlObject = new URL(appUrl);
    if (
        appUrlObject.protocol !== "https:" &&
        !(environment === "sandbox" && appUrlObject.hostname === "localhost")
    ) {
        throw new Error("APP_URL must use HTTPS outside local sandbox development.");
    }

    const authResponse = await fetch(`${hosts.api}/client/passport/v1/token`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-SFPY-MERCHANT-SECRET": secretKey,
        },
        body: JSON.stringify({}),
        cache: "no-store",
        signal: AbortSignal.timeout(15000),
    });

    const authData = await authResponse.json();

    if (!authResponse.ok || !authData?.data) {
        throw new Error(
            authData?.message || "Safepay authentication failed"
        );
    }

    if (typeof authData.data !== "string") {
        throw new Error("Safepay returned an invalid authentication token.");
    }

    const authToken = authData.data;
    const params = new URLSearchParams({
        plan_id: planId,
        auth_token: authToken,
        env: environment,
        reference,
        redirect_url: new URL("/subscription/success", appUrlObject).toString(),
        cancel_url: new URL("/subscription/cancel", appUrlObject).toString(),
    });

    const checkoutUrl = `${hosts.checkout}/checkout/subscribe?${params.toString()}`;

    return {
        reference,
        checkoutUrl,
    };
}
