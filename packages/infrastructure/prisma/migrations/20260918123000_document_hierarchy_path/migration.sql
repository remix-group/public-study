ALTER TABLE "legal_provisions"
ADD COLUMN "documentPath" TEXT NOT NULL DEFAULT '';

WITH RECURSIVE unit_tree AS (
  SELECT
    id,
    LPAD("order"::text, 10, '0') || '-' || id AS path
  FROM "legal_provisions"
  WHERE "parentProvisionId" IS NULL

  UNION ALL

  SELECT
    child.id,
    parent.path || '/' || LPAD(child."order"::text, 10, '0') || '-' || child.id
  FROM "legal_provisions" child
  JOIN unit_tree parent ON child."parentProvisionId" = parent.id
)
UPDATE "legal_provisions" provision
SET "documentPath" = unit_tree.path
FROM unit_tree
WHERE provision.id = unit_tree.id;

CREATE INDEX "legal_provisions_versionId_documentPath_idx"
ON "legal_provisions"("versionId", "documentPath");
