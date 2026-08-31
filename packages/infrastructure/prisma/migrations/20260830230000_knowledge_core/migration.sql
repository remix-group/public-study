ALTER TABLE "legal_documents"
ADD COLUMN "authority" TEXT NOT NULL DEFAULT 'DIAN',
ADD COLUMN "documentType" TEXT NOT NULL DEFAULT 'norm',
ADD COLUMN "officialUrl" TEXT NOT NULL DEFAULT '',
ADD COLUMN "contentHash" TEXT,
ADD COLUMN "originalFileKey" TEXT,
ADD COLUMN "pipelineStatus" TEXT NOT NULL DEFAULT 'RECEIVED';

UPDATE "legal_documents" SET "officialUrl" = "source" WHERE "officialUrl" = '';

CREATE TABLE "legal_versions" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveUntil" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'vigente',
    "sourceHash" TEXT,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "legal_versions_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "legal_provisions"
ADD COLUMN "versionId" TEXT,
ADD COLUMN "parentProvisionId" TEXT,
ADD COLUMN "unitType" TEXT NOT NULL DEFAULT 'article',
ADD COLUMN "anchor" TEXT NOT NULL DEFAULT '',
ADD COLUMN "order" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "validationStatus" TEXT NOT NULL DEFAULT 'pending',
ADD COLUMN "editorialStatus" TEXT NOT NULL DEFAULT 'draft';

UPDATE "legal_provisions" SET "anchor" = "number", "validationStatus" = 'approved', "editorialStatus" = 'published';

CREATE UNIQUE INDEX "legal_versions_documentId_label_key" ON "legal_versions"("documentId", "label");
CREATE INDEX "legal_versions_documentId_isCurrent_idx" ON "legal_versions"("documentId", "isCurrent");
CREATE INDEX "legal_provisions_versionId_order_idx" ON "legal_provisions"("versionId", "order");
CREATE INDEX "legal_provisions_editorialStatus_validationStatus_idx" ON "legal_provisions"("editorialStatus", "validationStatus");
ALTER TABLE "legal_versions" ADD CONSTRAINT "legal_versions_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "legal_documents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "legal_provisions" ADD CONSTRAINT "legal_provisions_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "legal_versions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "legal_provisions" ADD CONSTRAINT "legal_provisions_parentProvisionId_fkey" FOREIGN KEY ("parentProvisionId") REFERENCES "legal_provisions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
