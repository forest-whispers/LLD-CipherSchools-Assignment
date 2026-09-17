"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useProblemDetailQuery } from "@/app/shared/problems/useProblems";
import { useCreateSessionMutation } from "@/app/shared/practice/usePractice";
import { Button, DifficultyBadge, Spinner } from "@/app/shared/components";

export default function ProblemDetailPage() {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : "";
  const { data, isLoading, isError, error, refetch } = useProblemDetailQuery(id);
  const createSessionMutation = useCreateSessionMutation();

  const problem = data?.problem;

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <Link
          href="/problems"
          className="inline-flex items-center text-xs text-zinc-400 hover:text-zinc-200 transition-colors mb-4"
        >
          ← Back to Problems
        </Link>
      </div>

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20">
          <Spinner size="md" />
          <p className="mt-3 text-xs text-zinc-500">Loading problem details...</p>
        </div>
      )}

      {isError && (
        <div
          role="alert"
          className="rounded border border-red-800/80 bg-red-950/40 p-4 text-red-300 text-xs flex items-center justify-between"
        >
          <span>{error?.message || "Problem not found or failed to load."}</span>
          <Button variant="secondary" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      )}

      {!isLoading && !isError && problem && (
        <div className="space-y-8">
          {/* Header & Primary Action */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-zinc-800">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-semibold text-zinc-100">
                  {problem.title}
                </h1>
                <DifficultyBadge difficulty={problem.difficulty} />
              </div>
            </div>
            <div>
              <Button
                variant="primary"
                onClick={() => createSessionMutation.mutate(problem.id)}
                isLoading={createSessionMutation.isPending}
                disabled={createSessionMutation.isPending}
              >
                Start Practice
              </Button>
              {createSessionMutation.isError && (
                <p className="text-xs text-red-400 mt-1.5 sm:text-right">
                  {createSessionMutation.error?.message ||
                    "Failed to start practice session."}
                </p>
              )}
            </div>
          </div>

          {/* Problem Description */}
          <section className="space-y-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Description
            </h2>
            <div className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line bg-zinc-900/30 p-4 rounded border border-zinc-800/60">
              {problem.description}
            </div>
          </section>

          {/* Requirements Section */}
          <section className="space-y-4">
            <h2 className="text-base font-semibold text-zinc-100">
              Requirements
            </h2>
            <ol className="space-y-2.5">
              {problem.requirements
                .slice()
                .sort((a, b) => a.order - b.order)
                .map((req) => (
                  <li
                    key={req.id}
                    className="flex items-start gap-3 rounded border border-zinc-800 bg-zinc-900/40 p-3.5 text-sm text-zinc-300"
                  >
                    <span className="font-mono text-xs font-medium text-zinc-500 shrink-0 w-6 pt-0.5">
                      {req.order}.
                    </span>
                    <span className="leading-relaxed">{req.description}</span>
                  </li>
                ))}
            </ol>
          </section>
        </div>
      )}
    </div>
  );
}
