import { prisma } from "@/server/shared/config/prisma";
import { NotFoundError } from "@/server/shared/errors/errors";

export const getProblemsService = async() => {
    return prisma.problem.findMany({
        select: {
            id: true,
            title: true,
            description: true,
            difficulty: true,
        },
        orderBy: {
            createdAt: "asc",
        },
    });
}

export const  getProblemByIdService = async(id: string) => {
    const problem = await prisma.problem.findUnique({
        where: {
            id,
        },
        select: {
            id: true,
            title: true,
            description: true,
            difficulty: true,
            requirements: {
                select: {
                    id: true,
                    description: true,
                    order: true,
                },
                orderBy: {
                    order: "asc",
                },
            },
        },
    });

    if (!problem) {
        throw new NotFoundError("Problem not found");
    }

    return problem;
}