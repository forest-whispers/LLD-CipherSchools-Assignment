import { createRouteHandler } from "@/server/shared/http/route";

import { createSubmissionController } from "@/server/modules/submissions/submissions.controller";

export const POST = createRouteHandler(createSubmissionController);