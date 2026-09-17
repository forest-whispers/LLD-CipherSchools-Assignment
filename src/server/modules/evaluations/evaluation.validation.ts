import { z } from "zod";

export const evaluationResultSchema = z.object({
    criteria: z.array(
        z.object({
            rubricId: z.string().min(1),
            score: z.number().min(0),
            confidence: z.enum(["HIGH", "MEDIUM", "LOW"]),
            evidence: z.array(z.string()),
            concerns: z.array(z.string()),
            suggestion: z.string(),
        })
    ),
    strengths: z.array(z.string()),
    improvementPriorities: z.array(z.string()),
});

export type ValidatedEvaluationResult = z.infer<
    typeof evaluationResultSchema
>;