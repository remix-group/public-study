import { prisma } from "@dian-study/infrastructure";
import { AttemptConflictError, AttemptNotFoundError } from "./submit-question-attempt.js";

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
    const belongs = await prisma.learningObjective.count({ where: { id: objectiveId, topic: { competencyId: session.competencyId } } });
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
      objective: { topic: { competencyId: session.competencyId } },
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
  const [mastery, reviews, sessions, objectives] = await Promise.all([
    prisma.masteryState.findMany({
      where: { studentId }, orderBy: { updatedAt: "desc" }, include: { objective: { include: { topic: true } } },
    }),
    prisma.reviewSchedule.findMany({
      where: { studentId, completed: false }, orderBy: { scheduledAt: "asc" }, include: { objective: true },
    }),
    prisma.studySession.findMany({ where: { studentId, finishedAt: { not: null } }, orderBy: { finishedAt: "desc" }, take: 5 }),
    prisma.learningObjective.findMany({
      where: { status: "active", topic: { status: "active", competency: { status: "active" } } },
      orderBy: [{ topic: { order: "asc" } }, { order: "asc" }],
      include: { topic: true, _count: { select: { questions: { where: { editorialStatus: "published" } } } } },
    }),
  ]);
  const masteryByObjective = new Map(mastery.map((item) => [item.objectiveId, item]));
  const objectiveProgress = objectives.map((objective) => {
    const state = masteryByObjective.get(objective.id);
    return {
      objectiveId: objective.id, objective: objective.name, description: objective.description,
      topic: objective.topic.name, mastery: state?.mastery ?? 0, totalAttempts: state?.totalAttempts ?? 0,
      retention: state?.retention ?? 0, questionCount: objective._count.questions,
    };
  });
  const dueReview = reviews.find((review) => review.scheduledAt <= new Date());
  const recommended = dueReview
    ? objectiveProgress.find((item) => item.objectiveId === dueReview.objectiveId)
    : [...objectiveProgress].filter((item) => item.questionCount > 0).sort((a, b) => a.mastery - b.mastery || a.totalAttempts - b.totalAttempts)[0];
  return {
    student: { id: student.id, name: student.name },
    overallMastery: mastery.length ? mastery.reduce((sum, item) => sum + item.mastery, 0) / mastery.length : 0,
    objectives: objectiveProgress,
    recommendedObjective: recommended ?? null,
    pendingReviews: reviews.map((review) => ({
      objectiveId: review.objectiveId, objective: review.objective.name,
      scheduledAt: review.scheduledAt, due: review.scheduledAt <= new Date(),
    })),
    recentSessions: sessions,
  };
}

export async function getObjectiveStudyGuide(objectiveId: string) {
  const objective = await prisma.learningObjective.findFirst({
    where: { id: objectiveId, status: "active", topic: { status: "active" } },
    include: {
      topic: { include: { competency: true } },
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
    competency: { id: objective.topic.competency.id, name: objective.topic.competency.name },
    keyConcepts,
    evidences: [...evidenceById.values()],
    questionCount: objective.questions.length,
  };
}
