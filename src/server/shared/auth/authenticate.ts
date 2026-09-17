import { cookies } from "next/headers";

import { constants } from "@/server/shared/config/constants";
import { UnauthorizedError } from "@/server/shared/errors/errors";
import { verifyAccessToken } from "@/server/shared/lib/jwt";

export async function authenticate() {
    const cookieStore = await cookies();

    const token = cookieStore.get(constants.ACCESS_COOKIE_NAME)?.value;

    if (!token) {
        throw new UnauthorizedError("Authentication required");
    }

    return verifyAccessToken(token);
}