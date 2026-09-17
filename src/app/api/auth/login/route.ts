import { createRouteHandler } from "@/server/shared/http/route";
import { loginController } from "@/server/modules/auth/auth.controller";

export const POST = createRouteHandler(loginController);