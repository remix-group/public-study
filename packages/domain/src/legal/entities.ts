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
  readonly effectiveFrom: Date;
  readonly effectiveUntil: Date | null;
  readonly status: LegalStatus;
}

/**
 * An atomic legal provision within a document (e.g. an article, paragraph).
 */
export interface LegalProvision extends BaseEntity {
  readonly documentId: EntityId;
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
