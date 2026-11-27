// Seeds the DineDesk Basic subscription plan.
//
// Run with:  npx prisma db seed
// Requires:   DATABASE_URL in the environment.
// Safe to re-run: it upserts by productId and never deletes anything.
//
// The plan row only says the plan exists and is active. The prices
// customers actually pay live in Paddle (see lib/payments/paddle.ts):
// Pakistan USD 9.00/month (shown as Rs 2,499), USA USD 39.00/month,
// everywhere else USD 25.00/month.
import { prisma } from "../lib/prisma";

async function main() {
    const plan = await prisma.subscriptionPlan.upsert({
        where: { productId: "dinedesk-basic" },
        update: {
            name: "DineDesk Basic",
            price: 150000, // paisa = Rs 1,500 (legacy display price, unused by Paddle)
            currency: "PKR",
            interval: "Month",
            intervalCount: 1,
            trialDays: 0,
            isActive: true,
        },
        create: {
            name: "DineDesk Basic",
            productId: "dinedesk-basic",
            price: 150000, // paisa = Rs 1,500 (legacy display price, unused by Paddle)
            currency: "PKR",
            interval: "Month",
            intervalCount: 1,
            trialDays: 0,
            isActive: true,
        },
    });

    console.log(`Seeded subscription plan: ${plan.name} (${plan.productId})`);
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
