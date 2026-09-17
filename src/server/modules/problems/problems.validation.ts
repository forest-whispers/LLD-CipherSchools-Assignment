import { z } from "zod";

export const problemIdSchema = z.object({
    id: z.string().min(1, "Problem ID is required"),
});