import { NextRequest } from "next/server";

import { authenticate } from "@/server/shared/auth/authenticate";
import { parseBody } from "@/server/shared/http/parseBody";
import { created } from "@/server/shared/http/response";

import {
    createSubmissionService,
} from "./submissions.service";
import {
    submissionAttemptIdSchema,
    submissionSchema,
} from "./submissions.validation";

export async function createSubmissionController(
    request: NextRequest,
    context: { params?: Promise<{ id: string }> }
) {
    const user = await authenticate();

    const params = await context.params;
    const { id: attemptId } = submissionAttemptIdSchema.parse(params);

    const body = await parseBody(request, submissionSchema);

    const result = await createSubmissionService(
        user.sub,
        attemptId,
        body
    );

    return created(result);
}