"use client";

import React from "react";
import Link from "next/link";
import { useProblemsQuery } from "@/app/shared/problems/useProblems";
import { Button, DifficultyBadge, Spinner } from "@/app/shared/components";

export default function ProblemsPage() {
  const { data, isLoading, isError, error, refetch } = useProblemsQuery();

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-zinc-100">Problems</h1>
        <p className="text-xs text-zinc-400 mt-1">
          Select a problem to review requirements and practice your design.
        </p>
      </div>

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-16">
          <Spinner size="md" />
          <p className="mt-3 text-xs text-zinc-500">Loading problems...</p>
        </div>
      )}

      {isError && (
        <div
          role="alert"
          className="rounded border border-red-800/80 bg-red-950/40 p-4 text-red-300 text-xs flex items-center justify-between"
        >
          <span>{error?.message || "Failed to load problems. Please try again."}</span>
          <Button variant="secondary" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      )}

      {!isLoading && !isError && data?.problems?.length === 0 && (
        <div className="rounded border border-zinc-800 bg-zinc-900/50 p-8 text-center">
          <p className="text-sm text-zinc-400">No problems available at this time.</p>
        </div>
      )}

      {!isLoading && !isError && data && data.problems.length > 0 && (
        <div className="space-y-3">
          {data.problems.map((problem) => (
            <Link
              key={problem.id}
              href={`/problems/${problem.id}`}
              className="block rounded border border-zinc-800 bg-zinc-900/50 p-5 transition-colors hover:border-zinc-700 hover:bg-zinc-900 group"
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-base font-medium text-zinc-100 group-hover:text-white">
                  {problem.title}
                </h2>
                <DifficultyBadge difficulty={problem.difficulty} />
              </div>
              <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                {problem.description}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
