import { NextRequest } from "next/server";

import { authenticate } from "@/server/shared/auth/authenticate";
import { created } from "@/server/shared/http/response";

import { createAttemptService } from "./attempts.service";
import { attemptSessionIdSchema } from "./attempts.validation";

export async function createAttemptController(
    _request: NextRequest,
    context: { params?: Promise<{ id: string }> }
) {
    const user = await authenticate();

    const params = await context.params;
    const { id: sessionId } = attemptSessionIdSchema.parse(params);

    const attempt = await createAttemptService(
        user.sub,
        sessionId
    );

    return created({
        attempt,
    });
}