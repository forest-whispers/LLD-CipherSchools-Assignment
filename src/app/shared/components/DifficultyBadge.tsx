import React from "react";
import { ProblemDifficulty } from "../problems/problems.api";

export function DifficultyBadge({ difficulty }: { difficulty: ProblemDifficulty }) {
  const styles: Record<ProblemDifficulty, string> = {
    EASY: "text-emerald-400 bg-emerald-950/50 border-emerald-800/60",
    MEDIUM: "text-amber-400 bg-amber-950/50 border-amber-800/60",
    HARD: "text-rose-400 bg-rose-950/50 border-rose-800/60",
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border uppercase tracking-wider ${
        styles[difficulty] || "text-zinc-400 bg-zinc-900 border-zinc-800"
      }`}
    >
      {difficulty}
    </span>
  );
}
