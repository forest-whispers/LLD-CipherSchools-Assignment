import jwt from "jsonwebtoken";

import { env } from "@/server/shared/config/env";
import { UnauthorizedError } from "@/server/shared/errors/errors";

export type AccessTokenPayload = {
    sub: string;
    email: string;
};

export function generateAccessToken(payload: AccessTokenPayload): string {
    return jwt.sign(
        {
            email: payload.email,
        },
        env.JWT_SECRET,
        {
            subject: payload.sub,
            expiresIn: "1d",
        }
    );
}

export function verifyAccessToken(token: string): AccessTokenPayload {
    try {
        const payload = jwt.verify(token, env.JWT_SECRET);

        if (
            typeof payload !== "object" ||
            typeof payload.sub !== "string" ||
            typeof payload.email !== "string"
        ) {
            throw new UnauthorizedError("Invalid access token");
        }

        return {
            sub: payload.sub,
            email: payload.email,
        };
    } catch (error) {
        if (error instanceof UnauthorizedError) {
            throw error;
        }

        throw new UnauthorizedError("Invalid or expired access token");
    }
}