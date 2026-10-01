ALTER TABLE "legal_documents"
ADD COLUMN "originalFileName" TEXT;

ALTER TABLE "legal_provisions"
ADD COLUMN "extractionIssues" JSONB;

CREATE INDEX "legal_provisions_documentId_order_anchor_id_idx"
ON "legal_provisions"("documentId", "order", "anchor", "id");
