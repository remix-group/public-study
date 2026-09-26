-- Remove processed content whose original PDFs are unavailable so it can be
-- ingested again when the authoritative files are supplied.
-- The affected rows are first archived in legal_source_quarantine, making the
-- operation reviewable and recoverable without touching other sources.

BEGIN;

CREATE TEMP TABLE _missing_source_documents ON COMMIT DROP AS
SELECT id
FROM legal_documents
WHERE id IN (
  'legal-estatuto-tributario',
  '51beb50a-f43d-412d-89cf-967e726e752b',
  '91d3fde7-378f-4863-81f3-fb0ab1ccfebb'
);

CREATE TEMP TABLE _missing_source_provisions ON COMMIT DROP AS
SELECT id
FROM legal_provisions
WHERE "documentId" IN (SELECT id FROM _missing_source_documents);

INSERT INTO legal_source_quarantine (id, "entityType", "entityId", payload, reason)
SELECT 'delete-missing-source:document:' || d.id, 'LegalDocument', d.id,
       to_jsonb(d), 'Contenido eliminado para reprocesar desde el PDF fuente original.'
FROM legal_documents d
WHERE d.id IN (SELECT id FROM _missing_source_documents)
ON CONFLICT (id) DO NOTHING;

INSERT INTO legal_source_quarantine (id, "entityType", "entityId", payload, reason)
SELECT 'delete-missing-source:version:' || v.id, 'LegalVersion', v.id,
       to_jsonb(v), 'Contenido eliminado para reprocesar desde el PDF fuente original.'
FROM legal_versions v
WHERE v."documentId" IN (SELECT id FROM _missing_source_documents)
ON CONFLICT (id) DO NOTHING;

INSERT INTO legal_source_quarantine (id, "entityType", "entityId", payload, reason)
SELECT 'delete-missing-source:provision:' || p.id, 'LegalProvision', p.id,
       to_jsonb(p), 'Contenido eliminado para reprocesar desde el PDF fuente original.'
FROM legal_provisions p
WHERE p.id IN (SELECT id FROM _missing_source_provisions)
ON CONFLICT (id) DO NOTHING;

INSERT INTO legal_source_quarantine (id, "entityType", "entityId", payload, reason)
SELECT 'delete-missing-source:evidence:' || e.id, 'Evidence', e.id,
       to_jsonb(e), 'Contenido eliminado para reprocesar desde el PDF fuente original.'
FROM evidences e
WHERE e."provisionId" IN (SELECT id FROM _missing_source_provisions)
ON CONFLICT (id) DO NOTHING;

DELETE FROM case_evidences
WHERE "evidenceId" IN (SELECT e.id FROM evidences e WHERE e."provisionId" IN (SELECT id FROM _missing_source_provisions));
DELETE FROM concept_evidences
WHERE "evidenceId" IN (SELECT e.id FROM evidences e WHERE e."provisionId" IN (SELECT id FROM _missing_source_provisions));
DELETE FROM question_evidences
WHERE "evidenceId" IN (SELECT e.id FROM evidences e WHERE e."provisionId" IN (SELECT id FROM _missing_source_provisions));
DELETE FROM evidences
WHERE "provisionId" IN (SELECT id FROM _missing_source_provisions);
DELETE FROM institutional_claims
WHERE "sourceProvisionId" IN (SELECT id FROM _missing_source_provisions);
DELETE FROM institutional_relations
WHERE "sourceProvisionId" IN (SELECT id FROM _missing_source_provisions);
DELETE FROM legal_references
WHERE "fromProvisionId" IN (SELECT id FROM _missing_source_provisions)
   OR "toProvisionId" IN (SELECT id FROM _missing_source_provisions)
   OR "toDocumentId" IN (SELECT id FROM _missing_source_documents);
DELETE FROM legal_relations
WHERE "sourceProvisionId" IN (SELECT id FROM _missing_source_provisions)
   OR "targetProvisionId" IN (SELECT id FROM _missing_source_provisions);
DELETE FROM legal_provisions
WHERE id IN (SELECT id FROM _missing_source_provisions);
DELETE FROM legal_versions
WHERE "documentId" IN (SELECT id FROM _missing_source_documents);
DELETE FROM legal_documents
WHERE id IN (SELECT id FROM _missing_source_documents);
DELETE FROM source_references
WHERE "sourceHash" IN (
  'aff64bd767d3a9119e601f9991a959adc79f19a3e757973053050b7ad9a966bc',
  'b04248919312cd620572cb4108f939ebb4d2c7a727b959d94f716da0ed8b23e9'
);

COMMIT;
