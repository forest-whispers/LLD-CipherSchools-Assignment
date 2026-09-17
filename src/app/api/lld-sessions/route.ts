import { createRouteHandler } from "@/server/shared/http/route";

import { createSessionController, listSessionsController } from "@/server/modules/lld-sessions/lld-sessions.controller";

export const POST = createRouteHandler(createSessionController);
export const GET = createRouteHandler(listSessionsController);