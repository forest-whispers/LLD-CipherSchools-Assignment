import { prisma } from "@/server/shared/config/prisma";
import { comparePassword, hashPassword } from "@/server/shared/lib/bcrypt";
import { generateAccessToken } from "@/server/shared/lib/jwt";
import { UnauthorizedError } from "@/server/shared/errors/errors";

import type { LoginInput } from "./auth.types";

export const loginService = async (input: LoginInput) => {
    const email = input.email.trim().toLowerCase();

    const existingUser = await prisma.user.findUnique({
        where: {
            email,
        },
    });

    let user = existingUser;

    if (!user) {
        const passwordHash = await hashPassword(input.password);

        user = await prisma.user.create({
            data: {
                email,
                passwordHash,
            },
        });
    } else {
        const passwordMatches = await comparePassword(
            input.password,
            user.passwordHash
        );

        if (!passwordMatches) {
            throw new UnauthorizedError("Invalid email or password");
        }
    }

    const accessToken = generateAccessToken({
        sub: user.id,
        email: user.email,
    });

    return {
        accessToken,
        user: {
            email: user.email,
        },
    };
}

export const getCurrentUserService = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },
        select: {
            email: true,
        },
    });

    if (!user) {
        throw new UnauthorizedError("User not found");
    }

    return {
        user,
    };
}