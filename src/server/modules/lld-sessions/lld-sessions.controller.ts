import { NextRequest, NextResponse } from "next/server";

import { authenticate } from "@/server/shared/auth/authenticate";
import { parseBody } from "@/server/shared/http/parseBody";
import { created } from "@/server/shared/http/response";

import {
    createSessionService,
    getSessionService,
    listSessionsService,
} from "./lld-sessions.service";
import {
    createSessionSchema,
    sessionIdSchema,
} from "./lld-sessions.validation";
import { ok } from "@/server/shared/http/response";

export async function createSessionController(request: NextRequest) {
    const user = await authenticate();

    const body = await parseBody(request, createSessionSchema);

    const session = await createSessionService(
        user.sub,
        body.problemId
    );

    return created({
        session,
    });
}

export async function listSessionsController(): Promise<NextResponse> {
    const user = await authenticate();

    const sessions = await listSessionsService(user.sub);

    return ok({
        sessions,
    });
}

export async function getSessionController(
    _request: NextRequest,
    context: { params?: Promise<{ id: string }> }
) {
    const user = await authenticate();
    const params = await context.params;
    const { id: sessionId } = sessionIdSchema.parse(params);

    const session = await getSessionService(user.sub, sessionId);

    return ok({
        session,
    });
}