import { createHmac, timingSafeEqual } from "crypto";

// Verify a Paddle Billing webhook signature.
//
// Paddle sends a `Paddle-Signature` header like
// `ts=1671552777;h1=<hex hmac>`. The signed payload is
// `<ts>:<raw request body>`, HMAC-SHA256 with the secret key of the
// notification destination. See
// https://developer.paddle.com/webhooks/about/signature-verification/
export function verifyPaddleWebhookSignature(
    rawBody: string,
    signatureHeader: string | null,
    secret: string
): boolean {
    if (!signatureHeader || !secret) {
        return false;
    }

    const parts: Record<string, string> = {};
    for (const part of signatureHeader.split(";")) {
        const [key, value] = part.split("=");
        if (key && value) {
            parts[key] = value;
        }
    }

    const timestamp = parts["ts"];
    const receivedHex = parts["h1"];
    if (!timestamp || !receivedHex || !/^[a-f\d]+$/i.test(receivedHex)) {
        return false;
    }

    const expected = createHmac("sha256", secret)
        .update(`${timestamp}:${rawBody}`)
        .digest();

    let received: Buffer;
    try {
        received = Buffer.from(receivedHex, "hex");
    } catch {
        return false;
    }

    return (
        received.length === expected.length &&
        timingSafeEqual(expected, received)
    );
}
