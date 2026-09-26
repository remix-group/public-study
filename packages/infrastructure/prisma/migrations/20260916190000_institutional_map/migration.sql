-- CreateTable
CREATE TABLE "institutional_entities" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "officialName" TEXT NOT NULL,
    "aliases" JSONB NOT NULL,
    "entityType" TEXT NOT NULL,
    "level" TEXT,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'confirmed',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "institutional_entities_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "institutional_claims" (
    "id" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "claimType" TEXT NOT NULL,
    "statement" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending_review',
    "confidence" TEXT NOT NULL DEFAULT 'probable',
    "sourceProvisionId" TEXT NOT NULL,
    "objectiveId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "institutional_claims_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "institutional_relations" (
    "id" TEXT NOT NULL,
    "sourceEntityId" TEXT NOT NULL,
    "targetEntityId" TEXT NOT NULL,
    "relationType" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "hierarchical" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'pending_review',
    "confidence" TEXT NOT NULL DEFAULT 'probable',
    "sourceProvisionId" TEXT NOT NULL,
    "objectiveId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "institutional_relations_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "institutional_entities_slug_key" ON "institutional_entities"("slug");
CREATE INDEX "institutional_entities_entityType_idx" ON "institutional_entities"("entityType");
CREATE INDEX "institutional_entities_status_idx" ON "institutional_entities"("status");
CREATE INDEX "institutional_claims_entityId_claimType_idx" ON "institutional_claims"("entityId", "claimType");
CREATE INDEX "institutional_claims_sourceProvisionId_idx" ON "institutional_claims"("sourceProvisionId");
CREATE INDEX "institutional_claims_objectiveId_idx" ON "institutional_claims"("objectiveId");
CREATE INDEX "institutional_claims_status_confidence_idx" ON "institutional_claims"("status", "confidence");
CREATE INDEX "institutional_relations_sourceEntityId_relationType_idx" ON "institutional_relations"("sourceEntityId", "relationType");
CREATE INDEX "institutional_relations_targetEntityId_idx" ON "institutional_relations"("targetEntityId");
CREATE INDEX "institutional_relations_sourceProvisionId_idx" ON "institutional_relations"("sourceProvisionId");
CREATE INDEX "institutional_relations_objectiveId_idx" ON "institutional_relations"("objectiveId");
CREATE INDEX "institutional_relations_hierarchical_status_idx" ON "institutional_relations"("hierarchical", "status");

ALTER TABLE "institutional_claims" ADD CONSTRAINT "institutional_claims_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "institutional_entities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "institutional_claims" ADD CONSTRAINT "institutional_claims_sourceProvisionId_fkey" FOREIGN KEY ("sourceProvisionId") REFERENCES "legal_provisions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "institutional_claims" ADD CONSTRAINT "institutional_claims_objectiveId_fkey" FOREIGN KEY ("objectiveId") REFERENCES "learning_objectives"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "institutional_relations" ADD CONSTRAINT "institutional_relations_sourceEntityId_fkey" FOREIGN KEY ("sourceEntityId") REFERENCES "institutional_entities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "institutional_relations" ADD CONSTRAINT "institutional_relations_targetEntityId_fkey" FOREIGN KEY ("targetEntityId") REFERENCES "institutional_entities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "institutional_relations" ADD CONSTRAINT "institutional_relations_sourceProvisionId_fkey" FOREIGN KEY ("sourceProvisionId") REFERENCES "legal_provisions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "institutional_relations" ADD CONSTRAINT "institutional_relations_objectiveId_fkey" FOREIGN KEY ("objectiveId") REFERENCES "learning_objectives"("id") ON DELETE SET NULL ON UPDATE CASCADE;
