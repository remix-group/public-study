ALTER TABLE "cases"
  ADD COLUMN "kind" TEXT NOT NULL DEFAULT 'application',
  ADD COLUMN "editorialStatus" TEXT NOT NULL DEFAULT 'draft',
  ADD COLUMN "reviewedBy" TEXT,
  ADD COLUMN "reviewedAt" TIMESTAMP(3);

CREATE INDEX "cases_editorialStatus_idx" ON "cases"("editorialStatus");
