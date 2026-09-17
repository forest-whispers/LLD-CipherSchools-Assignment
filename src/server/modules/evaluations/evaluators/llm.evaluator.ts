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

export const llmEvaluator: Evaluator = {
    async evaluate(input: EvaluationInput): Promise<EvaluationResult> {
        const prompt = buildEvaluationPrompt(input);

        const response = await ai.models.generateContent({
            model: env.GEMINI_MODEL,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            },
        });

        const text = response.text;

        if (!text) {
            throw new InternalServerError("Evaluation provider returned an empty response");
        }

        const parsed = JSON.parse(text);

        return evaluationResultSchema.parse(parsed);
    },
};