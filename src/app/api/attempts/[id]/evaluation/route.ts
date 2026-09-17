import { createRouteHandler } from "@/server/shared/http/route";
import { retryEvaluationController } from "@/server/modules/evaluations/evaluations.controller";

export const POST = createRouteHandler(retryEvaluationController);