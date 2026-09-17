"use client";

import React from "react";
import { Evaluation } from "../practice/practice.api";
import { Button } from "./Button";
import { Modal } from "./Modal";

export interface EvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  evaluation: Evaluation | null;
  attemptNumber?: number;
}

export function EvaluationModal({
  isOpen,
  onClose,
  evaluation,
  attemptNumber,
}: EvaluationModalProps) {
  if (!evaluation) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        attemptNumber ? `Attempt #${attemptNumber} Evaluation` : "Evaluation Review"
      }
      maxWidth="max-w-3xl"
    >
      <div className="space-y-6">
        {/* Overall Score Banner */}
        <div className="rounded border border-zinc-800 bg-zinc-950/60 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Evaluation Result
            </h4>
            <p className="text-xs text-zinc-500 mt-0.5">
              Comprehensive low-level design evaluation across all rubric criteria.
            </p>
          </div>
          <div className="flex items-baseline gap-1.5 self-start sm:self-auto px-3.5 py-1.5 rounded border border-zinc-800 bg-zinc-900/80">
            <span className="text-xs text-zinc-400 font-medium">Overall Score:</span>
            <span className="text-lg font-bold font-mono text-zinc-100">
              {evaluation.overallScore}
            </span>
            <span className="text-xs text-zinc-500 font-mono">/ 100</span>
          </div>
        </div>

        {/* Strengths */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Strengths
          </h4>
          {evaluation.strengths && evaluation.strengths.length > 0 ? (
            <ul className="space-y-1.5 text-xs text-zinc-300 list-disc list-inside bg-zinc-950/40 border border-zinc-800/80 rounded p-3.5">
              {evaluation.strengths.map((strength, idx) => (
                <li key={idx} className="leading-relaxed">
                  {strength}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-zinc-500 italic bg-zinc-950/40 border border-zinc-800/80 rounded p-3">
              No specific strengths noted.
            </p>
          )}
        </div>

        {/* Improvement Priorities */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Improvement Priorities
          </h4>
          {evaluation.improvementPriorities &&
          evaluation.improvementPriorities.length > 0 ? (
            <ul className="space-y-1.5 text-xs text-zinc-300 list-disc list-inside bg-zinc-950/40 border border-zinc-800/80 rounded p-3.5">
              {evaluation.improvementPriorities.map((priority, idx) => (
                <li key={idx} className="leading-relaxed">
                  {priority}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-zinc-500 italic bg-zinc-950/40 border border-zinc-800/80 rounded p-3">
              No improvement priorities identified.
            </p>
          )}
        </div>

        {/* Detailed Rubric Criteria */}
        <div className="space-y-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Detailed Rubric Criteria ({evaluation.criteria?.length || 0})
          </h4>

          <div className="space-y-4">
            {evaluation.criteria?.map((criterion, idx) => (
              <div
                key={criterion.id || criterion.rubricId || idx}
                className="rounded border border-zinc-800 bg-zinc-950/40 p-4 space-y-3"
              >
                {/* Criterion Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2 border-b border-zinc-800/80">
                  <div className="space-y-1">
                    <span className="text-sm font-semibold text-zinc-100">
                      {criterion.criterionName}
                    </span>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      {criterion.criterionDescription}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                    <span className="text-[11px] font-mono uppercase text-zinc-400 px-2 py-0.5 rounded border border-zinc-800 bg-zinc-900/60">
                      Confidence: {criterion.confidence}
                    </span>
                    <span className="text-xs font-mono font-semibold text-zinc-200 px-2 py-0.5 rounded border border-zinc-800 bg-zinc-900">
                      {criterion.score} / {criterion.criterionWeight}
                    </span>
                  </div>
                </div>

                {/* Evidence */}
                {criterion.evidence && criterion.evidence.length > 0 && (
                  <div className="space-y-1.5">
                    <h5 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                      Evidence
                    </h5>
                    <ul className="space-y-1 text-xs text-zinc-300 list-disc list-inside pl-1">
                      {criterion.evidence.map((item, eIdx) => (
                        <li key={eIdx} className="leading-relaxed">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Concerns */}
                {criterion.concerns && criterion.concerns.length > 0 && (
                  <div className="space-y-1.5">
                    <h5 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                      Concerns
                    </h5>
                    <ul className="space-y-1 text-xs text-zinc-300 list-disc list-inside pl-1">
                      {criterion.concerns.map((item, cIdx) => (
                        <li key={cIdx} className="leading-relaxed">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Suggestion */}
                {criterion.suggestion && (
                  <div className="space-y-1.5 pt-1">
                    <h5 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                      Suggestion
                    </h5>
                    <p className="text-xs text-zinc-300 bg-zinc-900/60 border border-zinc-800/60 p-2.5 rounded leading-relaxed">
                      {criterion.suggestion}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end pt-3 border-t border-zinc-800">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
