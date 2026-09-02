/**
 * Unit tests for OPEC domain entities.
 *
 * These tests verify that the entity interfaces are structurally sound
 * and can be instantiated as plain objects in memory (no DB dependency).
 */

import { describe, it, expect } from "vitest";
import type { Opec, Competency, Block, Topic, LearningObjective } from "./entities.js";

const now = new Date();

describe("OPEC entities", () => {
  const opec: Opec = {
    id: "opec-1",
    name: "Analista I — DIAN",
    description: "Cumplimiento de Obligaciones Tributarias",
    level: "Técnico",
    area: "Administración de Cartera",
    process: "Cumplimiento de obligaciones tributarias",
    subprocess: "Administración de cartera",
    status: "active",
    createdAt: now,
    updatedAt: now,
  };

  const competency: Competency = {
    id: "comp-1",
    opecId: opec.id,
    name: "Cobro Coactivo",
    description: "Procedimiento de cobro coactivo tributario",
    status: "active",
    createdAt: now,
    updatedAt: now,
  };

  const block: Block = {
    id: "block-1", competencyId: competency.id, name: "Proceso de cobro", description: "Ruta principal",
    order: 1, progressionThreshold: 0.7, status: "active", createdAt: now, updatedAt: now,
  };

  const topic: Topic = {
    id: "topic-1",
    blockId: block.id,
    name: "Mandamiento de Pago",
    description: "Requisitos y procedimiento del mandamiento de pago",
    order: 1,
    status: "active",
    createdAt: now,
    updatedAt: now,
  };

  const objective: LearningObjective = {
    id: "obj-1",
    topicId: topic.id,
    name: "Identificar requisitos del mandamiento de pago",
    description: "El estudiante puede enumerar y explicar los requisitos legales del mandamiento de pago",
    order: 1,
    critical: true,
    status: "active",
    createdAt: now,
    updatedAt: now,
  };

  it("should create a valid OPEC", () => {
    expect(opec.id).toBe("opec-1");
    expect(opec.level).toBe("Técnico");
    expect(opec.status).toBe("active");
  });

  it("should link Competency to OPEC", () => {
    expect(competency.opecId).toBe(opec.id);
    expect(competency.name).toBe("Cobro Coactivo");
  });

  it("should link Topic to Block", () => {
    expect(block.competencyId).toBe(competency.id);
    expect(topic.blockId).toBe(block.id);
    expect(topic.order).toBe(1);
  });

  it("should link LearningObjective to Topic", () => {
    expect(objective.topicId).toBe(topic.id);
    expect(objective.order).toBe(1);
  });

  it("should maintain the full hierarchy chain", () => {
    // OPEC -> Competency -> Block -> Topic -> LearningObjective
    expect(competency.opecId).toBe(opec.id);
    expect(block.competencyId).toBe(competency.id);
    expect(topic.blockId).toBe(block.id);
    expect(objective.topicId).toBe(topic.id);
  });
});
