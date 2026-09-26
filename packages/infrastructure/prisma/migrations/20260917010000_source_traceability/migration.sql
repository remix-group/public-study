-- Additive traceability fields for source validation.
-- Existing legal content is intentionally not changed by this migration.
ALTER TABLE "opecs"
  ADD COLUMN "sourceHash" TEXT,
  ADD COLUMN "sourceFileKey" TEXT,
  ADD COLUMN "sourceVersion" TEXT;

ALTER TABLE "legal_versions"
  ADD COLUMN "sourceReferenceId" TEXT,
  ADD COLUMN "extractor" TEXT,
  ADD COLUMN "extractorVersion" TEXT;

ALTER TABLE "legal_provisions"
  ADD COLUMN "sourceReferenceId" TEXT,
  ADD COLUMN "pageStart" INTEGER,
  ADD COLUMN "pageEnd" INTEGER,
  ADD COLUMN "charStart" INTEGER,
  ADD COLUMN "charEnd" INTEGER,
  ADD COLUMN "extractor" TEXT,
  ADD COLUMN "extractorVersion" TEXT;

ALTER TABLE "evidences"
  ADD COLUMN "sourceReferenceId" TEXT,
  ADD COLUMN "pageStart" INTEGER,
  ADD COLUMN "pageEnd" INTEGER,
  ADD COLUMN "charStart" INTEGER,
  ADD COLUMN "charEnd" INTEGER,
  ADD COLUMN "extractor" TEXT,
  ADD COLUMN "extractorVersion" TEXT;

CREATE INDEX "legal_versions_sourceHash_idx" ON "legal_versions"("sourceHash");
CREATE INDEX "legal_versions_sourceReferenceId_idx" ON "legal_versions"("sourceReferenceId");
CREATE INDEX "legal_provisions_sourceReferenceId_pageStart_pageEnd_idx" ON "legal_provisions"("sourceReferenceId", "pageStart", "pageEnd");
