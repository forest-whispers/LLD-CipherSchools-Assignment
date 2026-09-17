"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  Attempt,
  LLDSession,
  ListSessionsResponse,
  PracticeSessionSummary,
  practiceApi,
  SubmissionInput,
  SubmissionResult,
  TranscriptItem,
} from "./practice.api";

export const practiceKeys = {
  all: ["practice"] as const,
  session: (id: string) => [...practiceKeys.all, "session", id] as const,
  sessions: ["lld-sessions"] as const,
};

export function useSessionsQuery(enabled = true) {
  return useQuery<ListSessionsResponse>({
    queryKey: practiceKeys.sessions,
    queryFn: () => practiceApi.listSessions(),
    enabled,
  });
}

function getStoredSession(sessionId: string): LLDSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(`lld_session_${sessionId}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function storeSession(session: LLDSession) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(`lld_session_${session.id}`, JSON.stringify(session));
  } catch {
    // ignore
  }
}

export function useSessionData(sessionId: string) {
  const queryClient = useQueryClient();

  return useQuery<LLDSession | null>({
    queryKey: practiceKeys.session(sessionId),
    queryFn: () => {
      const cached = queryClient.getQueryData<LLDSession>(
        practiceKeys.session(sessionId)
      );
      if (cached) return cached;
      return getStoredSession(sessionId);
    },
    initialData: () => {
      const cached = queryClient.getQueryData<LLDSession>(
        practiceKeys.session(sessionId)
      );
      if (cached) return cached;
      return getStoredSession(sessionId);
    },
    enabled: Boolean(sessionId),
  });
}

export function useCreateSessionMutation() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (problemId: string) => practiceApi.createSession(problemId),
    onSuccess: (data) => {
      const session = {
        ...data.session,
        messageTranscript: data.session.messageTranscript || [],
      };
      storeSession(session);
      queryClient.setQueryData(practiceKeys.session(session.id), session);

      // Incrementally update ["lld-sessions"] query cache
      const newSessionSummary: PracticeSessionSummary = {
        id: session.id,
        problem: {
          id: session.problem.id,
          title: session.problem.title,
          difficulty: session.problem.difficulty,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      queryClient.setQueryData<ListSessionsResponse>(
        practiceKeys.sessions,
        (current) => {
          if (!current) {
            return { sessions: [newSessionSummary] };
          }
          if (current.sessions.some((s) => s.id === newSessionSummary.id)) {
            return current;
          }
          return {
            sessions: [newSessionSummary, ...current.sessions],
          };
        }
      );

      router.push(`/lld-session/${session.id}`);
    },
  });
}

export function useCreateAttemptMutation(sessionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => practiceApi.createAttempt(sessionId),
    onSuccess: (data) => {
      const newAttempt: Attempt = data.attempt;

      queryClient.setQueryData<LLDSession | null>(
        practiceKeys.session(sessionId),
        (prev) => {
          if (!prev) return prev;
          const updated: LLDSession = {
            ...prev,
            attempts: [...prev.attempts, newAttempt],
            messageTranscript: prev.messageTranscript || [],
          };
          storeSession(updated);
          return updated;
        }
      );
    },
  });
}

export function useSubmitAttemptMutation(sessionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      attemptId,
      input,
    }: {
      attemptId: string;
      input: SubmissionInput;
    }) => practiceApi.submitAttempt(attemptId, input),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({
        queryKey: practiceKeys.session(sessionId),
      });
      const previousSession = queryClient.getQueryData<LLDSession | null>(
        practiceKeys.session(sessionId)
      );

      if (previousSession) {
        const attempt = previousSession.attempts.find(
          (a) => a.id === variables.attemptId
        );
        const optimisticTranscriptItem: TranscriptItem = {
          submission: {
            id: `optimistic-${variables.attemptId}`,
            attemptId: variables.attemptId,
            attemptNumber: attempt?.attemptNumber,
            submittedAt: new Date().toISOString(),
            requirementsAndAssumptions:
              variables.input.requirementsAndAssumptions,
            design: variables.input.design,
            relationshipsAndInteractions:
              variables.input.relationshipsAndInteractions,
            tradeoffsAndDesignDecisions:
              variables.input.tradeoffsAndDesignDecisions,
            edgeCasesAndExtensibility:
              variables.input.edgeCasesAndExtensibility,
          },
          evaluation: {},
        };

        const updated: LLDSession = {
          ...previousSession,
          attempts: previousSession.attempts.map((att) =>
            att.id === variables.attemptId
              ? { ...att, status: "EVALUATING" }
              : att
          ),
          messageTranscript: [
            ...(previousSession.messageTranscript || []),
            optimisticTranscriptItem,
          ],
        };
        queryClient.setQueryData(practiceKeys.session(sessionId), updated);
        storeSession(updated);
      }

      return { previousSession };
    },
    onSuccess: (data: SubmissionResult, variables) => {
      queryClient.setQueryData<LLDSession | null>(
        practiceKeys.session(sessionId),
        (prev) => {
          if (!prev) return prev;

          const finalizedEvaluation = data.evaluation ?? null;
          const finalizedSubmission = {
            id: data.submission.id,
            attemptId: data.submission.attemptId,
            attemptNumber: data.attempt.attemptNumber,
            submittedAt: data.submission.submittedAt,
            requirementsAndAssumptions:
              variables.input.requirementsAndAssumptions,
            design: variables.input.design,
            relationshipsAndInteractions:
              variables.input.relationshipsAndInteractions,
            tradeoffsAndDesignDecisions:
              variables.input.tradeoffsAndDesignDecisions,
            edgeCasesAndExtensibility:
              variables.input.edgeCasesAndExtensibility,
          };

          const existingTranscript = prev.messageTranscript || [];
          const existingIdx = existingTranscript.findIndex(
            (t) => t.submission.attemptId === data.submission.attemptId
          );

          let newTranscript: TranscriptItem[];
          if (existingIdx >= 0) {
            newTranscript = [...existingTranscript];
            newTranscript[existingIdx] = {
              submission: finalizedSubmission,
              evaluation: finalizedEvaluation,
            };
          } else {
            newTranscript = [
              ...existingTranscript,
              {
                submission: finalizedSubmission,
                evaluation: finalizedEvaluation,
              },
            ];
          }

          const updated: LLDSession = {
            ...prev,
            attempts: prev.attempts.map((att) =>
              att.id === data.attempt.id
                ? {
                    ...att,
                    status: data.attempt.status,
                  }
                : att
            ),
            messageTranscript: newTranscript,
          };

          storeSession(updated);
          return updated;
        }
      );
    },
    onError: (_err, _variables, context) => {
      if (context?.previousSession) {
        queryClient.setQueryData(
          practiceKeys.session(sessionId),
          context.previousSession
        );
        storeSession(context.previousSession);
      }
    },
  });
}

export function useRetryEvaluationMutation(sessionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (attemptId: string) => practiceApi.retryEvaluation(attemptId),
    onMutate: async (attemptId) => {
      await queryClient.cancelQueries({
        queryKey: practiceKeys.session(sessionId),
      });
      const previousSession = queryClient.getQueryData<LLDSession | null>(
        practiceKeys.session(sessionId)
      );

      if (previousSession) {
        const updated: LLDSession = {
          ...previousSession,
          attempts: previousSession.attempts.map((att) =>
            att.id === attemptId ? { ...att, status: "EVALUATING" } : att
          ),
          messageTranscript: (previousSession.messageTranscript || []).map(
            (item) =>
              item.submission.attemptId === attemptId
                ? { ...item, evaluation: {} }
                : item
          ),
        };
        queryClient.setQueryData(practiceKeys.session(sessionId), updated);
        storeSession(updated);
      }

      return { previousSession };
    },
    onSuccess: (data: SubmissionResult) => {
      queryClient.setQueryData<LLDSession | null>(
        practiceKeys.session(sessionId),
        (prev) => {
          if (!prev) return prev;

          const finalizedEvaluation = data.evaluation ?? null;
          const existingTranscript = prev.messageTranscript || [];
          const newTranscript = existingTranscript.map((item) =>
            item.submission.attemptId === data.attempt.id
              ? { ...item, evaluation: finalizedEvaluation }
              : item
          );

          const updated: LLDSession = {
            ...prev,
            attempts: prev.attempts.map((att) =>
              att.id === data.attempt.id
                ? {
                    ...att,
                    status: data.attempt.status,
                  }
                : att
            ),
            messageTranscript: newTranscript,
          };

          storeSession(updated);
          return updated;
        }
      );
    },
    onError: (_err, _attemptId, context) => {
      if (context?.previousSession) {
        queryClient.setQueryData(
          practiceKeys.session(sessionId),
          context.previousSession
        );
        storeSession(context.previousSession);
      }
    },
  });
}

