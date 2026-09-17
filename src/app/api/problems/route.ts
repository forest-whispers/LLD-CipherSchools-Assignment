import { createRouteHandler } from "@/server/shared/http/route";

import { getProblemsController } from "@/server/modules/problems/problems.controller";

export const GET = createRouteHandler(getProblemsController);