export type EvaluationConfidence = "HIGH" | "MEDIUM" | "LOW";

export type EvaluationInput = {
    problem: {
        title: string;
        description: string;
        requirements: {
            id: string;
            description: string;
            order: number;
        }[];
    };
    rubrics: {
        rubricId: string;
        name: string;
        description: string;
        weight: number;
        guidance: string | null;
    }[];
    submission: {
        requirementsAndAssumptions: string;
        design: string;
        relationshipsAndInteractions: string;
        tradeoffsAndDesignDecisions: string | null;
        edgeCasesAndExtensibility: string | null;
    };
    deterministicChecks: {
        requiredSectionsPresent: boolean;
        requirements: {
            requirementId: string;
            mentioned: boolean;
        }[];
    };
};

export type EvaluationCriterionResult = {
    rubricId: string;
    score: number;
    confidence: EvaluationConfidence;
    evidence: string[];
    concerns: string[];
    suggestion: string;
};

export type EvaluationResult = {
    criteria: EvaluationCriterionResult[];
    strengths: string[];
    improvementPriorities: string[];
};