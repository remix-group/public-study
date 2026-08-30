/**
 * Shared value objects and types used across all domain entities.
 */

/** Unique identifier for domain entities. */
export type EntityId = string;

/** Possible statuses for entities with lifecycle. */
export type Status = "active" | "inactive" | "archived";

/** Base properties shared by all domain entities. */
export interface BaseEntity {
  readonly id: EntityId;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
