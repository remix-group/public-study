/**
 * Legal domain entities.
 *
 * Models legal documents, provisions, and their relationships.
 * Scoped to a controlled set of sources for the MVP (Cobro Coactivo).
 *
 * See: docs/domain/legal-domain.md
 */

import type { BaseEntity, EntityId } from "../shared/types.js";

/** Status of a legal provision in time. */
export type LegalStatus = "vigente" | "derogado" | "modificado" | "suspendido";
export type DocumentPipelineStatus =
  | "RECEIVED" | "VALIDATED" | "EXTRACTED" | "PARSED" | "ENRICHED"
  | "INDEXED" | "DRAFT_KNOWLEDGE" | "REVIEW_REQUIRED" | "PUBLISHED" | "FAILED";
export type LegalUnitType = "title" | "chapter" | "article" | "paragraph" | "subparagraph" | "numeral" | "annex";
export type ValidationStatus = "pending" | "review_required" | "approved" | "rejected";

/** Typed, directional relationship between legal provisions. */
export type LegalRelationType =
  | "MODIFIES"
  | "ADDS"
  | "REPEALS"
  | "REPLACES"
  | "REFERENCES"
  | "REGULATES";

/**
 * A legal body of law (e.g. Estatuto Tributario, Ley 1066 de 2006).
 */
export interface LegalDocument extends BaseEntity {
  readonly title: string;
  readonly source: string;
  readonly authority: string;
  readonly documentType: string;
  readonly officialUrl: string;
  readonly contentHash: string | null;
  readonly originalFileKey: string | null;
  readonly pipelineStatus: DocumentPipelineStatus;
  readonly effectiveFrom: Date;
  readonly effectiveUntil: Date | null;
  readonly status: LegalStatus;
}

/** Immutable temporal edition of a legal document. */
export interface LegalVersion extends BaseEntity {
  readonly documentId: EntityId;
  readonly label: string;
  readonly effectiveFrom: Date;
  readonly effectiveUntil: Date | null;
  readonly status: LegalStatus;
  readonly sourceHash: string | null;
  readonly isCurrent: boolean;
}

/**
 * An atomic legal provision within a document (e.g. an article, paragraph).
 */
export interface LegalProvision extends BaseEntity {
  readonly documentId: EntityId;
  readonly versionId: EntityId | null;
  readonly parentProvisionId: EntityId | null;
  readonly unitType: LegalUnitType;
  readonly anchor: string;
  readonly order: number;
  readonly validationStatus: ValidationStatus;
  readonly editorialStatus: "draft" | "published" | "archived";
  readonly number: string; // e.g. "Art. 837"
  readonly title: string;
  readonly content: string;
  readonly citation: string;
  readonly effectiveFrom: Date;
  readonly effectiveUntil: Date | null;
  readonly status: LegalStatus;
}

/**
 * A directed relationship between two legal provisions.
 */
export interface LegalRelation extends BaseEntity {
  readonly sourceProvisionId: EntityId;
  readonly targetProvisionId: EntityId;
  readonly type: LegalRelationType;
  readonly description: string;
}

/**
 * An explicit or implicit reference between provisions or documents.
 */
export interface LegalReference extends BaseEntity {
  readonly fromProvisionId: EntityId;
  readonly toProvisionId: EntityId | null;
  readonly toDocumentId: EntityId | null;
  readonly citation: string;
  readonly context: string;
}

/**
 * A fragment of legal text extracted as evidence supporting
 * a question, concept, or evaluation.
 */
export interface Evidence extends BaseEntity {
  readonly provisionId: EntityId;
  readonly content: string;
  readonly citation: string;
}
