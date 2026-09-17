import { NextResponse } from "next/server";

import { env } from "@/server/shared/config/env";
import { constants } from "@/server/shared/config/constants";

export function setAccessTokenCookie(
    response: NextResponse,
    token: string
) {
    response.cookies.set(constants.ACCESS_COOKIE_NAME, token, {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: "lax",
        path: constants.ACCESS_COOKIE_PATH,
        maxAge: constants.ACCESS_COOKIE_MAX_AGE / 1000,
    });
}

export function clearAccessTokenCookie(response: NextResponse) {
    response.cookies.set(constants.ACCESS_COOKIE_NAME, "", {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: "lax",
        path: constants.ACCESS_COOKIE_PATH,
        maxAge: 0,
    });
}