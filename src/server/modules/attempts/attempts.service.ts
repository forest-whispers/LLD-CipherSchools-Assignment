import { prisma } from "@/server/shared/config/prisma";
import { NotFoundError } from "@/server/shared/errors/errors";

export async function createAttemptService(
    userId: string,
    sessionId: string
) {
    const session = await prisma.lLDSession.findFirst({
        where: {
            id: sessionId,
            userId,
        },
        select: {
            id: true,
            _count: {
                select: {
                    attempts: true,
                },
            },
        },
    });

    if (!session) {
        throw new NotFoundError("Session not found");
    }

    const attempt = await prisma.attempt.create({
        data: {
            sessionId: session.id,
            attemptNumber: session._count.attempts + 1,
        },
        select: {
            id: true,
            attemptNumber: true,
            status: true,
            createdAt: true,
        },
    });

    return attempt;
}