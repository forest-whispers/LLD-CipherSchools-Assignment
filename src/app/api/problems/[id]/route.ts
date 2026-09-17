import { createRouteHandler } from "@/server/shared/http/route";

import { getProblemByIdController } from "@/server/modules/problems/problems.controller";

export const GET = createRouteHandler(getProblemByIdController);