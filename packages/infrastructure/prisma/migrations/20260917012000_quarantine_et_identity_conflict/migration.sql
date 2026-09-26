-- Reversible quarantine of the incorrect Estatuto Tributario source identity.
-- Legal text is preserved; only unsupported source metadata and approval state are quarantined.
CREATE TABLE "legal_source_quarantine" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "legal_source_quarantine_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "legal_source_quarantine_entityType_entityId_idx"
  ON "legal_source_quarantine"("entityType", "entityId");

INSERT INTO "legal_source_quarantine" ("id", "entityType", "entityId", "payload", "reason")
SELECT 'et-identity-document', 'legal_document', id,
       jsonb_build_object('contentHash', "contentHash", 'originalFileKey', "originalFileKey", 'pipelineStatus', "pipelineStatus"),
       'SHA-256 compartido con ABC Servicio al Ciudadano; PDF asignado no corresponde al Estatuto Tributario.'
FROM "legal_documents"
WHERE id = 'legal-estatuto-tributario'
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "legal_source_quarantine" ("id", "entityType", "entityId", "payload", "reason")
SELECT 'et-identity-version-' || id, 'legal_version', id,
       jsonb_build_object('sourceHash', "sourceHash", 'sourceReferenceId', "sourceReferenceId", 'extractor', extractor, 'extractorVersion', "extractorVersion"),
       'Versión sin PDF oficial verificable; fuente anterior correspondía al ABC de Servicio al Ciudadano.'
FROM "legal_versions"
WHERE "documentId" = 'legal-estatuto-tributario'
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "legal_source_quarantine" ("id", "entityType", "entityId", "payload", "reason")
SELECT 'et-identity-provision-' || id, 'legal_provision', id,
       jsonb_build_object('sourceReferenceId', "sourceReferenceId", 'pageStart', "pageStart", 'pageEnd', "pageEnd", 'charStart', "charStart", 'charEnd', "charEnd", 'extractor', extractor, 'extractorVersion', "extractorVersion", 'validationStatus', "validationStatus", 'editorialStatus', "editorialStatus"),
       'Artículo aprobado sin evidencia del PDF correcto del Estatuto Tributario.'
FROM "legal_provisions"
WHERE "documentId" = 'legal-estatuto-tributario'
ON CONFLICT ("id") DO NOTHING;

UPDATE "legal_documents"
SET "contentHash" = NULL, "originalFileKey" = NULL, "pipelineStatus" = 'REVIEW', "updatedAt" = CURRENT_TIMESTAMP
WHERE id = 'legal-estatuto-tributario';

UPDATE "legal_versions"
SET "sourceHash" = NULL, "sourceReferenceId" = NULL, extractor = NULL, "extractorVersion" = NULL, "updatedAt" = CURRENT_TIMESTAMP
WHERE "documentId" = 'legal-estatuto-tributario';

UPDATE "legal_provisions"
SET "sourceReferenceId" = NULL, "pageStart" = NULL, "pageEnd" = NULL, "charStart" = NULL, "charEnd" = NULL,
    extractor = NULL, "extractorVersion" = NULL, "validationStatus" = 'pending', "editorialStatus" = 'draft', "updatedAt" = CURRENT_TIMESTAMP
WHERE "documentId" = 'legal-estatuto-tributario';

UPDATE "evidences" e
SET "sourceReferenceId" = NULL, "pageStart" = NULL, "pageEnd" = NULL, "charStart" = NULL, "charEnd" = NULL,
    extractor = NULL, "extractorVersion" = NULL, "updatedAt" = CURRENT_TIMESTAMP
FROM "legal_provisions" p
WHERE e."provisionId" = p.id AND p."documentId" = 'legal-estatuto-tributario';
