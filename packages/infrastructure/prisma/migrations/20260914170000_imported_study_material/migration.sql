-- Imported source material does not always contain a verified legal effective date.
-- Unknown dates remain NULL until editorial review instead of inventing legal metadata.
ALTER TABLE "legal_documents" ALTER COLUMN "effectiveFrom" DROP NOT NULL;
ALTER TABLE "legal_versions" ALTER COLUMN "effectiveFrom" DROP NOT NULL;
ALTER TABLE "legal_provisions" ALTER COLUMN "effectiveFrom" DROP NOT NULL;
