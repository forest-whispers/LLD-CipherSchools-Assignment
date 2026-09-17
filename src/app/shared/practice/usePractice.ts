"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  Attempt,
  LLDSession,
  practiceApi,
  SubmissionInput,
  SubmissionResult,
  TranscriptItem,
} from "./practice.api";

export const practiceKeys = {
  all: ["practice"] as const,
  session: (id: string) => [...practiceKeys.all, "session", id] as const,
};

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
    onSuccess: (data: SubmissionResult, variables) => {
      queryClient.setQueryData<LLDSession | null>(
        practiceKeys.session(sessionId),
        (prev) => {
          if (!prev) return prev;

          const newTranscriptItem: TranscriptItem = {
            submission: {
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
            },
            evaluation: {},
          };

          const existingTranscript = prev.messageTranscript || [];

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
            messageTranscript: [...existingTranscript, newTranscriptItem],
          };

          storeSession(updated);
          return updated;
        }
      );
    },
  });
}
