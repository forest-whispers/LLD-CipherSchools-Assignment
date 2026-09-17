"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  useCreateAttemptMutation,
  useSessionData,
  useSubmitAttemptMutation,
} from "@/app/shared/practice/usePractice";
import { useProblemDetailQuery } from "@/app/shared/problems/useProblems";
import {
  Button,
  DifficultyBadge,
  Spinner,
  Textarea,
} from "@/app/shared/components";

export default function LLDSessionPage() {
  const params = useParams();
  const sessionId = typeof params?.id === "string" ? params.id : "";

  const { data: session, isLoading: isSessionLoading } =
    useSessionData(sessionId);

  const problemId = session?.problemId || "";
  const { data: problemData, isLoading: isProblemLoading } =
    useProblemDetailQuery(problemId);

  const createAttemptMutation = useCreateAttemptMutation(sessionId);
  const submitAttemptMutation = useSubmitAttemptMutation(sessionId);

  // Form state for active attempt
  const [requirementsAndAssumptions, setRequirementsAndAssumptions] =
    useState("");
  const [design, setDesign] = useState("");
  const [relationshipsAndInteractions, setRelationshipsAndInteractions] =
    useState("");
  const [tradeoffsAndDesignDecisions, setTradeoffsAndDesignDecisions] =
    useState("");
  const [edgeCasesAndExtensibility, setEdgeCasesAndExtensibility] =
    useState("");

  const [validationErrors, setValidationErrors] = useState<{
    requirementsAndAssumptions?: string;
    design?: string;
    relationshipsAndInteractions?: string;
  }>({});

  const problem = problemData?.problem || session?.problem;
  const requirements = problemData?.problem?.requirements || [];

  // Determine current attempt
  const attempts = session?.attempts || [];
  const currentAttempt =
    attempts.length > 0 ? attempts[attempts.length - 1] : null;

  // Loading state
  if (isSessionLoading || (problemId && isProblemLoading)) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Spinner size="lg" />
        <p className="mt-3 text-xs text-zinc-500">Loading practice workspace...</p>
      </div>
    );
  }

  // If no session found
  if (!session) {
    return (
      <div className="max-w-2xl space-y-4">
        <Link
          href="/problems"
          className="inline-flex items-center text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          ← Back to Problems
        </Link>
        <div
          role="alert"
          className="rounded border border-red-800/80 bg-red-950/40 p-5 text-red-300 text-xs"
        >
          Session not found. Please start a new practice session from the problem
          detail page.
        </div>
      </div>
    );
  }

  // Handle attempt creation
  const handleStartAttempt = () => {
    if (createAttemptMutation.isPending) return;
    createAttemptMutation.mutate();
  };

  // Handle attempt submission
  const handleSubmitSolution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAttempt || submitAttemptMutation.isPending) return;

    // Validate required fields
    const errors: typeof validationErrors = {};
    if (!requirementsAndAssumptions.trim()) {
      errors.requirementsAndAssumptions =
        "Requirements and assumptions are required.";
    }
    if (!design.trim()) {
      errors.design = "Design description is required.";
    }
    if (!relationshipsAndInteractions.trim()) {
      errors.relationshipsAndInteractions =
        "Relationships and interactions are required.";
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors({});
    submitAttemptMutation.mutate({
      attemptId: currentAttempt.id,
      input: {
        requirementsAndAssumptions: requirementsAndAssumptions.trim(),
        design: design.trim(),
        relationshipsAndInteractions: relationshipsAndInteractions.trim(),
        tradeoffsAndDesignDecisions:
          tradeoffsAndDesignDecisions.trim() || undefined,
        edgeCasesAndExtensibility:
          edgeCasesAndExtensibility.trim() || undefined,
      },
    });
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Top back link */}
      <div>
        <Link
          href="/problems"
          className="inline-flex items-center text-xs text-zinc-400 hover:text-zinc-200 transition-colors mb-2"
        >
          ← Back to Problems
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-5 border-b border-zinc-800">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold text-zinc-100">
              {problem?.title || "Low-Level Design Practice"}
            </h1>
            {problem?.difficulty && (
              <DifficultyBadge difficulty={problem.difficulty} />
            )}
          </div>
        </div>

        {/* Attempt & Status Badges (if attempt exists) */}
        {currentAttempt && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium px-2 py-1 rounded bg-zinc-800 border border-zinc-700 text-zinc-200">
              Attempt #{currentAttempt.attemptNumber}
            </span>
            <span
              className={`text-xs font-semibold px-2 py-1 rounded border uppercase tracking-wider ${
                currentAttempt.status === "IN_PROGRESS"
                  ? "bg-blue-950/60 border-blue-800/80 text-blue-300"
                  : currentAttempt.status === "EVALUATING"
                  ? "bg-amber-950/60 border-amber-800/80 text-amber-300"
                  : "bg-zinc-900 border-zinc-800 text-zinc-400"
              }`}
            >
              {currentAttempt.status.replace("_", " ")}
            </span>
          </div>
        )}
      </div>

      {/* PHASE 1: Empty Session State (No attempts yet) */}
      {!currentAttempt && (
        <div className="rounded border border-zinc-800 bg-zinc-900/50 p-8 space-y-6 text-center">
          <div className="max-w-md mx-auto space-y-2">
            <h2 className="text-base font-semibold text-zinc-100">
              {problem?.title}
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Practice this problem by designing the system and explaining your
              classes, relationships, trade-offs, and edge cases.
            </p>
          </div>

          <div className="py-2">
            <p className="text-xs text-zinc-500">No attempts yet.</p>
          </div>

          {createAttemptMutation.isError && (
            <div
              role="alert"
              className="max-w-md mx-auto p-3 rounded border border-red-800/80 bg-red-950/40 text-red-300 text-xs"
            >
              {createAttemptMutation.error?.message ||
                "Failed to start attempt. Please try again."}
            </div>
          )}

          <div>
            <Button
              variant="primary"
              onClick={handleStartAttempt}
              isLoading={createAttemptMutation.isPending}
              disabled={createAttemptMutation.isPending}
            >
              Start Attempt
            </Button>
          </div>
        </div>
      )}

      {/* Problem Requirements Drawer/Card (Visible during active attempt & evaluating) */}
      {currentAttempt && requirements.length > 0 && (
        <div className="rounded border border-zinc-800 bg-zinc-900/40 p-4 space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Problem Requirements
          </h3>
          <ol className="grid grid-cols-1 gap-2 text-xs text-zinc-300">
            {requirements
              .slice()
              .sort((a, b) => a.order - b.order)
              .map((req) => (
                <li key={req.id} className="flex items-start gap-2">
                  <span className="font-mono text-zinc-500 shrink-0">
                    {req.order}.
                  </span>
                  <span>{req.description}</span>
                </li>
              ))}
          </ol>
        </div>
      )}

      {/* PHASE 2: Active Attempt Workspace (IN_PROGRESS) */}
      {currentAttempt && currentAttempt.status === "IN_PROGRESS" && (
        <form onSubmit={handleSubmitSolution} className="space-y-6">
          {submitAttemptMutation.isError && (
            <div
              role="alert"
              className="p-4 rounded border border-red-800/80 bg-red-950/40 text-red-300 text-xs"
            >
              {submitAttemptMutation.error?.message ||
                "Failed to submit solution. Please verify all required fields."}
            </div>
          )}

          {/* 1. Requirements & Assumptions */}
          <Textarea
            label="Requirements & Assumptions"
            badge="Required"
            placeholder="Document your understanding of the requirements, system scope, and any working assumptions..."
            rows={5}
            value={requirementsAndAssumptions}
            onChange={(e) => {
              setRequirementsAndAssumptions(e.target.value);
              if (validationErrors.requirementsAndAssumptions) {
                setValidationErrors((prev) => ({
                  ...prev,
                  requirementsAndAssumptions: undefined,
                }));
              }
            }}
            error={validationErrors.requirementsAndAssumptions}
            disabled={submitAttemptMutation.isPending}
          />

          {/* 2. Design */}
          <Textarea
            label="Design"
            badge="Required"
            placeholder="Define your classes, interfaces, attributes, methods, and core object-oriented structures..."
            rows={10}
            value={design}
            onChange={(e) => {
              setDesign(e.target.value);
              if (validationErrors.design) {
                setValidationErrors((prev) => ({
                  ...prev,
                  design: undefined,
                }));
              }
            }}
            error={validationErrors.design}
            disabled={submitAttemptMutation.isPending}
          />

          {/* 3. Relationships & Interactions */}
          <Textarea
            label="Relationships & Interactions"
            badge="Required"
            placeholder="Explain how objects interact, inheritance/composition relationships, and key behavioral flows..."
            rows={6}
            value={relationshipsAndInteractions}
            onChange={(e) => {
              setRelationshipsAndInteractions(e.target.value);
              if (validationErrors.relationshipsAndInteractions) {
                setValidationErrors((prev) => ({
                  ...prev,
                  relationshipsAndInteractions: undefined,
                }));
              }
            }}
            error={validationErrors.relationshipsAndInteractions}
            disabled={submitAttemptMutation.isPending}
          />

          {/* 4. Trade-offs & Design Decisions */}
          <Textarea
            label="Trade-offs & Design Decisions"
            badge="Optional"
            placeholder="Explain why you chose this design, patterns considered or rejected, and architectural trade-offs..."
            rows={4}
            value={tradeoffsAndDesignDecisions}
            onChange={(e) => setTradeoffsAndDesignDecisions(e.target.value)}
            disabled={submitAttemptMutation.isPending}
          />

          {/* 5. Edge Cases & Extensibility */}
          <Textarea
            label="Edge Cases & Extensibility"
            badge="Optional"
            placeholder="Describe how your design handles boundary conditions, error cases, and future requirement changes..."
            rows={4}
            value={edgeCasesAndExtensibility}
            onChange={(e) => setEdgeCasesAndExtensibility(e.target.value)}
            disabled={submitAttemptMutation.isPending}
          />

          {/* Form Actions */}
          <div className="flex items-center justify-end pt-2">
            <Button
              type="submit"
              variant="primary"
              isLoading={submitAttemptMutation.isPending}
              disabled={submitAttemptMutation.isPending}
            >
              Submit Solution
            </Button>
          </div>
        </form>
      )}

      {/* PHASE 3: Evaluating State */}
      {currentAttempt && currentAttempt.status === "EVALUATING" && (
        <div className="rounded border border-zinc-800 bg-zinc-900/50 p-8 space-y-6 text-center">
          <div className="max-w-md mx-auto space-y-3">
            <h2 className="text-xl font-semibold text-zinc-100">
              Solution Submitted
            </h2>
            <p className="text-xs text-zinc-400 font-medium">
              Attempt #{currentAttempt.attemptNumber}
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded border border-amber-800/80 bg-amber-950/40 text-amber-300 text-xs font-semibold uppercase tracking-wider">
            <Spinner size="sm" className="border-amber-400 border-t-amber-200" />
            Status: EVALUATING
          </div>

          <div className="max-w-lg mx-auto text-xs text-zinc-400 space-y-2 leading-relaxed">
            <p>
              Your solution has been submitted successfully. It is being evaluated
              against the problem requirements and design criteria.
            </p>
            <p className="text-zinc-500">
              Your feedback will appear here once evaluation is complete.
            </p>
          </div>

          <div className="pt-4">
            <Link href="/problems">
              <Button variant="secondary" size="sm">
                Back to Problems
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
