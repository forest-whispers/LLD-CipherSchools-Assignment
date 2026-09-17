import { prisma } from "@/server/shared/config/prisma";
import { NotFoundError } from "@/server/shared/errors/errors";

export async function createSessionService(
    userId: string,
    problemId: string
) {
    const problem = await prisma.problem.findUnique({
        where: {
            id: problemId,
        },
        select: {
            id: true,
            title: true,
            difficulty: true,
        },
    });

    if (!problem) {
        throw new NotFoundError("Problem not found");
    }

    const session = await prisma.lLDSession.create({
        data: {
            userId,
            problemId,
        },
        select: {
            id: true,
            problemId: true,
            problem: {
                select: {
                    id: true,
                    title: true,
                    difficulty: true,
                },
            },
            attempts: {
                select: {
                    id: true,
                    attemptNumber: true,
                    status: true,
                    createdAt: true,
                },
                orderBy: {
                    attemptNumber: "asc",
                },
            },
        },
    });

    return session;
}