export type ProblemDifficulty = "EASY" | "MEDIUM" | "HARD";

export interface ProblemSummary {
  id: string;
  title: string;
  description: string;
  difficulty: ProblemDifficulty;
}

export interface ProblemRequirement {
  id: string;
  description: string;
  order: number;
}

export interface ProblemDetail {
  id: string;
  title: string;
  description: string;
  difficulty: ProblemDifficulty;
  requirements: ProblemRequirement[];
}

export interface ProblemsListResponse {
  problems: ProblemSummary[];
}

export interface ProblemDetailResponse {
  problem: ProblemDetail;
}

async function parseResponse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errorMsg = data?.message || "An unexpected error occurred";
    throw new Error(errorMsg);
  }
  return data as T;
}

export const problemsApi = {
  async getProblems(): Promise<ProblemsListResponse> {
    const res = await fetch("/api/problems", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return parseResponse<ProblemsListResponse>(res);
  },

  async getProblemById(id: string): Promise<ProblemDetailResponse> {
    const res = await fetch(`/api/problems/${encodeURIComponent(id)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return parseResponse<ProblemDetailResponse>(res);
  },
};
