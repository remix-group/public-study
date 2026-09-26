-- Reclassify a parser artifact without deleting the stable provision id.
-- The original row is preserved in legal_source_quarantine before the merge.
INSERT INTO "legal_source_quarantine" ("id", "entityType", "entityId", "payload", "reason")
SELECT 'footnote-continuation-a6c6', 'legal_provision', id,
       jsonb_build_object(
         'unitType', "unitType", 'number', number, 'title', title,
         'content', content, 'parentProvisionId', "parentProvisionId",
         'status', status
       ),
       'El parser interpretó el marcador de nota al pie 1 como numeral jurídico independiente; el contenido continúa el literal a).'
FROM "legal_provisions"
WHERE id = 'a6c6f94b-a8bd-4790-bca1-19ed05cbbaa7'
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "legal_source_quarantine" ("id", "entityType", "entityId", "payload", "reason")
SELECT 'footnote-parent-f164', 'legal_provision', id,
       jsonb_build_object(
         'content', content, 'unitType', "unitType", 'number', number,
         'title', title, 'parentProvisionId', "parentProvisionId", 'status', status
       ),
       'Copia de reversión del literal a) antes de incorporar su continuación.'
FROM "legal_provisions"
WHERE id = 'f164499b-7613-4d38-bdc4-6a5cd9dbec46'
ON CONFLICT ("id") DO NOTHING;

UPDATE "legal_provisions" AS literal
SET "content" = rtrim(literal."content") || ' ' || regexp_replace(continuation."content", '^1\\.?\\s*', ''),
    "updatedAt" = CURRENT_TIMESTAMP
FROM "legal_provisions" AS continuation
WHERE literal.id = 'f164499b-7613-4d38-bdc4-6a5cd9dbec46'
  AND continuation.id = 'a6c6f94b-a8bd-4790-bca1-19ed05cbbaa7';

UPDATE "legal_provisions"
SET "unitType" = 'continuation',
    number = 'continuación de a)',
    title = 'Continuación del literal a)',
    "parentProvisionId" = 'f164499b-7613-4d38-bdc4-6a5cd9dbec46',
    status = 'merged_pending_review',
    "updatedAt" = CURRENT_TIMESTAMP
WHERE id = 'a6c6f94b-a8bd-4790-bca1-19ed05cbbaa7';
