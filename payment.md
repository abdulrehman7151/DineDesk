# Paddle subscription payments

This project uses Paddle Billing for subscriptions. Card details are entered
only in Paddle's secure checkout, never stored by DineDesk. A browser return
is not proof of payment: a verified Paddle webhook updates the subscription
and payment rows.

## Prices

The plan is sold in US dollars, with the price depending on the visitor's
country (see `lib/payments/paddle.ts`):

- Pakistan: USD 9.00/month, shown as "Rs 2,499/month".
- United States: USD 39.00/month, shown as "$39/month".
- Everywhere else: USD 25.00/month, shown as "$25/month".

Paddle shows the amount in the customer's local currency at checkout.
Paddle does not support PKR as a billing currency, so the Pakistan tier is
a USD price, displayed in rupees.

## Files and why they exist

- `app/admin/subscription/page.tsx` shows the Basic plan and current
  subscription status to an authenticated restaurant admin, with the
  visitor's geo price.
- `components/PaddleCheckoutButton.tsx` opens the Paddle.js overlay
  checkout from the admin page. It first calls
  `startPaddleSubscriptionCheckout`, which creates the local PENDING
  subscription/payment and returns the reference passed to Paddle as
  custom data.
- `services/PaddleSubscriptionservices.ts` reads the plan from the
  database and creates the pending subscription/payment. A checkout
  started in the last day blocks a new one; an older abandoned checkout
  does not.
- `app/api/webhooks/paddle/route.ts` receives Paddle events, validates
  their signature, ignores duplicate event IDs, checks the amount and
  currency against the known price tiers, and updates payment and
  subscription records in one database transaction.
- `app/subscription/success/page.tsx` and `app/subscription/cancel/page.tsx`
  show safe return messages. The success page does not activate a
  subscription; activation comes only from the verified webhook.
- `lib/payments/paddle-webhook.ts` checks Paddle's HMAC-SHA256 signature
  using a constant-time comparison.
- `lib/payments/paddle.ts` holds the Paddle product and price ids and the
  geo pricing (Pakistan / USA / everywhere else).
- `actions/subscription.ts` requires an admin session before starting
  checkout.

## Configure Paddle

Set these server-side environment variables (never prefix secret values
with `NEXT_PUBLIC_`):

```env
PADDLE_API_KEY=your_paddle_api_key
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=your_paddle_client_side_token
PADDLE_WEBHOOK_SECRET=your_paddle_notification_destination_secret
```

In the Paddle dashboard (Developer Tools > Notifications), create a
notification destination at:

```text
https://your-public-https-domain.example/api/webhooks/paddle
```

Subscribe it to the subscription and transaction events the app handles,
then copy the destination's secret into `PADDLE_WEBHOOK_SECRET`.

## Test checklist

1. Use a public HTTPS tunnel for local webhook testing and set `APP_URL` to
   that HTTPS URL; Paddle cannot call a local-only address.
2. Start the app and open `/admin/subscription` as an admin.
3. Complete a payment and confirm the webhook appears in Paddle's delivery
   history with an HTTP 200 response.
4. Confirm the matching `Payment` is `SUCCEEDED` and `Subscription` is
   `ACTIVE`.
5. Send the same webhook again; the unique event ID prevents applying it
   twice.
6. Confirm a browser return without a valid webhook does not activate a
   plan.
