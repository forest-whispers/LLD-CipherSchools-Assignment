import { NextRequest, NextResponse } from "next/server";

import { authenticate } from "@/server/shared/auth/authenticate";
import { parseBody } from "@/server/shared/http/parseBody";
import { created } from "@/server/shared/http/response";

import { createSessionService, listSessionsService } from "./lld-sessions.service";
import { createSessionSchema } from "./lld-sessions.validation";
import { ok } from "@/server/shared/http/response";
import { RouteContext } from "@/server/shared/http/route";

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

export async function listSessionsController(
    _request: NextRequest,
    _context: RouteContext
): Promise<NextResponse> {
    const user = await authenticate();

    const sessions = await listSessionsService(user.sub);

    return ok({
        sessions,
    });
}