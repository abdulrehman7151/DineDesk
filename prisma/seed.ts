// Seeds the DineDesk Basic subscription plan (Rs 1,500/month).
//
// Run with:  npx prisma db seed
// Requires:   DATABASE_URL and SAFEPAY_PLAN_ID (the plan id created in the
//             SafePay merchant dashboard) in the environment.
// Safe to re-run: it upserts by productId and never deletes anything.
import { prisma } from "../lib/prisma";

async function main() {
    const safepayPlanId = process.env.SAFEPAY_PLAN_ID;
    if (!safepayPlanId) {
        throw new Error(
            "SAFEPAY_PLAN_ID is not set. Create the monthly plan in the SafePay dashboard and set its id in the environment."
        );
    }

    const plan = await prisma.subscriptionPlan.upsert({
        where: { productId: "dinedesk-basic" },
        update: {
            name: "DineDesk Basic",
            price: 150000, // paisa = Rs 1,500
            currency: "PKR",
            interval: "Month",
            intervalCount: 1,
            trialDays: 0,
            safepayPlanId,
            isActive: true,
        },
        create: {
            name: "DineDesk Basic",
            productId: "dinedesk-basic",
            price: 150000, // paisa = Rs 1,500
            currency: "PKR",
            interval: "Month",
            intervalCount: 1,
            trialDays: 0,
            safepayPlanId,
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
