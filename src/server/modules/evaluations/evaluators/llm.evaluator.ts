import { GoogleGenAI } from "@google/genai";

import { env } from "@/server/shared/config/env";

import { evaluationResultSchema } from "../evaluation.validation";
import {
    EvaluationInput,
    EvaluationResult,
} from "../evaluation.types";
import { Evaluator } from "./evaluator";
import { buildEvaluationPrompt } from "./llm.evaluator.prompts";
import { InternalServerError } from "@/server/shared/errors/errors";

const ai = new GoogleGenAI({
    apiKey: env.GEMINI_API_KEY,
});

function cleanJson(raw: string): string {
    let text = raw.trim();
    if (text.startsWith("```")) {
        text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
    }
    return text;
}

const FALLBACK_MODELS = [
    env.GEMINI_MODEL,
    "gemini-3.5-flash-lite",
    "gemini-3.5-flash",
    "gemini-3.8-flash",
    "gemini-3.6-flash",
];

export const llmEvaluator: Evaluator = {
    async evaluate(input: EvaluationInput): Promise<EvaluationResult> {
        const prompt = buildEvaluationPrompt(input);
        const modelsToTry = Array.from(new Set(FALLBACK_MODELS.filter(Boolean)));

        let lastError: unknown = null;

        for (const model of modelsToTry) {
            try {
                const response = await ai.models.generateContent({
                    model,
                    contents: prompt,
                    config: {
                        responseMimeType: "application/json",
                    },
                });

                const text = response.text;
                if (!text) {
                    throw new InternalServerError(`Evaluation provider returned an empty response for model ${model}`);
                }

                const cleaned = cleanJson(text);
                const parsed = JSON.parse(cleaned);
                return evaluationResultSchema.parse(parsed);
            } catch (err: unknown) {
                lastError = err;
                console.warn(`Evaluation with model ${model} failed, attempting next fallback model:`, (err as Error)?.message || err);
            }
        }

        console.error("All evaluation candidate models failed:", lastError);
        throw new InternalServerError(
            `Evaluation failed across all available models: ${(lastError as Error)?.message || "Unknown error"}`
        );
    },
};