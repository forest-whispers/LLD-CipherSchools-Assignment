import { z } from "zod";

export const submissionSchema = z.object({
    requirementsAndAssumptions: z.string().trim().min(1, "Requirements and assumptions are required"),
    design: z.string().trim().min(1, "Design is required"),
    relationshipsAndInteractions: z.string().trim().min(1, "Relationships and interactions are required"),
    tradeoffsAndDesignDecisions: z.string().trim().optional(),
    edgeCasesAndExtensibility: z.string().trim().optional(),
});

export const submissionAttemptIdSchema = z.object({
    id: z.string().min(1, "Attempt ID is required"),
});