import { z } from "zod";

export const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(5, "Password is required and it must be atleast 5 characters long"),
});