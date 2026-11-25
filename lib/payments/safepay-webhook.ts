import { createHmac, timingSafeEqual } from "crypto";

export function verifySafepayWebhookSignature(
    rawBody: string,
    signature: string | null,
    secret: string
) {
    if (!signature || !secret || !/^[a-f\d]{128}$/i.test(signature)) {
        return false;
    }

    const received = Buffer.from(signature, "hex");
    const rawSignature = createHmac("sha512", secret)
        .update(rawBody)
        .digest();

    if (timingSafeEqual(rawSignature, received)) {
        return true;
    }

    try {
        const compactBody = JSON.stringify(JSON.parse(rawBody));
        if (compactBody === rawBody) {
            return false;
        }

        const compactSignature = createHmac("sha512", secret)
            .update(compactBody)
            .digest();

        return timingSafeEqual(compactSignature, received);
    } catch {
        return false;
    }
}
