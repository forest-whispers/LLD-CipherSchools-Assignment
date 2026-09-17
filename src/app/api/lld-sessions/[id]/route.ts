import { createRouteHandler } from "@/server/shared/http/route";
import { getSessionController } from "@/server/modules/lld-sessions/lld-sessions.controller";

export const GET = createRouteHandler(getSessionController);