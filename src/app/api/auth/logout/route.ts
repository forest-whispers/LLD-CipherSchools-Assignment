import { createRouteHandler } from "@/server/shared/http/route";
import { logoutController } from "@/server/modules/auth/auth.controller";

export const POST = createRouteHandler(logoutController);