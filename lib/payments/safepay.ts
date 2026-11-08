
import "server-only";

const SAFEPAY_TOKEN_URL = "https://sandbox.api.getsafepay.com/client/passport/v1/token";

type SafepayTokenResponse = {
    data?: string;
    status?: {
        message?: string;
        errors?: unknown[];
    };
};

export async function getSafepayAuthToken(): Promise<string> {
    const secretKey = process.env.SAFEPAY_SECRET_KEY;

    if (!secretKey) {
        throw new Error("SAFEPAY_SECRET_KEY is missing");
    }

    const response = await fetch(SAFEPAY_TOKEN_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-SFPY-MERCHANT-SECRET": secretKey,
        },
        body: JSON.stringify({}),
        cache: "no-store",
    });

    const result = (await response.json()) as SafepayTokenResponse;

    if (!response.ok) {
        throw new Error(
            `Safepay authentication failed: ${response.status} - ${JSON.stringify(result)}`
        );
    }

    if (!result.data) {
        throw new Error("Safepay did not return an authentication token");
    }

    return result.data;
}
