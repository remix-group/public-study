import { afterAll, describe, expect, it } from "vitest";
import { prisma } from "@dian-study/infrastructure";
import { startStudySession } from "./start-study-session.js";
import { submitQuestionAttempt } from "./submit-question-attempt.js";
import { finishStudySession, getNextQuestion, getStudentDashboard } from "./study-session-progress.js";
import { hashPassword } from "../auth/crypto.js";
import { loginStudent } from "../auth/service.js";
import { createEditorialQuestion, setQuestionPublication } from "./editorial-content.js";

const integration = process.env.DATABASE_URL ? describe : describe.skip;
const studentId = "student-integration-test";
let sessionId = "";
let editorialQuestionId = "";

integration("study flow AC-001/002/003", () => {
  it("starts a session and returns the competency objectives", async () => {
    await prisma.student.upsert({
      where: { email: "integration@dian-study.local" }, update: { passwordHash: await hashPassword("Integration2026!"), role: "editor" },
      create: { id: studentId, name: "Integration Test", email: "integration@dian-study.local", passwordHash: await hashPassword("Integration2026!"), role: "editor" },
    });
    const result = await startStudySession({ studentId, competencyId: "competency-cobro-coactivo" });
    sessionId = result.session.id;
    expect(result.competency.topics[0]?.learningObjectives[0]?.id).toBe("objective-alcance-art-823");
  });

  it("authenticates with a derived password and stores only a token hash", async () => {
    const result = await loginStudent({ email: "integration@dian-study.local", password: "Integration2026!" });
    const stored = await prisma.authSession.findFirst({ where: { studentId } });
    expect(result.token).toBeTruthy();
    expect(stored?.tokenHash).not.toBe(result.token);
  });

  it("creates a draft and records human approval when publishing", async () => {
    const created = await createEditorialQuestion({
      objectiveId: "objective-alcance-art-823", difficulty: 0.5,
      stem: "¿Pregunta temporal para verificar el ciclo editorial?",
      options: [{ key: "A", text: "Respuesta válida" }, { key: "B", text: "Distractor" }],
      correctAnswer: "A", explanation: "Explicación temporal suficientemente extensa.",
      evidenceIds: ["evidence-et-823-scope"],
    });
    editorialQuestionId = created.id;
    expect(created.editorialStatus).toBe("draft");
    const published = await setQuestionPublication(created.id, true, studentId);
    expect(published.editorialStatus).toBe("published");
    expect(published.reviewedBy).toBe(studentId);
  });

  it("atomically records an incorrect attempt, evidence, mistake, mastery and review", async () => {
    const result = await submitQuestionAttempt({
      studentId, sessionId, questionId: "question-et-823-1", answer: "B", timeSpentMs: 4200, confidence: 0,
    });
    expect(result.attempt.confidence).toBe(0);
    expect(result.attempt.difficulty).toBe(0.3);
    expect(result.evidence).toHaveLength(1);
    expect(result.mistakes[0]?.type).toBe("incorrect_answer");

    const [mastery, review] = await Promise.all([
      prisma.masteryState.findUnique({ where: { studentId_objectiveId: { studentId, objectiveId: "objective-alcance-art-823" } } }),
      prisma.reviewSchedule.findUnique({ where: { studentId_objectiveId: { studentId, objectiveId: "objective-alcance-art-823" } } }),
    ]);
    expect(mastery?.totalAttempts).toBe(1);
    expect(review?.completed).toBe(false);
  });

  it("selects an unanswered question, finishes the session and exposes progress", async () => {
    const next = await getNextQuestion(sessionId, studentId);
    expect(next?.question.id).not.toBe("question-et-823-1");
    const summary = await finishStudySession(sessionId, studentId);
    expect(summary.session.finishedAt).not.toBeNull();
    expect(summary.attempts).toHaveLength(1);
    const dashboard = await getStudentDashboard(studentId);
    expect(dashboard.objectives[0]?.totalAttempts).toBe(1);
    expect(dashboard.recentSessions).toHaveLength(1);
  });
});

afterAll(async () => {
  if (!process.env.DATABASE_URL) return;
  if (editorialQuestionId) {
    await prisma.questionEvidence.deleteMany({ where: { questionId: editorialQuestionId } });
    await prisma.question.deleteMany({ where: { id: editorialQuestionId } });
  }
  const attempts = await prisma.questionAttempt.findMany({ where: { studentId }, select: { id: true } });
  await prisma.mistake.deleteMany({ where: { questionAttemptId: { in: attempts.map(({ id }) => id) } } });
  await prisma.questionAttempt.deleteMany({ where: { studentId } });
  await prisma.reviewSchedule.deleteMany({ where: { studentId } });
  await prisma.masteryState.deleteMany({ where: { studentId } });
  await prisma.studySession.deleteMany({ where: { studentId } });
  await prisma.student.deleteMany({ where: { id: studentId } });
  await prisma.$disconnect();
});
