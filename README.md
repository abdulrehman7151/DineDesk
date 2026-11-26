# DineDesk

Restaurant management: QR-code table ordering, digital menu, admin dashboard,
kitchen display, and staff management. Built with Next.js, Prisma, and
MariaDB/MySQL (TiDB-compatible).

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Subscription billing (SafePay)

Restaurants subscribe to one plan — **DineDesk Basic, Rs 1,500/month** — paid
through SafePay's hosted subscription checkout. Card details are only ever
entered on SafePay's checkout page, never in this app.

### How it works

1. An admin opens **Subscription** in the admin panel and clicks
   **Subscribe with Safepay**.
2. The server creates a `PENDING` subscription (with a random reference) and
   redirects the admin to SafePay's hosted checkout.
3. SafePay redirects back to `/subscription/success` (or
   `/subscription/cancel`). The success page is **not** proof of payment.
4. SafePay sends a webhook to `/api/webhooks/safepay`. Only the webhook
   marks the subscription `ACTIVE` (and records the payment). Webhook
   signatures are verified, events are stored in `WebhookEvent`, and
   duplicate deliveries are ignored.

### Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Yes | MariaDB/MySQL connection string used by Prisma. |
| `JWT_SECRET` | Yes | Secret for the admin sign-in tokens. |
| `SAFEPAY_ENV` | Yes | `sandbox` or `production`. |
| `SAFEPAY_SECRET_KEY` | Yes | SafePay merchant secret key. Also used as the webhook secret fallback. |
| `SAFEPAY_PLAN_ID` | Yes | SafePay plan id for the monthly plan. Used only by the seed script. |
| `SAFEPAY_WEBHOOK_SECRET` | No | Dedicated webhook signing secret. When unset, `SAFEPAY_SECRET_KEY` is used. |
| `APP_URL` | Yes | Canonical app origin, e.g. `https://dinedesk-omega.vercel.app`. Used to build SafePay redirect URLs. Must be HTTPS outside local sandbox development. |
| `RESEND_API_KEY` | For password reset | API key for the Resend account that sends email. |
| `EMAIL_FROM` | For password reset | Verified sender address, e.g. `DineDesk <no-reply@example.com>`. |
| `NEXT_PUBLIC_APP_URL` | For password reset | Canonical app origin for reset links. |

Never commit real keys. Set them in Vercel (Project → Settings →
Environment Variables) for production, and in `.env` locally.

### First-time setup (production database)

```bash
# 1. Apply the migrations (the Vercel build only runs `prisma generate`,
#    it does NOT apply migrations).
npx prisma migrate deploy

# 2. Create the Basic plan row the checkout needs.
#    SAFEPAY_PLAN_ID must be set (create the monthly plan in the SafePay
#    merchant dashboard first, then copy its plan id).
npx prisma db seed
```

### SafePay dashboard setup

1. Create a monthly subscription plan (Rs 1,500, PKR) and copy its plan id
   into `SAFEPAY_PLAN_ID`.
2. Register the webhook endpoint `https://<your-domain>/api/webhooks/safepay`
   and subscribe it to the subscription events: `subscription.created`,
   `subscription.updated`, `subscription.canceled`, `subscription.unpaid`,
   `subscription.ended`, `subscription.paused`, `subscription.resumed`,
   `subscription.payment.succeeded`, `subscription.payment.failed`.
3. Copy the webhook signing secret into `SAFEPAY_WEBHOOK_SECRET`
   (or leave it unset to use `SAFEPAY_SECRET_KEY`).

### Sandbox testing

1. Set `SAFEPAY_ENV=sandbox` with sandbox keys and a sandbox plan id.
2. Run the migrate + seed steps above against a test database.
3. Subscribe from the admin panel and complete checkout with a SafePay
   sandbox test card.
4. Check the admin **Subscription** page: status should become `ACTIVE`
   only after the webhook arrives. The `/subscription/success` page says
   "Payment received for verification" until then — that is expected.
5. In the SafePay sandbox dashboard, cancel the subscription and confirm
   the admin page flips to `CANCELLED`.
6. Test a failed renewal with a failing test card: the subscription should
   flip to `PAST_DUE` and the admin can subscribe again.

### Webhook event handling

| SafePay event | Effect |
| --- | --- |
| `subscription.created` | Links the SafePay subscription id to our pending subscription; stores the billing period. |
| `subscription.updated` | Syncs status and billing period from SafePay. |
| `subscription.payment.succeeded` / `payment.succeeded` | Records the payment (amount must match the plan price and currency) and marks the subscription `ACTIVE`. |
| `subscription.payment.failed` / `subscription.unpaid` | Marks the subscription `PAST_DUE` and the pending payment `FAILED`. |
| `subscription.canceled` | Marks the subscription `CANCELLED`. |
| `subscription.ended` | Marks the subscription `EXPIRED`. |
| `subscription.resumed` | Marks the subscription `ACTIVE` again. |
| `subscription.paused` | Recorded, but the status is left unchanged (there is no `PAUSED` status in the schema). |
| Anything else | Recorded and ignored; the endpoint still returns 200. |

## Subscription billing (Paddle)

Restaurants subscribe to one plan — **DineDesk Basic, Rs 1,500/month** —
paid through Paddle's overlay checkout (USD 5.00/month for international
cards). Card details are only ever entered in Paddle's secure checkout,
never in this app. The SafePay sandbox flow is still in the code, but the
Subscribe button now uses Paddle.

### How it works

1. An admin opens **Subscription** in the admin panel and clicks
   **Subscribe with Paddle**.
2. The server creates a `PENDING` subscription (with a random reference)
   and the browser opens the Paddle checkout overlay for the DineDesk
   Basic price (`pri_01m8cq9pqm4t83zgp9s5psmdnn`), passing the reference
   as custom data.
3. Paddle redirects back to `/subscription/success?reference=...` after
   payment. The success page is **not** proof of payment.
4. Paddle sends a webhook to `/api/webhooks/paddle`. Only the webhook
   marks the subscription `ACTIVE` (and records the payment). Webhook
   signatures are verified, events are stored in `WebhookEvent`, and
   duplicate deliveries are ignored.

### Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `PADDLE_API_KEY` | For API use | Paddle live API key (server only, never in the browser). |
| `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN` | Yes | Paddle live client-side token used by Paddle.js in the browser. |
| `PADDLE_WEBHOOK_SECRET` | Yes | Signing secret of the Paddle notification destination. No fallback — the webhook returns 503 without it. |

### First-time setup (production database)

```bash
# 1. Apply the migrations (the Vercel build only runs `prisma generate`,
#    it does NOT apply migrations). This adds the Paddle provider id
#    columns (paddleSubscriptionId / paddleTransactionId).
npx prisma migrate deploy
```

### Paddle dashboard setup

1. Create the product **DineDesk Basic** with a monthly price of USD 5.00
   (price id `pri_01m8cq9pqm4t83zgp9s5psmdnn`) and copy the live API key
   and client-side token into `PADDLE_API_KEY` and
   `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN`.
2. Get the domain approved (Checkout → Checkout settings), then set the
   default payment link — Paddle.js will not open a checkout without one.
3. Register the webhook endpoint
   `https://<your-domain>/api/webhooks/paddle` (Developer Tools →
   Notifications) and subscribe it to: `subscription.created`,
   `subscription.activated`, `subscription.updated`,
   `subscription.canceled`, `subscription.past_due`,
   `subscription.resumed`, `transaction.completed`,
   `transaction.payment_failed`, `transaction.past_due`.
4. Copy the notification destination's secret key into
   `PADDLE_WEBHOOK_SECRET` in Vercel (Production).

### Live testing

1. Set the Paddle account to live, with the live keys and price above.
2. Run the migrate step above against the production database.
3. Subscribe from the admin panel and complete checkout with a real card.
4. Check the admin **Subscription** page: status should become `ACTIVE`
   only after the webhook arrives. The `/subscription/success` page says
   "Payment received for verification" until then — that is expected.
5. In the Paddle dashboard, cancel the subscription and confirm the
   admin page flips to `CANCELLED`.

### Webhook event handling

| Paddle event | Effect |
| --- | --- |
| `subscription.created` | Links the Paddle subscription id to our pending subscription; stores the billing period. |
| `subscription.activated` / `subscription.resumed` | Marks the subscription `ACTIVE`. |
| `subscription.updated` | Syncs status and billing period from Paddle. |
| `transaction.completed` | Records the payment (USD, at least the $5.00 list price, for our price id) and marks the subscription `ACTIVE`. |
| `transaction.payment_failed` / `transaction.past_due` (renewals) | Marks the subscription `PAST_DUE` and the pending payment `FAILED`. |
| `subscription.canceled` | Marks the subscription `CANCELLED`. |
| `subscription.past_due` | Marks the subscription `PAST_DUE`. |
| `subscription.paused` | Recorded, but the status is left unchanged (there is no `PAUSED` status in the schema). |
| Anything else | Recorded and ignored; the endpoint still returns 200. |

## Password reset email

Configure these server environment variables to enable password reset emails:

- `RESEND_API_KEY` — API key for the Resend account that sends email.
- `EMAIL_FROM` — verified sender address, for example `DineDesk <no-reply@example.com>`.
- `NEXT_PUBLIC_APP_URL` — canonical app origin for reset links, such as `http://localhost:3000` in development or your HTTPS production URL.

Reset links expire after 15 minutes and can only be used once.
