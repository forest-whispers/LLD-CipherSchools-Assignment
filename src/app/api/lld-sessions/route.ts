import { createRouteHandler } from "@/server/shared/http/route";

import { createSessionController } from "@/server/modules/lld-sessions/lld-sessions.controller";

export const POST = createRouteHandler(createSessionController);