
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

async function main() {
    const { prisma } = await import("./lib/prisma");

    const planId = process.env.SAFEPAY_PLAN_BASIC_ID;

    if (!planId) {
        throw new Error("Missing SAFEPAY_PLAN_BASIC_ID");
    }

    const existing = await prisma.subscriptionPlan.findFirst({
        where: { safepayPlanId: planId },
    });

    if (existing) {
        console.log("Basic plan already exists:", existing);
        return;
    }

    const plan = await prisma.subscriptionPlan.create({
        data: {
            name: "Basic",
            productId: "dinedesk-basic",
            price: 150000, // Replace with actual price in paisas
            currency: "PKR",
            interval: "Month",
            intervalCount: 1,
            trialDays: 0,
            safepayPlanId: planId,
            isActive: true,
        },
    });

    console.log("Basic plan created:", plan);

    await prisma.$disconnect();
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
