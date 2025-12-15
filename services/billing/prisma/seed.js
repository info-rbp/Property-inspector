"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    // Basic Plan
    await prisma.plan.upsert({
        where: { code: client_1.PlanCode.BASIC },
        update: {},
        create: {
            code: client_1.PlanCode.BASIC,
            name: 'Independent Inspector',
            description: 'Perfect for solo operators.',
            limits: {
                PHOTO_ANALYSIS_STANDARD: 500,
                PHOTO_ANALYSIS_DEEP: 50,
                REPORT_GENERATED: 20,
                PHOTO_STORED_MB: 1000
            },
            overageRules: {
                allowOverage: false,
                hardStop: true
            }
        }
    });
    // Pro Plan
    await prisma.plan.upsert({
        where: { code: client_1.PlanCode.PRO },
        update: {},
        create: {
            code: client_1.PlanCode.PRO,
            name: 'Growing Agency',
            description: 'For small teams.',
            limits: {
                PHOTO_ANALYSIS_STANDARD: 2000,
                PHOTO_ANALYSIS_DEEP: 500,
                REPORT_GENERATED: 100,
                PHOTO_STORED_MB: 5000
            },
            overageRules: {
                allowOverage: true,
                hardStop: false // Soft limit
            }
        }
    });
    console.log('Database seeded successfully.');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
