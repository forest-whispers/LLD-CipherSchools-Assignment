import { z } from "zod";

export const createSessionSchema = z.object({
    problemId: z.string().min(1, "Problem ID is required"),
});

export const sessionIdSchema = z.object({
    id: z.string().min(1, "Session ID is required"),
});