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
  Modal,
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

  // Modal visibility & attempt submitted state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmittedInModal, setIsSubmittedInModal] = useState(false);

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

  // Active attempt in progress
  const attempts = session?.attempts || [];
  const activeAttempt =
    attempts.find((att) => att.status === "IN_PROGRESS") || null;

  // History / Transcript
  const messageTranscript = session?.messageTranscript || [];

  // Reset form when modal opens for a new attempt
  const handleOpenAttemptModal = () => {
    if (activeAttempt) {
      // Reopen active in-progress attempt
      setIsSubmittedInModal(false);
      setIsModalOpen(true);
    } else {
      // Create a new attempt
      setIsSubmittedInModal(false);
      setRequirementsAndAssumptions("");
      setDesign("");
      setRelationshipsAndInteractions("");
      setTradeoffsAndDesignDecisions("");
      setEdgeCasesAndExtensibility("");
      setValidationErrors({});
      createAttemptMutation.mutate(undefined, {
        onSuccess: () => {
          setIsModalOpen(true);
        },
      });
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsSubmittedInModal(false);
  };

  // Handle attempt submission
  const handleSubmitSolution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAttempt || submitAttemptMutation.isPending) return;

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
    submitAttemptMutation.mutate(
      {
        attemptId: activeAttempt.id,
        input: {
          requirementsAndAssumptions: requirementsAndAssumptions.trim(),
          design: design.trim(),
          relationshipsAndInteractions: relationshipsAndInteractions.trim(),
          tradeoffsAndDesignDecisions:
            tradeoffsAndDesignDecisions.trim() || undefined,
          edgeCasesAndExtensibility:
            edgeCasesAndExtensibility.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          setIsSubmittedInModal(true);
        },
      }
    );
  };

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-zinc-800">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold text-zinc-100">
              {problem?.title || "Low-Level Design Practice"}
            </h1>
            {problem?.difficulty && (
              <DifficultyBadge difficulty={problem.difficulty} />
            )}
          </div>
          <p className="text-xs text-zinc-400">
            Design history and practice attempts for this problem.
          </p>
        </div>

        {/* Primary Action Button */}
        <div>
          <Button
            variant="primary"
            onClick={handleOpenAttemptModal}
            isLoading={createAttemptMutation.isPending}
            disabled={createAttemptMutation.isPending}
          >
            {activeAttempt
              ? `Resume Attempt #${activeAttempt.attemptNumber}`
              : "Start Attempt"}
          </Button>
        </div>
      </div>

      {/* Problem Requirements Card (Collapsible) */}
      {requirements.length > 0 && (
        <details className="group rounded border border-zinc-800 bg-zinc-900/40 p-4 open:pb-4 transition-colors">
          <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center justify-between select-none">
            <span>Problem Requirements ({requirements.length})</span>
            <span className="text-zinc-500 group-open:rotate-180 transition-transform text-[10px]">
              ▼
            </span>
          </summary>
          <ol className="mt-3 grid grid-cols-1 gap-2 text-xs text-zinc-300 pt-2 border-t border-zinc-800/60">
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
        </details>
      )}

      {/* PRACTICE HISTORY SECTION */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-zinc-200 tracking-wide uppercase">
          Practice History
        </h2>

        {messageTranscript.length === 0 && (
          <div className="rounded border border-zinc-800 bg-zinc-900/40 p-8 text-center space-y-3">
            <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
              Practice this problem by designing the system and explaining your
              classes, relationships, trade-offs, and edge cases.
            </p>
            <p className="text-xs text-zinc-500">No attempts yet.</p>
            {!activeAttempt && (
              <div className="pt-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleOpenAttemptModal}
                  isLoading={createAttemptMutation.isPending}
                  disabled={createAttemptMutation.isPending}
                >
                  Start Attempt
                </Button>
              </div>
            )}
          </div>
        )}

        {messageTranscript.length > 0 && (
          <div className="space-y-6">
            {messageTranscript.map((item, idx) => (
              <div
                key={item.submission.id || idx}
                className="rounded border border-zinc-800 bg-zinc-900/40 p-5 space-y-5"
              >
                {/* Item Header */}
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm font-semibold text-zinc-100">
                      Attempt #{item.submission.attemptNumber || idx + 1}
                    </span>
                    <span className="text-xs text-zinc-500">Submitted</span>
                  </div>
                  <div className="text-[11px] text-zinc-500 font-mono">
                    {item.submission.submittedAt
                      ? new Date(item.submission.submittedAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : ""}
                  </div>
                </div>

                {/* Submitted Content in Review Format */}
                <div className="space-y-4 text-xs leading-relaxed">
                  <div>
                    <h4 className="font-semibold text-zinc-400 mb-1">
                      Requirements & Assumptions
                    </h4>
                    <p className="text-zinc-300 whitespace-pre-line bg-zinc-900/60 p-3 rounded border border-zinc-800/60 font-mono">
                      {item.submission.requirementsAndAssumptions}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-zinc-400 mb-1">Design</h4>
                    <p className="text-zinc-300 whitespace-pre-line bg-zinc-900/60 p-3 rounded border border-zinc-800/60 font-mono">
                      {item.submission.design}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-zinc-400 mb-1">
                      Relationships & Interactions
                    </h4>
                    <p className="text-zinc-300 whitespace-pre-line bg-zinc-900/60 p-3 rounded border border-zinc-800/60 font-mono">
                      {item.submission.relationshipsAndInteractions}
                    </p>
                  </div>

                  {item.submission.tradeoffsAndDesignDecisions && (
                    <div>
                      <h4 className="font-semibold text-zinc-400 mb-1">
                        Trade-offs & Design Decisions
                      </h4>
                      <p className="text-zinc-300 whitespace-pre-line bg-zinc-900/60 p-3 rounded border border-zinc-800/60 font-mono">
                        {item.submission.tradeoffsAndDesignDecisions}
                      </p>
                    </div>
                  )}

                  {item.submission.edgeCasesAndExtensibility && (
                    <div>
                      <h4 className="font-semibold text-zinc-400 mb-1">
                        Edge Cases & Extensibility
                      </h4>
                      <p className="text-zinc-300 whitespace-pre-line bg-zinc-900/60 p-3 rounded border border-zinc-800/60 font-mono">
                        {item.submission.edgeCasesAndExtensibility}
                      </p>
                    </div>
                  )}
                </div>

                {/* Evaluation State Section */}
                <div className="pt-3 border-t border-zinc-800/80">
                  <div className="flex items-center gap-2 text-xs text-amber-300 bg-amber-950/30 border border-amber-800/40 px-3 py-2 rounded">
                    <Spinner size="sm" className="border-amber-400 border-t-amber-200 shrink-0" />
                    <span>Evaluation: Evaluating...</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ATTEMPT MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={
          isSubmittedInModal
            ? "Solution Submitted"
            : activeAttempt
            ? `Attempt #${activeAttempt.attemptNumber}`
            : "New Attempt"
        }
        maxWidth="max-w-3xl"
      >
        {isSubmittedInModal ? (
          /* Evaluating State inside Modal */
          <div className="space-y-5 text-center py-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded border border-amber-800/80 bg-amber-950/40 text-amber-300 text-xs font-semibold uppercase tracking-wider">
              <Spinner size="sm" className="border-amber-400 border-t-amber-200" />
              Status: EVALUATING
            </div>

            <div className="max-w-md mx-auto space-y-2 text-xs text-zinc-300 leading-relaxed">
              <p className="text-sm font-medium text-zinc-100">
                Your solution has been submitted successfully.
              </p>
              <p className="text-zinc-400">We are evaluating your submission.</p>
              <p className="text-zinc-500 pt-2">
                You can close this window and continue working on another attempt
                while we finish your evaluation.
              </p>
            </div>

            <div className="pt-4">
              <Button variant="secondary" size="sm" onClick={handleCloseModal}>
                Close
              </Button>
            </div>
          </div>
        ) : (
          /* Active Attempt Form inside Modal */
          <div className="space-y-5">
            {/* Modal Requirements helper (Collapsible) */}
            {requirements.length > 0 && (
              <details className="rounded border border-zinc-800 bg-zinc-950/60 p-3 text-xs">
                <summary className="cursor-pointer font-medium text-zinc-400 hover:text-zinc-200 select-none flex items-center justify-between">
                  <span>View Problem Requirements ({requirements.length})</span>
                  <span className="text-[10px] text-zinc-500">Toggle</span>
                </summary>
                <ol className="mt-2.5 space-y-1 text-zinc-300 pt-2 border-t border-zinc-800/60">
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
              </details>
            )}

            <form onSubmit={handleSubmitSolution} className="space-y-4">
              {submitAttemptMutation.isError && (
                <div
                  role="alert"
                  className="p-3 rounded border border-red-800/80 bg-red-950/40 text-red-300 text-xs"
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
                rows={4}
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
                rows={8}
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
                rows={5}
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

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCloseModal}
                  disabled={submitAttemptMutation.isPending}
                >
                  Cancel
                </Button>
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
          </div>
        )}
      </Modal>
    </div>
  );
}
