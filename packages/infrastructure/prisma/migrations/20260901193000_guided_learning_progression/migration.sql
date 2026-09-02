ALTER TABLE "opecs" ADD COLUMN "process" TEXT NOT NULL DEFAULT '';
ALTER TABLE "opecs" ADD COLUMN "subprocess" TEXT NOT NULL DEFAULT '';

CREATE TABLE "blocks" (
  "id" TEXT NOT NULL,
  "competencyId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  "progressionThreshold" DOUBLE PRECISION NOT NULL DEFAULT 0.7,
  "status" TEXT NOT NULL DEFAULT 'active',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "blocks_pkey" PRIMARY KEY ("id")
);

INSERT INTO "blocks" ("id", "competencyId", "name", "description", "order", "updatedAt")
SELECT 'block-' || "id", "id", "name", 'Bloque curricular migrado', 1, CURRENT_TIMESTAMP
FROM "competencies";

ALTER TABLE "topics" ADD COLUMN "blockId" TEXT;
UPDATE "topics" SET "blockId" = 'block-' || "competencyId";
ALTER TABLE "topics" ALTER COLUMN "blockId" SET NOT NULL;
ALTER TABLE "topics" DROP CONSTRAINT "topics_competencyId_fkey";
ALTER TABLE "topics" DROP COLUMN "competencyId";

ALTER TABLE "learning_objectives" ADD COLUMN "critical" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "questions" ADD COLUMN "errorType" TEXT NOT NULL DEFAULT 'UNKNOWN_CONCEPT';
ALTER TABLE "mastery_states" ADD COLUMN "recall" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "mastery_states" ADD COLUMN "comprehension" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "mastery_states" ADD COLUMN "application" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "mastery_states" ADD COLUMN "sourceAwareness" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "mastery_states" ADD COLUMN "stability" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "study_sessions" ADD COLUMN "mode" TEXT NOT NULL DEFAULT 'PRACTICE';
ALTER TABLE "study_sessions" ADD COLUMN "focusObjectiveId" TEXT;

CREATE TABLE "topic_progress" (
  "id" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  "topicId" TEXT NOT NULL,
  "state" TEXT NOT NULL DEFAULT 'LOCKED',
  "unlockedAt" TIMESTAMP(3),
  "startedAt" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "masteredAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "topic_progress_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "blocks_competencyId_order_key" ON "blocks"("competencyId", "order");
CREATE UNIQUE INDEX "topic_progress_studentId_topicId_key" ON "topic_progress"("studentId", "topicId");
CREATE INDEX "topic_progress_studentId_state_idx" ON "topic_progress"("studentId", "state");

ALTER TABLE "blocks" ADD CONSTRAINT "blocks_competencyId_fkey" FOREIGN KEY ("competencyId") REFERENCES "competencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "topics" ADD CONSTRAINT "topics_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "blocks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "topic_progress" ADD CONSTRAINT "topic_progress_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "topic_progress" ADD CONSTRAINT "topic_progress_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;
