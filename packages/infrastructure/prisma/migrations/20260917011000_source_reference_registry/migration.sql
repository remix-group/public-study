-- Canonical registry for every physical PDF discovered by the ingestion process.
-- This migration only creates metadata records' table; it does not insert or alter legal content.
CREATE TABLE "source_references" (
    "id" TEXT NOT NULL,
    "sourceHash" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL DEFAULT 'application/pdf',
    "byteSize" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "source_references_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "source_references_sourceHash_key" UNIQUE ("sourceHash"),
    CONSTRAINT "source_references_sourceHash_check" CHECK ("sourceHash" ~ '^[0-9a-f]{64}$'),
    CONSTRAINT "source_references_byteSize_check" CHECK ("byteSize" > 0),
    CONSTRAINT "source_references_mimeType_check" CHECK ("mimeType" = 'application/pdf')
);

CREATE INDEX "source_references_storageKey_idx" ON "source_references"("storageKey");
