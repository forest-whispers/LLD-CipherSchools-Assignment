import { NextRequest } from "next/server";

import { authenticate } from "@/server/shared/auth/authenticate";
import { ok } from "@/server/shared/http/response";

import {
    getProblemByIdService,
    getProblemsService,
} from "./problems.service";
import { problemIdSchema } from "./problems.validation";

export async function getProblemsController() {
    await authenticate();

    const problems = await getProblemsService();

    return ok({
        problems,
    });
}

export async function getProblemByIdController(
    _request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    await authenticate();

    const params = await context.params;
    const { id } = problemIdSchema.parse(params);

    const problem = await getProblemByIdService(id);

    return ok({
        problem,
    });
}