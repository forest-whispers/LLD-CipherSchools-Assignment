import { EvaluationInput } from "./evaluation.types";

export function runDeterministicChecks(
    input: Omit<EvaluationInput, "deterministicChecks">
) {
    const submission = input.submission;

    const requiredSectionsPresent =
        Boolean(submission.requirementsAndAssumptions.trim()) &&
        Boolean(submission.design.trim()) &&
        Boolean(submission.relationshipsAndInteractions.trim());

    const combinedSubmission = [
        submission.requirementsAndAssumptions,
        submission.design,
        submission.relationshipsAndInteractions,
        submission.tradeoffsAndDesignDecisions ?? "",
        submission.edgeCasesAndExtensibility ?? "",
    ]
        .join(" ")
        .toLowerCase();

    const requirements = input.problem.requirements.map((requirement) => ({
        requirementId: requirement.id,
        mentioned: requirement.description
            .toLowerCase()
            .split(/\s+/)
            .filter((word) => word.length > 3)
            .some((word) => combinedSubmission.includes(word)),
    }));

    return {
        requiredSectionsPresent,
        requirements,
    };
}