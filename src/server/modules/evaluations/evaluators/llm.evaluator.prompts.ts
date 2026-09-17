import { EvaluationInput } from "../evaluation.types";

export function buildEvaluationPrompt(input: EvaluationInput) {
    return `
You are evaluating a learner's Low-Level Design solution.

Evaluate the submission strictly against the provided problem requirements
and evaluation rubric.

Do not invent classes, interfaces, relationships, patterns, requirements,
implementation details, or evidence that are not present in the submission.

If the submission does not provide enough evidence for a judgment, explicitly
state that the evidence is insufficient.

The score for each criterion must be between 0 and that criterion's weight.

Return only valid JSON matching this structure:

{
  "criteria": [
    {
      "rubricId": "string",
      "score": 0,
      "confidence": "HIGH | MEDIUM | LOW",
      "evidence": ["string"],
      "concerns": ["string"],
      "suggestion": "string"
    }
  ],
  "strengths": ["string"],
  "improvementPriorities": ["string"]
}

Every supplied rubric must have exactly one criterion result.

PROBLEM

Title:
${input.problem.title}

Description:
${input.problem.description}

Requirements:
${input.problem.requirements
            .map(
                (requirement) =>
                    `${requirement.id}: ${requirement.description}`
            )
            .join("\n")}

EVALUATION RUBRICS

${input.rubrics
            .map(
                (rubric) => `
Rubric ID: ${rubric.rubricId}
Name: ${rubric.name}
Description: ${rubric.description}
Weight: ${rubric.weight}
Problem-specific guidance: ${rubric.guidance ?? "None"}
`
            )
            .join("\n")}

DETERMINISTIC SIGNALS

Required sections present:
${input.deterministicChecks.requiredSectionsPresent}

Requirement mention signals:
${input.deterministicChecks.requirements
            .map(
                (requirement) =>
                    `${requirement.requirementId}: ${requirement.mentioned}`
            )
            .join("\n")}

LEARNER SUBMISSION

Requirements and Assumptions:
${input.submission.requirementsAndAssumptions}

Design:
${input.submission.design}

Relationships and Interactions:
${input.submission.relationshipsAndInteractions}

Trade-offs and Design Decisions:
${input.submission.tradeoffsAndDesignDecisions ?? "Not provided"}

Edge Cases and Extensibility:
${input.submission.edgeCasesAndExtensibility ?? "Not provided"}

EVALUATION RULES

1. Evaluate only what the learner actually submitted.
2. Do not give credit for a design element that was not described.
3. Do not penalize the learner for not using a particular design pattern
   unless the rubric specifically makes it relevant.
4. Do not assume implementation details that are not stated.
5. Evidence must refer to actual content in the submission.
6. Concerns should identify concrete weaknesses or missing reasoning.
7. Suggestions should be actionable and relevant to the criterion.
8. Use the deterministic requirement signals only as supporting information.
9. They are not proof that the learner understood a requirement.
10. Every rubric criterion must be evaluated.
`;
}