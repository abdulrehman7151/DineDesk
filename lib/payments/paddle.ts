import "server-only";

// Paddle catalog ids for the DineDesk Basic plan. The price is USD 5.00/month
// (no trial). These are Paddle catalog ids, not secrets, and are safe to
// expose to the browser — the client checkout button receives the price id
// as a prop from the subscription page.
export const PADDLE_PRODUCT_ID = "pro_01m8cq886aepj07e7p5jtb8abk";
export const PADDLE_PRICE_ID = "pri_01m8cq9pqm4t83zgp9s5psmdnn";

// What a customer is charged for one month of DineDesk Basic, in the
// smallest currency unit. Paddle reports transaction totals in minor units
// (a $5.00 payment arrives as 500). The webhook only activates a
// subscription when the payment is at least this much — tax can push the
// charged total above the list price, but never below it.
export const PADDLE_PRICE_AMOUNT_MINOR = 500;
export const PADDLE_PRICE_CURRENCY = "USD";
