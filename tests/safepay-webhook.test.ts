import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";
import { verifySafepayWebhookSignature } from "../lib/payments/safepay-webhook";

const secret = "test-webhook-secret";

function sign(payload: string) {
    return createHmac("sha512", secret).update(payload).digest("hex");
}

test("accepts a signature over the exact raw body", () => {
    const body = '{ "type": "payment.succeeded", "data": {} }';

    assert.equal(verifySafepayWebhookSignature(body, sign(body), secret), true);
});

test("accepts Safepay's compact JSON signature format", () => {
    const body = '{ "type": "payment.succeeded", "data": {} }';

    assert.equal(
        verifySafepayWebhookSignature(
            body,
            sign('{"type":"payment.succeeded","data":{}}'),
            secret
        ),
        true
    );
});

test("rejects malformed or invalid signatures", () => {
    const body = '{"type":"payment.succeeded","data":{}}';

    assert.equal(verifySafepayWebhookSignature(body, null, secret), false);
    assert.equal(verifySafepayWebhookSignature(body, "invalid", secret), false);
    assert.equal(
        verifySafepayWebhookSignature(body, sign(body), "different-secret"),
        false
    );
});
