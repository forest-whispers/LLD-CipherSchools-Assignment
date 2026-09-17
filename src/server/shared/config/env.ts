import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
    DATABASE_URL: z.string().min(5, "DATABASE_URL is required"),

    NODE_ENV: z
        .enum(["development", "production", "test"])
        .default("development"),

    PORT: z.coerce.number().default(3000),

    CLIENT_URL: z
        .string()
        .default("http://localhost:5173"),

        JWT_SECRET: z
        .string()
            .min(5, "JWT_SECRET must be at least 5 characters"),

    GEMINI_API_KEY: z.string().optional(),
    GEMINI_MODEL: z.string().default("gemini-3.5-flash-lite"),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
    console.error(
        "Invalid environment configuration:",
        parsedEnv.error.flatten()
    );

    throw new Error("Invalid environment configuration");
}

export const env = parsedEnv.data;