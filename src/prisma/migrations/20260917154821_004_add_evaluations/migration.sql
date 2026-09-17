-- CreateEnum
CREATE TYPE "EvaluationConfidence" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- CreateTable
CREATE TABLE "EvaluationCriterion" (
    "id" TEXT NOT NULL,
    "evaluationId" TEXT NOT NULL,
    "rubricId" TEXT NOT NULL,
    "criterionName" TEXT NOT NULL,
    "criterionDescription" TEXT NOT NULL,
    "criterionWeight" INTEGER NOT NULL,
    "guidance" TEXT,
    "score" DOUBLE PRECISION NOT NULL,
    "confidence" "EvaluationConfidence" NOT NULL,
    "evidence" JSONB NOT NULL,
    "concerns" JSONB NOT NULL,
    "suggestion" TEXT NOT NULL,

    CONSTRAINT "EvaluationCriterion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Evaluation" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "overallScore" DOUBLE PRECISION NOT NULL,
    "strengths" JSONB NOT NULL,
    "improvementPriorities" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Evaluation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EvaluationCriterion_evaluationId_idx" ON "EvaluationCriterion"("evaluationId");

-- CreateIndex
CREATE INDEX "EvaluationCriterion_rubricId_idx" ON "EvaluationCriterion"("rubricId");

-- CreateIndex
CREATE UNIQUE INDEX "Evaluation_attemptId_key" ON "Evaluation"("attemptId");

-- AddForeignKey
ALTER TABLE "EvaluationCriterion" ADD CONSTRAINT "EvaluationCriterion_evaluationId_fkey" FOREIGN KEY ("evaluationId") REFERENCES "Evaluation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluationCriterion" ADD CONSTRAINT "EvaluationCriterion_rubricId_fkey" FOREIGN KEY ("rubricId") REFERENCES "EvaluationRubric"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evaluation" ADD CONSTRAINT "Evaluation_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "Attempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;
