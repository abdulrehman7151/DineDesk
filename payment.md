# Safepay subscription payments

This project uses Safepay's hosted subscription checkout. Card details are
entered on Safepay, not stored by DineDesk. A browser redirect is not proof of
payment: a verified Safepay webhook updates the subscription and payment rows.

## Files and why they exist

### Added

- `app/admin/subscription/page.tsx` shows the Basic plan and current subscription
  status to an authenticated restaurant admin.
- `app/admin/subscription/SubscriptionCheckoutButton.tsx` starts checkout from
  the admin page and sends the customer to Safepay's hosted page.
- `app/admin/subscription/CancelPendingCheckoutButton.tsx` lets an admin clear
  an abandoned local checkout after confirming Safepay was closed without
  payment.
- `app/api/webhooks/safepay/route.ts` receives Safepay events, validates their
  signature, ignores duplicate event IDs, checks the amount/currency against the
  stored plan, and updates payment/subscription records in one database
  transaction.
- `app/subscription/success/page.tsx` and `app/subscription/cancel/page.tsx`
  show safe return messages. The success page does not activate a subscription;
  activation comes only from the verified webhook.
- `lib/payments/safepay-webhook.ts` checks Safepay's HMAC-SHA512 signature using
  a constant-time comparison.
- `tests/safepay-webhook.test.ts` tests valid raw-body and compact-JSON
  signatures and invalid signatures.
- `payment.md` documents the payment flow and setup.

### Updated

- `lib/payments/safepay.ts` creates the Safepay passport token and builds the
  documented `/checkout/subscribe` URL using server-only credentials and
  configured return URLs.
- `services/Subscriptionservices.ts` reads the plan from the database, creates
  a pending subscription/payment, and starts checkout. If Safepay checkout
  creation fails, those records are marked failed/cancelled.
- `actions/subscription.ts` requires an admin session before starting checkout.
- `actions/subscription.ts` also scopes abandonment of a pending checkout to
  that admin's restaurant and updates its pending payment in a transaction.
- `app/admin/page.tsx` links admins to the subscription page.

The existing Prisma models and migrations already provide the subscription,
payment, provider-reference, and webhook-event fields used here.

## Configure Safepay

Set these server-side environment variables (never prefix secret values with
`NEXT_PUBLIC_`):

```env
SAFEPAY_ENV=sandbox
SAFEPAY_SECRET_KEY=your_safepay_merchant_secret
SAFEPAY_WEBHOOK_SECRET=your_safepay_endpoint_shared_secret
SAFEPAY_PLAN_BASIC_ID=your_safepay_plan_id
APP_URL=https://your-public-https-domain.example
```

`SAFEPAY_SECRET_KEY` and `SAFEPAY_WEBHOOK_SECRET` are different Safepay secrets.
Use sandbox credentials while testing. Set `SAFEPAY_ENV=production` only when
you have switched to live credentials and a production HTTPS domain.

In the Safepay dashboard, create a webhook endpoint at:

```text
https://your-public-https-domain.example/api/webhooks/safepay
```

Enable the subscription and payment events needed by the account, then copy the
endpoint's shared secret into `SAFEPAY_WEBHOOK_SECRET`. Safepay signs events in
the `X-SFPY-SIGNATURE` header. The webhook route acknowledges an event only
after its database transaction succeeds.

## Set up the Basic plan

1. Create a recurring plan in Safepay and copy its plan ID.
2. Set `SAFEPAY_PLAN_BASIC_ID` to that ID.
3. Apply the existing database migrations with `npx prisma migrate deploy`.
4. Create the local plan record with `npx tsx insert-plan.ts`.

The current plan seed uses `150000` paisas, which is PKR 1,500.00. Change the
seeded price only to the same amount configured in Safepay; the webhook rejects
payments whose amount or currency does not match the database plan.

## Test checklist

1. Use a public HTTPS tunnel for local webhook testing and set `APP_URL` to that
   HTTPS URL; Safepay cannot call a local-only address.
2. Start the app and open `/admin/subscription` as an admin.
3. Complete a sandbox payment and confirm the webhook appears in Safepay's
   delivery history with an HTTP 200 response.
4. Confirm the matching `Payment` is `SUCCEEDED` and `Subscription` is `ACTIVE`.
5. Send the same webhook again; the unique event ID prevents applying it twice.
6. Confirm a browser return without a valid webhook does not activate a plan.

This implementation stores only the Safepay event fields needed for
reconciliation and handles initial checkout, payment failure, subscription
cancellation/end/resume, and provider renewal-success events when Safepay
includes the linked `reference` and payment fields. Refunds, customer
self-service cancellation, and a billing-history UI are not included.
