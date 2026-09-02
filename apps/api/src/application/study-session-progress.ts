import { prisma } from "@dian-study/infrastructure";
import { AttemptConflictError, AttemptNotFoundError } from "./submit-question-attempt.js";
import { ensureTopicProgress } from "./progression.js";

async function requireOwnedSession(sessionId: string, studentId: string) {
  const session = await prisma.studySession.findUnique({ where: { id: sessionId } });
  if (!session) throw new AttemptNotFoundError("Study session not found");
  if (session.studentId !== studentId) throw new AttemptConflictError("Study session does not belong to student");
  return session;
}

function safeQuestion<T extends { correctAnswer: string; explanation: string }>(question: T) {
  const { correctAnswer: _answer, explanation: _explanation, ...safe } = question;
  return safe;
}

export async function getNextQuestion(sessionId: string, studentId: string, objectiveId?: string) {
  const session = await requireOwnedSession(sessionId, studentId);
  if (session.finishedAt) throw new AttemptConflictError("Study session is already finished");
  if (objectiveId) {
    const belongs = await prisma.learningObjective.count({ where: { id: objectiveId, topic: { block: { competencyId: session.competencyId } } } });
    if (!belongs) throw new AttemptConflictError("Learning objective does not belong to the session competency");
  }

  const previous = await prisma.questionAttempt.findMany({
    where: { sessionId }, select: { questionId: true },
  });
  const question = await prisma.question.findFirst({
    where: {
      id: { notIn: previous.map(({ questionId }) => questionId) },
      editorialStatus: "published",
      ...(objectiveId ? { objectiveId } : {}),
      objective: { topic: { block: { competencyId: session.competencyId } } },
      evidences: { some: {} },
    },
    orderBy: [{ objective: { order: "asc" } }, { difficulty: "asc" }, { createdAt: "asc" }],
    include: { objective: true },
  });
  return question ? { question: safeQuestion(question), objective: question.objective } : null;
}

export async function finishStudySession(sessionId: string, studentId: string) {
  await requireOwnedSession(sessionId, studentId);
  return prisma.$transaction(async (tx) => {
    const session = await tx.studySession.update({
      where: { id: sessionId }, data: { finishedAt: new Date() },
    });
    const attempts = await tx.questionAttempt.findMany({
      where: { sessionId }, orderBy: { createdAt: "asc" },
      include: { question: { include: { objective: true } }, mistakes: true },
    });
    return {
      session,
      accuracy: session.totalQuestions ? session.correctAnswers / session.totalQuestions : 0,
      attempts: attempts.map((attempt) => ({
        id: attempt.id, result: attempt.result, answer: attempt.answer,
        question: attempt.question.stem, objective: attempt.question.objective.name,
        mistakes: attempt.mistakes,
      })),
    };
  });
}

export async function getStudentDashboard(studentId: string) {
  const student = await prisma.student.findUnique({ where: { id: studentId } });
  if (!student) throw new AttemptNotFoundError("Student not found");
  const competencies = await prisma.competency.findMany({ where: { status: "active" }, select: { id: true } });
  for (const competency of competencies) await ensureTopicProgress(studentId, competency.id);
  const [mastery, reviews, sessions, blocks, progress, mistakes] = await Promise.all([
    prisma.masteryState.findMany({
      where: { studentId }, orderBy: { updatedAt: "desc" }, include: { objective: { include: { topic: { include: { block: true } } } } },
    }),
    prisma.reviewSchedule.findMany({
      where: { studentId, completed: false }, orderBy: { scheduledAt: "asc" }, include: { objective: true },
    }),
    prisma.studySession.findMany({ where: { studentId, finishedAt: { not: null } }, orderBy: { finishedAt: "desc" }, take: 5 }),
    prisma.block.findMany({
      where: { status: "active", competency: { status: "active" } }, orderBy: { order: "asc" },
      include: { competency: { include: { opec: true } }, topics: { where: { status: "active" }, orderBy: { order: "asc" }, include: {
        learningObjectives: { where: { status: "active" }, orderBy: { order: "asc" }, include: { _count: { select: { questions: { where: { editorialStatus: "published" } } } } } },
      } } },
    }),
    prisma.topicProgress.findMany({ where: { studentId } }),
    prisma.mistake.findMany({ where: { questionAttempt: { studentId } }, orderBy: { createdAt: "desc" }, take: 8, include: { objective: { include: { topic: true } } } }),
  ]);
  const masteryByObjective = new Map(mastery.map((item) => [item.objectiveId, item]));
  const progressByTopic = new Map(progress.map((item) => [item.topicId, item]));
  const objectives = blocks.flatMap((block) => block.topics.flatMap((topic) => topic.learningObjectives.map((objective) => ({ objective, topic, block }))));
  const objectiveProgress = objectives.map(({ objective, topic, block }) => {
    const state = masteryByObjective.get(objective.id);
    const curriculumState = progressByTopic.get(topic.id)?.state ?? "LOCKED";
    return {
      objectiveId: objective.id, objective: objective.name, description: objective.description,
      topicId: topic.id, topic: topic.name, blockId: block.id, block: block.name, critical: objective.critical,
      curriculumState, accessible: curriculumState !== "LOCKED", mastery: state?.mastery ?? 0,
      totalAttempts: state?.totalAttempts ?? 0, retention: state?.retention ?? 0, questionCount: objective._count.questions,
      dimensions: { recall: state?.recall ?? 0, comprehension: state?.comprehension ?? 0, application: state?.application ?? 0, sourceAwareness: state?.sourceAwareness ?? 0, stability: state?.stability ?? 0 },
    };
  });
  const dueReview = reviews.find((review) => review.scheduledAt <= new Date());
  const recommended = dueReview
    ? objectiveProgress.find((item) => item.objectiveId === dueReview.objectiveId)
    : [...objectiveProgress].filter((item) => item.accessible && item.questionCount > 0).sort((a, b) => a.mastery - b.mastery || a.totalAttempts - b.totalAttempts)[0];
  const recommendation = recommended ? {
    ...recommended,
    action: dueReview ? "REVIEW" : recommended.totalAttempts ? "PRACTICE" : "LEARN",
    reason: dueReview
      ? "El objetivo tiene un repaso programado y riesgo de olvido."
      : recommended.totalAttempts
        ? "El objetivo está desbloqueado y presenta el dominio más bajo de tu ruta actual."
        : "Es el siguiente objetivo disponible en la ruta curricular.",
  } : null;
  const route = blocks.map((block) => ({
    id: block.id, name: block.name, description: block.description, threshold: block.progressionThreshold,
    competency: block.competency.name, profile: block.competency.opec.name,
    topics: block.topics.map((topic) => {
      const topicObjectives = objectiveProgress.filter((item) => item.topicId === topic.id);
      const topicProgress = progressByTopic.get(topic.id);
      return { id: topic.id, name: topic.name, description: topic.description, order: topic.order,
        state: topicProgress?.state ?? "LOCKED", accessible: (topicProgress?.state ?? "LOCKED") !== "LOCKED",
        mastery: topicObjectives.length ? topicObjectives.reduce((sum, item) => sum + item.mastery, 0) / topicObjectives.length : 0,
        objectives: topicObjectives };
    }),
  }));
  return {
    student: { id: student.id, name: student.name },
    process: { title: "Aprendizaje activo y adaptativo", steps: ["Recupera lo que sabes", "Estudia con evidencia", "Practica y aplica", "Recibe diagnóstico", "Refuerza o avanza", "Repasa para mantener"] },
    overallMastery: mastery.length ? mastery.reduce((sum, item) => sum + item.mastery, 0) / mastery.length : 0,
    objectives: objectiveProgress,
    route,
    recommendedObjective: recommendation,
    pendingReviews: reviews.map((review) => ({
      objectiveId: review.objectiveId, objective: review.objective.name,
      scheduledAt: review.scheduledAt, due: review.scheduledAt <= new Date(),
    })),
    recentSessions: sessions,
    recentMistakes: mistakes.map((mistake) => ({ id: mistake.id, type: mistake.type, description: mistake.description, objective: mistake.objective.name, topic: mistake.objective.topic.name, createdAt: mistake.createdAt })),
  };
}

export async function getObjectiveStudyGuide(objectiveId: string) {
  const objective = await prisma.learningObjective.findFirst({
    where: { id: objectiveId, status: "active", topic: { status: "active" } },
    include: {
      topic: { include: { block: { include: { competency: true } } } },
      questions: {
        where: { editorialStatus: "published", evidences: { some: {} } },
        orderBy: [{ difficulty: "asc" }, { createdAt: "asc" }],
        select: {
          id: true, difficulty: true, explanation: true,
          evidences: { include: { evidence: { include: { provision: { include: { document: true } } } } } },
        },
      },
    },
  });
  if (!objective) throw new AttemptNotFoundError("Learning objective not found");

  const evidenceById = new Map<string, {
    id: string; citation: string; content: string; provisionNumber: string; provisionTitle: string;
    documentTitle: string; officialUrl: string;
  }>();
  for (const question of objective.questions) {
    for (const link of question.evidences) {
      const { evidence } = link;
      if (evidence.provision.validationStatus !== "approved" || evidence.provision.editorialStatus !== "published") continue;
      evidenceById.set(evidence.id, {
        id: evidence.id, citation: evidence.citation, content: evidence.content,
        provisionNumber: evidence.provision.number, provisionTitle: evidence.provision.title,
        documentTitle: evidence.provision.document.title, officialUrl: evidence.provision.document.officialUrl,
      });
    }
  }
  const keyConcepts = [...new Set(objective.questions.map((question) => question.explanation.trim()).filter(Boolean))].slice(0, 4);
  return {
    objective: { id: objective.id, name: objective.name, description: objective.description },
    topic: { id: objective.topic.id, name: objective.topic.name },
    block: { id: objective.topic.block.id, name: objective.topic.block.name },
    competency: { id: objective.topic.block.competency.id, name: objective.topic.block.competency.name },
    studyProcess: [
      { mode: "RETRIEVAL", title: "Recupera", description: "Intenta explicar la regla antes de volver a leerla." },
      { mode: "LEARN", title: "Comprende", description: "Contrasta tu respuesta con los conceptos y la fuente oficial." },
      { mode: "PRACTICE", title: "Practica", description: "Resuelve preguntas con feedback específico." },
      { mode: "APPLICATION", title: "Aplica", description: "Lleva la regla a una situación del procedimiento." },
      { mode: "REVIEW", title: "Mantén", description: "Vuelve a recuperar el conocimiento cuando el sistema lo programe." },
    ],
    keyConcepts,
    evidences: [...evidenceById.values()],
    questionCount: objective.questions.length,
  };
}
