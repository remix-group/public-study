import {
  OpecRepository,
  CompetencyRepository,
  TopicRepository,
  LearningObjectiveRepository,
} from "@dian-study/domain";
import type {
  Opec,
  Competency,
  Topic,
  LearningObjective,
  EntityId,
} from "@dian-study/domain";
import { prisma } from "../prisma/index.js";

export class OpecPrismaRepository implements OpecRepository {
  async findById(id: EntityId): Promise<Opec | null> {
    const result = await prisma.opec.findUnique({ where: { id } });
    if (!result) return null;
    return result as Opec; // The generated type matches the domain type perfectly
  }

  async findAll(): Promise<Opec[]> {
    const results = await prisma.opec.findMany();
    return results as Opec[];
  }

  async create(data: Omit<Opec, "id" | "createdAt" | "updatedAt">): Promise<Opec> {
    const result = await prisma.opec.create({ data: data as any });
    return result as Opec;
  }
}

export class CompetencyPrismaRepository implements CompetencyRepository {
  async findById(id: EntityId): Promise<Competency | null> {
    const result = await prisma.competency.findUnique({ where: { id } });
    if (!result) return null;
    return result as Competency;
  }

  async findByOpecId(opecId: EntityId): Promise<Competency[]> {
    const results = await prisma.competency.findMany({ where: { opecId } });
    return results as Competency[];
  }

  async create(data: Omit<Competency, "id" | "createdAt" | "updatedAt">): Promise<Competency> {
    const result = await prisma.competency.create({ data: data as any });
    return result as Competency;
  }
}

export class TopicPrismaRepository implements TopicRepository {
  async findById(id: EntityId): Promise<Topic | null> {
    const result = await prisma.topic.findUnique({ where: { id } });
    if (!result) return null;
    return result as Topic;
  }

  async findByCompetencyId(competencyId: EntityId): Promise<Topic[]> {
    const results = await prisma.topic.findMany({
      where: { block: { competencyId } },
      orderBy: [{ block: { order: "asc" } }, { order: "asc" }],
    });
    return results as Topic[];
  }

  async create(data: Omit<Topic, "id" | "createdAt" | "updatedAt">): Promise<Topic> {
    const result = await prisma.topic.create({ data: data as any });
    return result as Topic;
  }
}

export class LearningObjectivePrismaRepository implements LearningObjectiveRepository {
  async findById(id: EntityId): Promise<LearningObjective | null> {
    const result = await prisma.learningObjective.findUnique({ where: { id } });
    if (!result) return null;
    return result as LearningObjective;
  }

  async findByTopicId(topicId: EntityId): Promise<LearningObjective[]> {
    const results = await prisma.learningObjective.findMany({
      where: { topicId },
      orderBy: { order: "asc" },
    });
    return results as LearningObjective[];
  }

  async create(data: Omit<LearningObjective, "id" | "createdAt" | "updatedAt">): Promise<LearningObjective> {
    const result = await prisma.learningObjective.create({ data: data as any });
    return result as LearningObjective;
  }
}
