/**
 * Repository port interfaces for the Legal subdomain.
 */

import type { EntityId } from "../shared/types.js";
import type {
  LegalDocument,
  LegalProvision,
  LegalRelation,
  LegalReference,
  Evidence,
} from "../legal/entities.js";

export interface LegalDocumentRepository {
  findById(id: EntityId): Promise<LegalDocument | null>;
  findAll(): Promise<LegalDocument[]>;
  create(data: Omit<LegalDocument, "id" | "createdAt" | "updatedAt">): Promise<LegalDocument>;
}

export interface LegalProvisionRepository {
  findById(id: EntityId): Promise<LegalProvision | null>;
  findByDocumentId(documentId: EntityId): Promise<LegalProvision[]>;
  create(data: Omit<LegalProvision, "id" | "createdAt" | "updatedAt">): Promise<LegalProvision>;
}

export interface LegalRelationRepository {
  findBySourceProvisionId(provisionId: EntityId): Promise<LegalRelation[]>;
  findByTargetProvisionId(provisionId: EntityId): Promise<LegalRelation[]>;
  create(data: Omit<LegalRelation, "id" | "createdAt" | "updatedAt">): Promise<LegalRelation>;
}

export interface EvidenceRepository {
  findById(id: EntityId): Promise<Evidence | null>;
  findByProvisionId(provisionId: EntityId): Promise<Evidence[]>;
  create(data: Omit<Evidence, "id" | "createdAt" | "updatedAt">): Promise<Evidence>;
}
