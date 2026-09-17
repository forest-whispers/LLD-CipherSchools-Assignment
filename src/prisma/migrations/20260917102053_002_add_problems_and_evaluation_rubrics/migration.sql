-- CreateEnum
CREATE TYPE "ProblemDifficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- CreateTable
CREATE TABLE "Problem" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "difficulty" "ProblemDifficulty" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Problem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProblemRequirement" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "problemId" TEXT NOT NULL,

    CONSTRAINT "ProblemRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvaluationRubric" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "weight" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EvaluationRubric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProblemEvaluationRubric" (
    "problemId" TEXT NOT NULL,
    "rubricId" TEXT NOT NULL,
    "guidance" TEXT,

    CONSTRAINT "ProblemEvaluationRubric_pkey" PRIMARY KEY ("problemId","rubricId")
);

-- CreateIndex
CREATE INDEX "ProblemRequirement_problemId_idx" ON "ProblemRequirement"("problemId");

-- CreateIndex
CREATE UNIQUE INDEX "ProblemRequirement_problemId_order_key" ON "ProblemRequirement"("problemId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "EvaluationRubric_name_key" ON "EvaluationRubric"("name");

-- CreateIndex
CREATE INDEX "ProblemEvaluationRubric_rubricId_idx" ON "ProblemEvaluationRubric"("rubricId");

-- AddForeignKey
ALTER TABLE "ProblemRequirement" ADD CONSTRAINT "ProblemRequirement_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProblemEvaluationRubric" ADD CONSTRAINT "ProblemEvaluationRubric_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProblemEvaluationRubric" ADD CONSTRAINT "ProblemEvaluationRubric_rubricId_fkey" FOREIGN KEY ("rubricId") REFERENCES "EvaluationRubric"("id") ON DELETE CASCADE ON UPDATE CASCADE;
