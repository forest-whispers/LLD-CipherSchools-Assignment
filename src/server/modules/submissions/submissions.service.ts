import { prisma } from "@/server/shared/config/prisma";
import {
    ConflictError,
    NotFoundError,
} from "@/server/shared/errors/errors";
import { CreateSubmissionInput } from "./submissions.types";

export async function createSubmissionService(
    userId: string,
    attemptId: string,
    input: CreateSubmissionInput
) {
    const attempt = await prisma.attempt.findFirst({
        where: {
            id: attemptId,
            session: {
                userId,
            },
        },
        select: {
            id: true,
            status: true,
        },
    });

    if (!attempt) {
        throw new NotFoundError("Attempt not found");
    }

    if (attempt.status !== "IN_PROGRESS") {
        throw new ConflictError("Attempt has already been submitted");
    }

    const result = await prisma.$transaction(async (tx) => {
        const submission = await tx.submission.create({
            data: {
                attemptId: attempt.id,
                requirementsAndAssumptions: input.requirementsAndAssumptions,
                design: input.design,
                relationshipsAndInteractions: input.relationshipsAndInteractions,
                tradeoffsAndDesignDecisions: input.tradeoffsAndDesignDecisions,
                edgeCasesAndExtensibility: input.edgeCasesAndExtensibility,
            },
            select: {
                id: true,
                attemptId: true,
                submittedAt: true,
            },
        });

        const updatedAttempt = await tx.attempt.update({
            where: {
                id: attempt.id,
            },
            data: {
                status: "EVALUATING",
            },
            select: {
                id: true,
                attemptNumber: true,
                status: true,
            },
        });

        return {
            submission,
            attempt: updatedAttempt,
        };
    });

    return result;
}