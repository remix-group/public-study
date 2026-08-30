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

export async function getNextQuestion(sessionId: string, studentId: string) {
  const session = await requireOwnedSession(sessionId, studentId);
  if (session.finishedAt) throw new AttemptConflictError("Study session is already finished");

  const previous = await prisma.questionAttempt.findMany({
    where: { sessionId }, select: { questionId: true },
  });
  const question = await prisma.question.findFirst({
    where: {
      id: { notIn: previous.map(({ questionId }) => questionId) },
      editorialStatus: "published",
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
  const [mastery, reviews, sessions] = await Promise.all([
    prisma.masteryState.findMany({
      where: { studentId }, orderBy: { updatedAt: "desc" }, include: { objective: { include: { topic: true } } },
    }),
    prisma.reviewSchedule.findMany({
      where: { studentId, completed: false }, orderBy: { scheduledAt: "asc" }, include: { objective: true },
    }),
    prisma.studySession.findMany({ where: { studentId, finishedAt: { not: null } }, orderBy: { finishedAt: "desc" }, take: 5 }),
  ]);
  return {
    student: { id: student.id, name: student.name },
    overallMastery: mastery.length ? mastery.reduce((sum, item) => sum + item.mastery, 0) / mastery.length : 0,
    objectives: mastery.map((item) => ({
      objectiveId: item.objectiveId, objective: item.objective.name, topic: item.objective.topic.name,
      mastery: item.mastery, totalAttempts: item.totalAttempts, retention: item.retention,
    })),
    pendingReviews: reviews.map((review) => ({
      objectiveId: review.objectiveId, objective: review.objective.name,
      scheduledAt: review.scheduledAt, due: review.scheduledAt <= new Date(),
    })),
    recentSessions: sessions,
  };
}
