import { createRouteHandler } from "@/server/shared/http/route";

import { createAttemptController } from "@/server/modules/attempts/attempts.controller";

export const POST = createRouteHandler(createAttemptController);