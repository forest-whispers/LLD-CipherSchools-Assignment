import { NextRequest } from "next/server";

import { parseBody } from "@/server/shared/http/parseBody";
import { ok } from "@/server/shared/http/response";
import {
    clearAccessTokenCookie,
    setAccessTokenCookie,
} from "@/server/shared/lib/auth-cookie";
import { authenticate } from "@/server/shared/auth/authenticate";

import { loginSchema } from "./auth.validation";
import {
    getCurrentUserService,
    loginService,
} from "./auth.service";

export async function loginController(request: NextRequest) {
    const body = await parseBody(request, loginSchema);

    const result = await loginService(body);

    const response = ok({
        message: "Login successful",
        user: result.user,
    });

    setAccessTokenCookie(response, result.accessToken);

    return response;
}

export async function logoutController() {
    const response = ok({
        message: "Logout successful",
    });

    clearAccessTokenCookie(response);

    return response;
}

export async function getCurrentUserController() {
    const authenticatedUser = await authenticate();

    const result = await getCurrentUserService(authenticatedUser.sub);

    return ok(result);
}