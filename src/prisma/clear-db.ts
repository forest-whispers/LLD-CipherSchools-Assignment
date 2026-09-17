// prisma/clear-db.ts

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("🗑️ Clearing database...");

    // Evaluation children
    await prisma.evaluationCriterion.deleteMany();

    // Evaluation / submission children
    await prisma.evaluation.deleteMany();
    await prisma.submission.deleteMany();

    // Attempts
    await prisma.attempt.deleteMany();

    // Sessions
    await prisma.lLDSession.deleteMany();

    // Problem relations
    await prisma.problemEvaluationRubric.deleteMany();
    await prisma.problemRequirement.deleteMany();

    // Parent/reference tables
    await prisma.evaluationRubric.deleteMany();
    await prisma.problem.deleteMany();

    // Users
    await prisma.user.deleteMany();

    console.log("✅ Database completely cleared.");
}

main()
    .catch((error) => {
        console.error("❌ Failed to clear database:");
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });