import { prisma } from "@/server/shared/config/prisma";
import { NotFoundError } from "@/server/shared/errors/errors";

export async function createSessionService(
    userId: string,
    problemId: string
) {
    const problem = await prisma.problem.findUnique({
        where: {
            id: problemId,
        },
        select: {
            id: true,
            title: true,
            difficulty: true,
        },
    });

    if (!problem) {
        throw new NotFoundError("Problem not found");
    }

    const session = await prisma.lLDSession.create({
        data: {
            userId,
            problemId,
        },
        select: {
            id: true,
            problemId: true,
            problem: {
                select: {
                    id: true,
                    title: true,
                    difficulty: true,
                },
            },
            attempts: {
                select: {
                    id: true,
                    attemptNumber: true,
                    status: true,
                    createdAt: true,
                },
                orderBy: {
                    attemptNumber: "asc",
                },
            },
        },
    });

    return session;
}

export async function listSessionsService(userId: string) {
    return prisma.lLDSession.findMany({
        where: {
            userId,
        },
        select: {
            id: true,
            createdAt: true,
            updatedAt: true,
            problem: {
                select: {
                    id: true,
                    title: true,
                    difficulty: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });
}

export async function getSessionService(
    userId: string,
    sessionId: string
) {
    const session = await prisma.lLDSession.findFirst({
        where: {
            id: sessionId,
            userId,
        },
        select: {
            id: true,
            problemId: true,
            problem: {
                select: {
                    id: true,
                    title: true,
                    difficulty: true,
                },
            },
            attempts: {
                select: {
                    id: true,
                    attemptNumber: true,
                    status: true,
                    createdAt: true,
                    submission: {
                        select: {
                            id: true,
                            attemptId: true,
                            requirementsAndAssumptions: true,
                            design: true,
                            relationshipsAndInteractions: true,
                            tradeoffsAndDesignDecisions: true,
                            edgeCasesAndExtensibility: true,
                            submittedAt: true,
                        },
                    },
                    evaluation: {
                        select: {
                            id: true,
                            attemptId: true,
                            overallScore: true,
                            strengths: true,
                            improvementPriorities: true,
                            createdAt: true,
                            criteria: {
                                select: {
                                    id: true,
                                    rubricId: true,
                                    criterionName: true,
                                    criterionDescription: true,
                                    criterionWeight: true,
                                    guidance: true,
                                    score: true,
                                    confidence: true,
                                    evidence: true,
                                    concerns: true,
                                    suggestion: true,
                                },
                                orderBy: {
                                    criterionWeight: "desc",
                                },
                            },
                        },
                    },
                },
                orderBy: {
                    attemptNumber: "asc",
                },
            },
        },
    });

    if (!session) {
        throw new NotFoundError("Session not found");
    }

    const messageTranscript = session.attempts
        .filter((att) => att.submission !== null)
        .map((att) => ({
            submission: {
                id: att.submission!.id,
                attemptId: att.submission!.attemptId,
                attemptNumber: att.attemptNumber,
                submittedAt: att.submission!.submittedAt.toISOString(),
                requirementsAndAssumptions:
                    att.submission!.requirementsAndAssumptions,
                design: att.submission!.design,
                relationshipsAndInteractions:
                    att.submission!.relationshipsAndInteractions,
                tradeoffsAndDesignDecisions:
                    att.submission!.tradeoffsAndDesignDecisions ?? undefined,
                edgeCasesAndExtensibility:
                    att.submission!.edgeCasesAndExtensibility ?? undefined,
            },
            evaluation: att.evaluation
                ? {
                      id: att.evaluation.id,
                      attemptId: att.evaluation.attemptId,
                      overallScore: att.evaluation.overallScore,
                      strengths: att.evaluation.strengths as string[],
                      improvementPriorities:
                          att.evaluation.improvementPriorities as string[],
                      createdAt: att.evaluation.createdAt.toISOString(),
                      criteria: att.evaluation.criteria.map((c) => ({
                          id: c.id,
                          rubricId: c.rubricId,
                          criterionName: c.criterionName,
                          criterionDescription: c.criterionDescription,
                          criterionWeight: c.criterionWeight,
                          guidance: c.guidance,
                          score: c.score,
                          confidence: c.confidence,
                          evidence: c.evidence as string[],
                          concerns: c.concerns as string[],
                          suggestion: c.suggestion,
                      })),
                  }
                : att.status === "EVALUATING"
                ? {}
                : null,
        }));

    return {
        id: session.id,
        problemId: session.problemId,
        problem: session.problem,
        attempts: session.attempts.map((att) => ({
            id: att.id,
            attemptNumber: att.attemptNumber,
            status: att.status,
            createdAt: att.createdAt.toISOString(),
        })),
        messageTranscript,
    };
}