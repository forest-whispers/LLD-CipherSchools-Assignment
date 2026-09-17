import { prisma } from "@/server/shared/config/prisma";
import { InternalServerError, NotFoundError } from "@/server/shared/errors/errors";

import { runDeterministicChecks } from "./evaluation.deterministic.service";
import {
    EvaluationInput,
    EvaluationResult,
} from "./evaluation.types";
import { llmEvaluator } from "./evaluators/llm.evaluator";

export async function evaluateAttemptService(
    attemptId: string
) {
    const attempt = await prisma.attempt.findUnique({
        where: {
            id: attemptId,
        },
        select: {
            id: true,
            status: true,
            submission: {
                select: {
                    requirementsAndAssumptions: true,
                    design: true,
                    relationshipsAndInteractions: true,
                    tradeoffsAndDesignDecisions: true,
                    edgeCasesAndExtensibility: true,
                },
            },
            session: {
                select: {
                    problem: {
                        select: {
                            title: true,
                            description: true,
                            requirements: {
                                select: {
                                    id: true,
                                    description: true,
                                    order: true,
                                },
                                orderBy: {
                                    order: "asc",
                                },
                            },
                            evaluationRubrics: {
                                select: {
                                    rubricId: true,
                                    guidance: true,
                                    rubric: {
                                        select: {
                                            id: true,
                                            name: true,
                                            description: true,
                                            weight: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    });

    if (!attempt) {
        throw new NotFoundError("Attempt not found");
    }

    if (!attempt.submission) {
        throw new NotFoundError("Submission not found");
    }

    if (attempt.status !== "EVALUATING" && attempt.status !== "FAILED") {
        return;
    }

    if (attempt.status !== "EVALUATING") {
        await prisma.attempt.update({
            where: { id: attempt.id },
            data: { status: "EVALUATING" },
        });
    }

    const rubrics = attempt.session.problem.evaluationRubrics.map(
        (item) => ({
            rubricId: item.rubric.id,
            name: item.rubric.name,
            description: item.rubric.description,
            weight: item.rubric.weight,
            guidance: item.guidance,
        })
    );

    const evaluationBase = {
        problem: {
            title: attempt.session.problem.title,
            description: attempt.session.problem.description,
            requirements: attempt.session.problem.requirements,
        },
        rubrics,
        submission: attempt.submission,
    };

    const deterministicChecks = runDeterministicChecks(
        evaluationBase
    );

    const evaluationInput: EvaluationInput = {
        ...evaluationBase,
        deterministicChecks,
    };

    let result: EvaluationResult;

    try {
        result = await llmEvaluator.evaluate(evaluationInput);

        validateEvaluationResult(result, rubrics);

        const overallScore = result.criteria.reduce(
            (total, criterion) => total + criterion.score,
            0
        );

        const evaluation = await prisma.$transaction(async (tx) => {
            await tx.evaluation.deleteMany({
                where: {
                    attemptId: attempt.id,
                },
            });

            const createdEvaluation = await tx.evaluation.create({
                data: {
                    attemptId: attempt.id,
                    overallScore,
                    strengths: result.strengths,
                    improvementPriorities: result.improvementPriorities,
                    criteria: {
                        create: result.criteria.map((criterion) => {
                            const rubric = rubrics.find(
                                (item) => item.rubricId === criterion.rubricId
                            );

                            if (!rubric) {
                                throw new InternalServerError(
                                    "Evaluation returned an unknown rubric"
                                );
                            }

                            return {
                                rubricId: rubric.rubricId,
                                criterionName: rubric.name,
                                criterionDescription: rubric.description,
                                criterionWeight: rubric.weight,
                                guidance: rubric.guidance,
                                score: criterion.score,
                                confidence: criterion.confidence,
                                evidence: criterion.evidence,
                                concerns: criterion.concerns,
                                suggestion: criterion.suggestion,
                            };
                        }),
                    },
                },
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
            });

            await tx.attempt.update({
                where: {
                    id: attempt.id,
                },
                data: {
                    status: "COMPLETED",
                },
            });

            return createdEvaluation;
        }, {
            maxWait: 15000,
            timeout: 30000,
        });

        return {
            status: "COMPLETED" as const,
            evaluation,
        };
    } catch (error) {
        console.error("evaluateAttemptService failed with error:", error);
        await prisma.attempt.update({
            where: {
                id: attempt.id,
            },
            data: {
                status: "FAILED",
            },
        });

        return {
            status: "FAILED" as const,
            evaluation: null,
        };
    }
}

function validateEvaluationResult(
    result: EvaluationResult,
    rubrics: {
        rubricId: string;
        name: string;
        description: string;
        weight: number;
        guidance: string | null;
    }[]
) {
    if (result.criteria.length !== rubrics.length) {
        throw new InternalServerError(
            "Evaluation did not return all rubric criteria"
        );
    }

    for (const criterion of result.criteria) {
        const rubric = rubrics.find(
            (item) => item.rubricId === criterion.rubricId
        );

        if (!rubric) {
            throw new InternalServerError(
                "Evaluation returned an unknown rubric"
            );
        }

        if (criterion.score > rubric.weight) {
            throw new InternalServerError(
                `Evaluation score exceeds weight for ${rubric.name}`
            );
        }
    }
}

export async function retryEvaluationService(
    userId: string,
    attemptId: string
) {
    const attempt = await prisma.attempt.findFirst({
        where: {
            id: attemptId,
            session: {
                userId,
            },
        },
        include: {
            submission: true,
        },
    });

    if (!attempt) {
        throw new NotFoundError("Attempt not found");
    }

    if (!attempt.submission) {
        throw new NotFoundError("Submission not found for this attempt");
    }

    const evaluationResult = await evaluateAttemptService(attempt.id);

    return {
        message:
            evaluationResult?.status === "COMPLETED"
                ? "Solution evaluated successfully."
                : "Evaluation failed.",
        submission: attempt.submission,
        attempt: {
            id: attempt.id,
            attemptNumber: attempt.attemptNumber,
            status: evaluationResult?.status ?? "FAILED",
        },
        evaluation: evaluationResult?.evaluation ?? null,
    };
}