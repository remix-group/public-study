/**
 * OPEC domain entities.
 *
 * Models the structure of the public employment competition (OPEC)
 * from the top-level vacancy down to specific learning objectives.
 *
 * See: docs/domain/opec.md
 */

import type { BaseEntity, EntityId, Status } from "../shared/types.js";

/**
 * Represents a specific OPEC vacancy.
 * Example: "Analista I — Cumplimiento de Obligaciones Tributarias"
 */
export interface Opec extends BaseEntity {
  readonly name: string;
  readonly description: string;
  readonly level: string; // e.g. "Técnico"
  readonly area: string; // e.g. "Administración de Cartera"
  readonly status: Status;
}

/**
 * A functional competency required by the OPEC.
 * Example: "Cobro Coactivo"
 */
export interface Competency extends BaseEntity {
  readonly opecId: EntityId;
  readonly name: string;
  readonly description: string;
  readonly status: Status;
}

/**
 * A topic within a competency that groups related learning objectives.
 * Example: "Embargo", "Secuestro", "Remate"
 */
export interface Topic extends BaseEntity {
  readonly competencyId: EntityId;
  readonly name: string;
  readonly description: string;
  readonly order: number;
  readonly status: Status;
}

/**
 * A specific, measurable learning objective within a topic.
 * Example: "Identificar los requisitos del mandamiento de pago"
 */
export interface LearningObjective extends BaseEntity {
  readonly topicId: EntityId;
  readonly name: string;
  readonly description: string;
  readonly order: number;
  readonly status: Status;
}
