import { NextRequest } from "next/server";
import { authenticate } from "@/server/shared/auth/authenticate";
import { ok } from "@/server/shared/http/response";
import { submissionAttemptIdSchema } from "../submissions/submissions.validation";
import { retryEvaluationService } from "./evaluation.service";

export async function retryEvaluationController(
    _request: NextRequest,
    context: { params?: Promise<{ id: string }> }
) {
    const user = await authenticate();
    const params = await context.params;
    const { id: attemptId } = submissionAttemptIdSchema.parse(params);

    const result = await retryEvaluationService(user.sub, attemptId);
    return ok(result);
}
