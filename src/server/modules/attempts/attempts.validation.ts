import { z } from "zod";

export const attemptSessionIdSchema = z.object({
    id: z.string().min(1, "Session ID is required"),
});

export const attemptIdSchema = z.object({
    id: z.string().min(1, "Attempt ID is required"),
});