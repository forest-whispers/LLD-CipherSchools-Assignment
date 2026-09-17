"use client";

import { useQuery } from "@tanstack/react-query";
import { problemsApi } from "./problems.api";

export const problemKeys = {
  all: ["problems"] as const,
  list: () => [...problemKeys.all, "list"] as const,
  detail: (id: string) => [...problemKeys.all, "detail", id] as const,
};

export function useProblemsQuery() {
  return useQuery({
    queryKey: problemKeys.list(),
    queryFn: () => problemsApi.getProblems(),
    staleTime: 60 * 1000,
  });
}

export function useProblemDetailQuery(id: string) {
  return useQuery({
    queryKey: problemKeys.detail(id),
    queryFn: () => problemsApi.getProblemById(id),
    enabled: Boolean(id),
    staleTime: 60 * 1000,
  });
}
