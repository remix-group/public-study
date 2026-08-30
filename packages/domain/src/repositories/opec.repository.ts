/**
 * Repository port interfaces for the OPEC subdomain.
 *
 * These define the contract that any persistence adapter must fulfill.
 * Business logic depends on these interfaces, never on the concrete implementation.
 */

import type { EntityId } from "../shared/types.js";
import type { Opec, Competency, Topic, LearningObjective } from "../opec/entities.js";

export interface OpecRepository {
  findById(id: EntityId): Promise<Opec | null>;
  findAll(): Promise<Opec[]>;
  create(data: Omit<Opec, "id" | "createdAt" | "updatedAt">): Promise<Opec>;
}

export interface CompetencyRepository {
  findById(id: EntityId): Promise<Competency | null>;
  findByOpecId(opecId: EntityId): Promise<Competency[]>;
  create(data: Omit<Competency, "id" | "createdAt" | "updatedAt">): Promise<Competency>;
}

export interface TopicRepository {
  findById(id: EntityId): Promise<Topic | null>;
  findByCompetencyId(competencyId: EntityId): Promise<Topic[]>;
  create(data: Omit<Topic, "id" | "createdAt" | "updatedAt">): Promise<Topic>;
}

export interface LearningObjectiveRepository {
  findById(id: EntityId): Promise<LearningObjective | null>;
  findByTopicId(topicId: EntityId): Promise<LearningObjective[]>;
  create(data: Omit<LearningObjective, "id" | "createdAt" | "updatedAt">): Promise<LearningObjective>;
}
