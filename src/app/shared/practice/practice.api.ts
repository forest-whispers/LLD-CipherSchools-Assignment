import { ProblemDifficulty } from "../problems/problems.api";

export type AttemptStatus = "IN_PROGRESS" | "EVALUATING" | "COMPLETED" | "FAILED";

export interface Attempt {
  id: string;
  attemptNumber: number;
  status: AttemptStatus;
  createdAt: string;
}

export type EvaluationConfidence = "HIGH" | "MEDIUM" | "LOW";

export interface EvaluationCriterion {
  id?: string;
  rubricId?: string;
  criterionName: string;
  criterionDescription: string;
  criterionWeight: number;
  guidance?: string | null;
  score: number;
  confidence: EvaluationConfidence;
  evidence: string[];
  concerns: string[];
  suggestion: string;
}

export interface Evaluation {
  id?: string;
  attemptId?: string;
  overallScore: number;
  strengths: string[];
  improvementPriorities: string[];
  createdAt?: string;
  criteria: EvaluationCriterion[];
}

export interface TranscriptItem {
  submission: {
    id: string;
    attemptId: string;
    attemptNumber?: number;
    submittedAt: string;
    requirementsAndAssumptions: string;
    design: string;
    relationshipsAndInteractions: string;
    tradeoffsAndDesignDecisions?: string;
    edgeCasesAndExtensibility?: string;
  };
  evaluation: Evaluation | Record<string, unknown> | null;
}

export interface LLDSession {
  id: string;
  problemId: string;
  problem: {
    id: string;
    title: string;
    difficulty: ProblemDifficulty;
  };
  attempts: Attempt[];
  messageTranscript?: TranscriptItem[];
}

export interface CreateSessionResponse {
  session: LLDSession;
}

export interface CreateAttemptResponse {
  attempt: Attempt;
}

export interface SubmissionInput {
  requirementsAndAssumptions: string;
  design: string;
  relationshipsAndInteractions: string;
  tradeoffsAndDesignDecisions?: string;
  edgeCasesAndExtensibility?: string;
}

export interface SubmissionResult {
  message?: string;
  submission: {
    id: string;
    attemptId: string;
    submittedAt: string;
    requirementsAndAssumptions?: string;
    design?: string;
    relationshipsAndInteractions?: string;
    tradeoffsAndDesignDecisions?: string;
    edgeCasesAndExtensibility?: string;
  };
  attempt: {
    id: string;
    attemptNumber: number;
    status: AttemptStatus;
  };
  evaluation?: Evaluation | null;
}

async function parseResponse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errorMsg = data?.message || "An unexpected error occurred";
    throw new Error(errorMsg);
  }
  return data as T;
}

export const practiceApi = {
  async createSession(problemId: string): Promise<CreateSessionResponse> {
    const res = await fetch("/api/lld-sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ problemId }),
    });
    return parseResponse<CreateSessionResponse>(res);
  },

  async createAttempt(sessionId: string): Promise<CreateAttemptResponse> {
    const res = await fetch(`/api/lld-sessions/${encodeURIComponent(sessionId)}/attempts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return parseResponse<CreateAttemptResponse>(res);
  },

  async submitAttempt(
    attemptId: string,
    input: SubmissionInput
  ): Promise<SubmissionResult> {
    const res = await fetch(`/api/attempts/${encodeURIComponent(attemptId)}/submission`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });
    return parseResponse<SubmissionResult>(res);
  },
};
