import {
    EvaluationInput,
    EvaluationResult,
} from "../evaluation.types";

export interface Evaluator {
    evaluate(input: EvaluationInput): Promise<EvaluationResult>;
}