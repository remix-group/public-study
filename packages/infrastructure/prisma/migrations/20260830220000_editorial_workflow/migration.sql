ALTER TABLE "students" ADD COLUMN "role" TEXT NOT NULL DEFAULT 'student';
ALTER TABLE "questions" ADD COLUMN "editorialStatus" TEXT NOT NULL DEFAULT 'draft',
ADD COLUMN "reviewedBy" TEXT,
ADD COLUMN "reviewedAt" TIMESTAMP(3);
UPDATE "questions" SET "editorialStatus" = 'published';
CREATE INDEX "questions_editorialStatus_idx" ON "questions"("editorialStatus");
