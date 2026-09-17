import { beforeEach, describe, expect, it, vi } from "vitest";
import { createSubmissionService } from "@/server/modules/submissions/submissions.service";
import { ConflictError, NotFoundError } from "@/server/shared/errors/errors";
import { prisma } from "@/server/shared/config/prisma";
import { llmEvaluator } from "@/server/modules/evaluations/evaluators/llm.evaluator";
import type { EvaluationResult } from "@/server/modules/evaluations/evaluation.types";

vi.mock("@/server/shared/config/prisma", () => {
  const mockAttempt = {
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
  };
  const mockSubmission = {
    create: vi.fn(),
  };
  const mockEvaluation = {
    create: vi.fn(),
    deleteMany: vi.fn(),
  };
  const mockTx = {
    attempt: mockAttempt,
    submission: mockSubmission,
    evaluation: mockEvaluation,
  };

  return {
    prisma: {
      attempt: mockAttempt,
      submission: mockSubmission,
      evaluation: mockEvaluation,
      $transaction: vi.fn(async (cb: (tx: typeof mockTx) => Promise<unknown>) =>
        cb(mockTx)
      ),
    },
  };
});

vi.mock("@/server/modules/evaluations/evaluators/llm.evaluator", () => {
  return {
    llmEvaluator: {
      evaluate: vi.fn(),
    },
  };
});

const mockPrisma = prisma as unknown as {
  attempt: {
    findFirst: ReturnType<typeof vi.fn>;
    findUnique: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };
  submission: {
    create: ReturnType<typeof vi.fn>;
  };
  evaluation: {
    create: ReturnType<typeof vi.fn>;
    deleteMany: ReturnType<typeof vi.fn>;
  };
  $transaction: ReturnType<typeof vi.fn>;
};

const mockLlmEvaluator = llmEvaluator as unknown as {
  evaluate: ReturnType<typeof vi.fn>;
};

describe("LLD Submission & Evaluation Domain Service", () => {
  const userId = "user-test-123";
  const attemptId = "attempt-test-456";

  const sampleInput = {
    requirementsAndAssumptions: "Manage multi-floor parking for compact and large vehicles.",
    design: "ParkingLot singleton with Floor and ParkingSpot domain classes.",
    relationshipsAndInteractions: "EntryPanel issues ParkingTicket, ParkingSpot assigns spot.",
    tradeoffsAndDesignDecisions: "Strategy pattern used for hourly fee calculation.",
    edgeCasesAndExtensibility: "Handles full lot and lost tickets gracefully.",
  };

  const sampleProblemData = {
    id: attemptId,
    status: "EVALUATING" as const,
    submission: {
      requirementsAndAssumptions: sampleInput.requirementsAndAssumptions,
      design: sampleInput.design,
      relationshipsAndInteractions: sampleInput.relationshipsAndInteractions,
      tradeoffsAndDesignDecisions: sampleInput.tradeoffsAndDesignDecisions,
      edgeCasesAndExtensibility: sampleInput.edgeCasesAndExtensibility,
    },
    session: {
      problem: {
        title: "Parking Lot",
        description: "Design an object-oriented parking lot system.",
        requirements: [
          {
            id: "REQ-1",
            description: "The parking lot can have multiple floors.",
            order: 1,
          },
        ],
        evaluationRubrics: [
          {
            rubricId: "rubric-1",
            guidance: "Verify class separation and spot allocation logic.",
            rubric: {
              id: "rubric-1",
              name: "Class Modeling & Responsibilities",
              description: "Assesses separation of concerns and OOP structure.",
              weight: 25,
            },
          },
        ],
      },
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockPrisma.attempt.update.mockImplementation((args: { where: { id: string }; data: { status?: string } }) => {
      return Promise.resolve({
        id: args.where.id || attemptId,
        attemptNumber: 1,
        status: args.data.status || "IN_PROGRESS",
      });
    });

    mockPrisma.submission.create.mockImplementation((args: { data: { attemptId: string } }) => {
      return Promise.resolve({
        id: "sub-test-789",
        attemptId: args.data.attemptId,
        requirementsAndAssumptions: sampleInput.requirementsAndAssumptions,
        design: sampleInput.design,
        relationshipsAndInteractions: sampleInput.relationshipsAndInteractions,
        tradeoffsAndDesignDecisions: sampleInput.tradeoffsAndDesignDecisions || null,
        edgeCasesAndExtensibility: sampleInput.edgeCasesAndExtensibility || null,
        submittedAt: new Date("2026-09-17T12:00:00Z"),
      });
    });

    mockPrisma.evaluation.create.mockImplementation((args: { data: { attemptId: string; overallScore: number; strengths: string[]; improvementPriorities: string[] } }) => {
      return Promise.resolve({
        id: "eval-test-999",
        attemptId: attemptId,
        overallScore: args.data.overallScore,
        strengths: args.data.strengths,
        improvementPriorities: args.data.improvementPriorities,
        createdAt: new Date("2026-09-17T12:00:05Z"),
        criteria: [
          {
            id: "crit-test-1",
            rubricId: "rubric-1",
            criterionName: "Class Modeling & Responsibilities",
            criterionDescription: "Assesses separation of concerns and OOP structure.",
            criterionWeight: 25,
            guidance: "Verify class separation and spot allocation logic.",
            score: 22,
            confidence: "HIGH",
            evidence: ["Clear ParkingLot and Spot classes"],
            concerns: [],
            suggestion: "Consider extracting PaymentProcessor interface.",
          },
        ],
      });
    });
  });

  // 1. Successful submission starts evaluation
  it("1. should persist submission, transition attempt to EVALUATING, call evaluator, and persist COMPLETED evaluation", async () => {
    mockPrisma.attempt.findFirst.mockResolvedValueOnce({
      id: attemptId,
      status: "IN_PROGRESS",
    });

    mockPrisma.attempt.findUnique.mockResolvedValueOnce(sampleProblemData);

    const validEvaluatorResult: EvaluationResult = {
      criteria: [
        {
          rubricId: "rubric-1",
          score: 22,
          confidence: "HIGH",
          evidence: ["Clear ParkingLot and Spot classes"],
          concerns: [],
          suggestion: "Consider extracting PaymentProcessor interface.",
        },
      ],
      strengths: ["Strong domain modeling"],
      improvementPriorities: ["Add explicit payment gateway abstraction"],
    };

    mockLlmEvaluator.evaluate.mockResolvedValueOnce(validEvaluatorResult);

    const result = await createSubmissionService(userId, attemptId, sampleInput);

    // Verification 1: Submission persisted before evaluation
    expect(mockPrisma.submission.create).toHaveBeenCalledTimes(1);
    expect(mockPrisma.submission.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          attemptId,
          requirementsAndAssumptions: sampleInput.requirementsAndAssumptions,
          design: sampleInput.design,
          relationshipsAndInteractions: sampleInput.relationshipsAndInteractions,
        }),
      })
    );

    // Verification 2: Attempt transitioned to EVALUATING in transaction
    expect(mockPrisma.attempt.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: attemptId },
        data: { status: "EVALUATING" },
      })
    );

    // Verification 3: Evaluator called with expected domain data
    expect(mockLlmEvaluator.evaluate).toHaveBeenCalledTimes(1);
    expect(mockLlmEvaluator.evaluate).toHaveBeenCalledWith(
      expect.objectContaining({
        problem: expect.objectContaining({ title: "Parking Lot" }),
        submission: expect.objectContaining({ design: sampleInput.design }),
        rubrics: expect.arrayContaining([
          expect.objectContaining({ rubricId: "rubric-1", weight: 25 }),
        ]),
        deterministicChecks: expect.objectContaining({
          requiredSectionsPresent: true,
        }),
      })
    );

    // Verification 4: Evaluation persisted and attempt updated to COMPLETED
    expect(mockPrisma.evaluation.create).toHaveBeenCalledTimes(1);
    expect(mockPrisma.evaluation.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          attemptId,
          overallScore: 22,
        }),
      })
    );

    expect(mockPrisma.attempt.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: attemptId },
        data: { status: "COMPLETED" },
      })
    );

    // Verification 5: Result shape matches authoritative completed response
    expect(result.message).toBe("Solution evaluated successfully.");
    expect(result.attempt.status).toBe("COMPLETED");
    expect(result.evaluation?.overallScore).toBe(22);
  });

  // 2. Duplicate submission is rejected
  it("2. should reject duplicate submission if attempt is already EVALUATING or COMPLETED", async () => {
    mockPrisma.attempt.findFirst.mockResolvedValueOnce({
      id: attemptId,
      status: "EVALUATING",
    });

    await expect(
      createSubmissionService(userId, attemptId, sampleInput)
    ).rejects.toThrow(ConflictError);

    // Invariant: No second submission or transaction created
    expect(mockPrisma.$transaction).not.toHaveBeenCalled();
    expect(mockPrisma.submission.create).not.toHaveBeenCalled();
    expect(mockLlmEvaluator.evaluate).not.toHaveBeenCalled();
  });

  // 3. Ownership boundary is enforced
  it("3. should enforce ownership boundary and reject submission to another user's attempt", async () => {
    mockPrisma.attempt.findFirst.mockResolvedValueOnce(null);

    await expect(
      createSubmissionService("unauthorized-user", attemptId, sampleInput)
    ).rejects.toThrow(NotFoundError);

    // Verification: Query filters by session.userId
    expect(mockPrisma.attempt.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: attemptId,
          session: {
            userId: "unauthorized-user",
          },
        },
      })
    );

    // Invariant: Neither submission nor evaluation is executed
    expect(mockPrisma.submission.create).not.toHaveBeenCalled();
    expect(mockLlmEvaluator.evaluate).not.toHaveBeenCalled();
  });

  // 4. Evaluation failure preserves the submission
  it("4. should preserve the persisted submission and set attempt status to FAILED if evaluator throws", async () => {
    mockPrisma.attempt.findFirst.mockResolvedValueOnce({
      id: attemptId,
      status: "IN_PROGRESS",
    });

    mockPrisma.attempt.findUnique.mockResolvedValueOnce(sampleProblemData);

    // Evaluator throws due to provider error / network issue
    mockLlmEvaluator.evaluate.mockRejectedValueOnce(
      new Error("Gemini API connection timeout")
    );

    const result = await createSubmissionService(userId, attemptId, sampleInput);

    // Verification 1: Submission was already durably persisted in database
    expect(mockPrisma.submission.create).toHaveBeenCalledTimes(1);

    // Verification 2: Attempt transitioned to FAILED
    expect(mockPrisma.attempt.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: attemptId },
        data: { status: "FAILED" },
      })
    );

    // Verification 3: No evaluation record created
    expect(mockPrisma.evaluation.create).not.toHaveBeenCalled();

    // Verification 4: Graceful failure response returned with persisted submission intact
    expect(result.message).toBe("Solution submitted, but evaluation failed.");
    expect(result.attempt.status).toBe("FAILED");
    expect(result.evaluation).toBeNull();
    expect(result.submission.id).toBe("sub-test-789");
  });

  // 5. Invalid evaluator output is rejected
  it("5. should reject invalid evaluator output exceeding rubric weight and mark attempt FAILED", async () => {
    mockPrisma.attempt.findFirst.mockResolvedValueOnce({
      id: attemptId,
      status: "IN_PROGRESS",
    });

    mockPrisma.attempt.findUnique.mockResolvedValueOnce(sampleProblemData);

    // Evaluator returns a score (30) that exceeds rubric weight (25)
    const invalidEvaluatorResult: EvaluationResult = {
      criteria: [
        {
          rubricId: "rubric-1",
          score: 30, // Exceeds weight 25!
          confidence: "HIGH",
          evidence: ["Exceeding weight evidence"],
          concerns: [],
          suggestion: "Fix score",
        },
      ],
      strengths: [],
      improvementPriorities: [],
    };

    mockLlmEvaluator.evaluate.mockResolvedValueOnce(invalidEvaluatorResult);

    const result = await createSubmissionService(userId, attemptId, sampleInput);

    // Invariant: Attempt must NOT transition to COMPLETED
    expect(mockPrisma.attempt.update).not.toHaveBeenCalledWith(
      expect.objectContaining({
        data: { status: "COMPLETED" },
      })
    );

    // Invariant: No evaluation record persisted
    expect(mockPrisma.evaluation.create).not.toHaveBeenCalled();

    // Verification: Application caught the validation error and marked attempt FAILED
    expect(mockPrisma.attempt.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: attemptId },
        data: { status: "FAILED" },
      })
    );
    expect(result.attempt.status).toBe("FAILED");
    expect(result.evaluation).toBeNull();
  });
});
