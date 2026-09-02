import { Prisma, prisma } from "@dian-study/infrastructure";

type DbClient = Prisma.TransactionClient | typeof prisma;
const rank: Record<string, number> = { LOCKED: 0, AVAILABLE: 1, IN_PROGRESS: 2, COMPLETED: 3, MASTERED: 4 };

export async function ensureTopicProgress(studentId: string, competencyId: string, db: DbClient = prisma) {
  const topics = await db.topic.findMany({
    where: { block: { competencyId }, status: "active" },
    orderBy: [{ block: { order: "asc" } }, { order: "asc" }],
    select: { id: true },
  });
  const existing = await db.topicProgress.findMany({ where: { studentId, topicId: { in: topics.map((topic) => topic.id) } } });
  const existingIds = new Set(existing.map((item) => item.topicId));
  const hasUnlocked = existing.some((item) => rank[item.state] >= rank.AVAILABLE);
  for (const [index, topic] of topics.entries()) {
    if (existingIds.has(topic.id)) continue;
    const available = !hasUnlocked && index === 0;
    await db.topicProgress.create({
      data: { studentId, topicId: topic.id, state: available ? "AVAILABLE" : "LOCKED", unlockedAt: available ? new Date() : null },
    });
  }
}

export async function updateTopicProgress(studentId: string, objectiveId: string, db: DbClient) {
  const objective = await db.learningObjective.findUnique({
    where: { id: objectiveId },
    include: { topic: { include: { block: true, learningObjectives: true } } },
  });
  if (!objective) return;
  await ensureTopicProgress(studentId, objective.topic.block.competencyId, db);

  const now = new Date();
  const current = await db.topicProgress.findUnique({ where: { studentId_topicId: { studentId, topicId: objective.topicId } } });
  if (current && rank[current.state] < rank.IN_PROGRESS) {
    await db.topicProgress.update({
      where: { id: current.id }, data: { state: "IN_PROGRESS", startedAt: current.startedAt ?? now, unlockedAt: current.unlockedAt ?? now },
    });
  }

  const objectiveIds = objective.topic.learningObjectives.map((item) => item.id);
  const states = await db.masteryState.findMany({ where: { studentId, objectiveId: { in: objectiveIds } } });
  const byObjective = new Map(states.map((state) => [state.objectiveId, state]));
  const aggregate = objectiveIds.length
    ? objectiveIds.reduce((sum, id) => sum + (byObjective.get(id)?.mastery ?? 0), 0) / objectiveIds.length
    : 0;
  const hasEvidenceForEveryObjective = objectiveIds.every((id) => (byObjective.get(id)?.totalAttempts ?? 0) >= 2);
  const criticalSatisfied = objective.topic.learningObjectives
    .filter((item) => item.critical)
    .every((item) => (byObjective.get(item.id)?.mastery ?? 0) >= objective.topic.block.progressionThreshold);

  if (!hasEvidenceForEveryObjective || aggregate < objective.topic.block.progressionThreshold || !criticalSatisfied) return;
  const mastered = aggregate >= 0.85 && objectiveIds.every((id) => (byObjective.get(id)?.stability ?? 0) >= 0.6);
  await db.topicProgress.update({
    where: { studentId_topicId: { studentId, topicId: objective.topicId } },
    data: mastered ? { state: "MASTERED", completedAt: now, masteredAt: now } : { state: "COMPLETED", completedAt: now },
  });

  const topics = await db.topic.findMany({
    where: { block: { competencyId: objective.topic.block.competencyId }, status: "active" },
    orderBy: [{ block: { order: "asc" } }, { order: "asc" }], select: { id: true },
  });
  const index = topics.findIndex((topic) => topic.id === objective.topicId);
  const next = topics[index + 1];
  if (!next) return;
  const nextProgress = await db.topicProgress.findUnique({ where: { studentId_topicId: { studentId, topicId: next.id } } });
  if (nextProgress?.state === "LOCKED") {
    await db.topicProgress.update({ where: { id: nextProgress.id }, data: { state: "AVAILABLE", unlockedAt: now } });
  }
}
