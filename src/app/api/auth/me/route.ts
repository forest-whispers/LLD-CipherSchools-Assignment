import { createRouteHandler } from "@/server/shared/http/route";
import { getCurrentUserController } from "@/server/modules/auth/auth.controller";

export const GET = createRouteHandler(getCurrentUserController);