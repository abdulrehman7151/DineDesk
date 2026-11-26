# DineDesk

Restaurant management for cafés and restaurants. Guests scan the QR code on
their table, browse a digital menu and order from their phone. Orders go
straight to a live kitchen display, and staff run everything — menu, tables,
orders, sales, analytics and staff — from one admin dashboard.

**Live:** https://dinedesk-omega.vercel.app

## How it works

1. A guest scans the QR code on their table and opens the restaurant's
   digital menu — no app to install.
2. They browse categories, pick items and sizes, and send the order from
   their phone. They can follow the order's status live.
3. The order appears on the kitchen display (New → Preparing → Ready), and
   staff update its status as it moves through the kitchen.
4. Admins manage the menu, prices and photos, tables, orders, sales,
   analytics and staff from the dashboard.

## Features

- **QR table ordering** — every table has its own QR code. The guest menu
  link is also shown as text and can be copied and shared.
- **Digital menu** — categories, prices, item sizes and photos (images are
  hosted on Cloudinary).
- **Live kitchen display** — incoming orders arrive in one queue with
  New / Preparing / Ready status.
- **Guest order tracking** — guests see their order's live status on their
  phone.
- **Admin dashboard** — menu, tables, orders, sales, analytics and staff
  management, with reporting in Pakistan time (Asia/Karachi).
- **Table management** — tables show as Available / Occupied / Reserved and
  update automatically when orders are placed and served.
- **Notifications** — the admin is alerted to new and preparing orders.
- **Staff accounts** — role-based access for admins and kitchen staff.
- **Password reset by email.**

## Pricing

One plan — **DineDesk Basic**:

| Customers | Price |
| --- | --- |
| Pakistan | Rs 1,500 / month |
| International | USD 5.00 / month |

Payments are handled by **Paddle** (merchant of record). Card details are
only ever entered in Paddle's secure checkout, never in this app. An older
SafePay sandbox integration still exists in the code (see
[Subscription billing](#subscription-billing) below), but production billing
is Paddle.

## Tech stack

- Next.js 16.3.6 (App Router), React 19
- Prisma 7 with MariaDB (TiDB-compatible)
- Tailwind CSS 4, TypeScript
- Cloudinary for menu item images
- Paddle for production billing; SafePay for sandbox billing

## Getting started

```bash
git clone https://github.com/abdulrehman7151/DineDesk.git
cd DineDesk
npm install
```

Create a `.env` file with the variables listed below, then:

```bash
# Apply the database migrations
npx prisma migrate deploy

# Create the DineDesk Basic plan row (needs SAFEPAY_PLAN_ID set)
npx prisma db seed

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

Never commit real keys. Set them in Vercel (Project → Settings →
Environment Variables) for production, and in `.env` locally.

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Yes | MariaDB/MySQL connection string used by Prisma. |
| `JWT_SECRET` | Yes | Secret for the admin sign-in tokens. |
| `APP_URL` | Yes | Canonical app origin, e.g. `https://dinedesk-omega.vercel.app`. Used to build payment redirect URLs. Must be HTTPS outside local development. |
| `PADDLE_API_KEY` | For API use | Paddle live API key (server only, never in the browser). |
| `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN` | Yes | Paddle live client-side token used by Paddle.js in the browser. |
| `PADDLE_WEBHOOK_SECRET` | Yes | Signing secret of the Paddle notification destination. No fallback — the webhook returns 503 without it. |
| `SAFEPAY_ENV` | Yes | `sandbox` or `production`. |
| `SAFEPAY_SECRET_KEY` | Yes | SafePay merchant secret key. Also used as the webhook secret fallback. |
| `SAFEPAY_PLAN_ID` | Yes | SafePay plan id for the monthly plan. Used only by the seed script. |
| `SAFEPAY_WEBHOOK_SECRET` | No | Dedicated webhook signing secret. When unset, `SAFEPAY_SECRET_KEY` is used. |
| `RESEND_API_KEY` | For password reset | API key for the Resend account that sends email. |
| `EMAIL_FROM` | For password reset | Verified sender address, e.g. `DineDesk <no-reply@example.com>`. |
| `NEXT_PUBLIC_APP_URL` | For password reset | Canonical app origin for reset links. |

## Deployment

Deployed on Vercel — project `dinedesk`, production domain
https://dinedesk-omega.vercel.app. Environment variables are set in Vercel
(Production scope).

Note: the Vercel build runs `prisma generate && next build`. It does **not**
apply migrations — run `npx prisma migrate deploy` against the production
database yourself after pulling new migrations.

## Project structure

```text
app/         Next.js App Router pages — public homepage, sign-in/sign-up,
             admin dashboard, kitchen display, guest ordering
             (/r/[restaurantSlug]), subscription pages and API routes
             (including webhooks)
actions/     Server actions — orders, menu, staff, tables, auth, subscriptions
services/    Business logic — orders, menu, tables, staff, subscriptions
lib/         Prisma client, auth/JWT, payments (lib/payments/paddle.ts,
             lib/payments/safepay.ts), Cloudinary, mailer
components/  Shared React components — table QR codes, checkout buttons,
             notifications, order tracking
prisma/      Database schema, migrations and seed script
public/      Static assets
```

## Subscription billing

Restaurants subscribe to one plan — **DineDesk Basic**. The subscription
lives in the database (`Subscription` / `Payment` / `WebhookEvent` models)
and is only ever marked `ACTIVE` by a payment webhook — never from the
checkout redirect page.

### Paddle (production)

Restaurants pay through Paddle's overlay checkout: Rs 1,500/month in
Pakistan, USD 5.00/month for international cards (product
`pro_01m8cq886aepj07e7p5jtb8abk`, price
`pri_01m8cq9pqm4t83zgp9s5psmdnn`).

#### How it works

1. An admin opens **Subscription** in the admin panel and clicks
   **Subscribe with Paddle**.
2. The server creates a `PENDING` subscription (with a random reference)
   and the browser opens the Paddle checkout overlay for the DineDesk
   Basic price, passing the reference as custom data.
3. Paddle redirects back to `/subscription/success?reference=...` after
   payment. The success page is **not** proof of payment.
4. Paddle sends a webhook to `/api/webhooks/paddle`. Only the webhook
   marks the subscription `ACTIVE` (and records the payment). Webhook
   signatures are verified, events are stored in `WebhookEvent`, and
   duplicate deliveries are ignored.

#### Paddle dashboard setup

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

#### Webhook event handling

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

#### Live testing

1. Set the Paddle account to live, with the live keys and price above.
2. Run the migrate step above against the production database.
3. Subscribe from the admin panel and complete checkout with a real card.
4. Check the admin **Subscription** page: status should become `ACTIVE`
   only after the webhook arrives. The `/subscription/success` page says
   "Payment received for verification" until then — that is expected.
5. In the Paddle dashboard, cancel the subscription and confirm the
   admin page flips to `CANCELLED`.

### SafePay (sandbox)

The SafePay integration is kept in the code for sandbox testing. Production
billing is Paddle; SafePay production is not set up.

#### How it works

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

#### SafePay dashboard setup

1. Create a monthly subscription plan (Rs 1,500, PKR) and copy its plan id
   into `SAFEPAY_PLAN_ID`.
2. Register the webhook endpoint `https://<your-domain>/api/webhooks/safepay`
   and subscribe it to the subscription events: `subscription.created`,
   `subscription.updated`, `subscription.canceled`, `subscription.unpaid`,
   `subscription.ended`, `subscription.paused`, `subscription.resumed`,
   `subscription.payment.succeeded`, `subscription.payment.failed`.
3. Copy the webhook signing secret into `SAFEPAY_WEBHOOK_SECRET`
   (or leave it unset to use `SAFEPAY_SECRET_KEY`).

#### Webhook event handling

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

#### Sandbox testing

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

## Password reset email

Configure these server environment variables to enable password reset emails:

- `RESEND_API_KEY` — API key for the Resend account that sends email.
- `EMAIL_FROM` — verified sender address, for example `DineDesk <no-reply@example.com>`.
- `NEXT_PUBLIC_APP_URL` — canonical app origin for reset links, such as `http://localhost:3000` in development or your HTTPS production URL.

Reset links expire after 15 minutes and can only be used once.
