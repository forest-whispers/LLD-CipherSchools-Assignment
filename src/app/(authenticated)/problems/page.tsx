import React from "react";

export default function ProblemsPage() {
  return (
    <div className="max-w-4xl space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-zinc-100">Problems</h1>
        <p className="text-xs text-zinc-400 mt-1">
          Explore and practice Low-Level Design problems.
        </p>
      </div>

      <div className="rounded border border-zinc-800 bg-zinc-900/50 p-6 text-center">
        <p className="text-sm text-zinc-400">
          Problem catalog will be implemented in the next slice.
        </p>
      </div>
    </div>
  );
}
