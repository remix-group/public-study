import { LearningEngine } from "@dian-study/learning";
import { Prisma, prisma } from "@dian-study/infrastructure";
import type { EvidenceSnapshot, MasteryState, Mistake, QuestionAttempt } from "@dian-study/domain";
import { updateTopicProgress } from "./progression.js";

export interface SubmitQuestionAttemptInput {
  studentId: string;
  questionId: string;
  sessionId: string;
  answer: string;
  timeSpentMs: number;
  confidence?: number;
}

export class AttemptConflictError extends Error {}
export class AttemptNotFoundError extends Error {}
const engine = new LearningEngine();

export async function submitQuestionAttempt(input: SubmitQuestionAttemptInput) {
  return prisma.$transaction(async (tx) => {
    const session = await tx.studySession.findUnique({ where: { id: input.sessionId } });
    if (!session) throw new AttemptNotFoundError("Study session not found");
    if (session.studentId !== input.studentId) throw new AttemptConflictError("Study session does not belong to student");
    if (session.finishedAt) throw new AttemptConflictError("Study session is already finished");

    const question = await tx.question.findUnique({
      where: { id: input.questionId },
      include: {
        objective: { include: { topic: { include: { block: true } } } },
        evidences: { include: { evidence: true } },
      },
    });
    if (!question || question.editorialStatus !== "published") throw new AttemptNotFoundError("Published question not found");
    if (question.objective.topic.block.competencyId !== session.competencyId) {
      throw new AttemptConflictError("Question does not belong to the session competency");
    }
    if (question.evidences.length === 0) throw new AttemptConflictError("Question has no legal evidence");

    const evidenceSnapshots: EvidenceSnapshot[] = question.evidences.map(({ evidence }) => ({
      evidenceId: evidence.id,
      provisionId: evidence.provisionId,
      citation: evidence.citation,
      content: evidence.content,
    }));
    const isCorrect = input.answer === question.correctAnswer;
    const now = new Date();
    const storedAttempt = await tx.questionAttempt.create({
      data: {
        studentId: input.studentId,
        questionId: input.questionId,
        sessionId: input.sessionId,
        answer: input.answer,
        result: isCorrect ? "correct" : "incorrect",
        timeSpentMs: input.timeSpentMs,
        confidence: input.confidence ?? null,
        difficulty: question.difficulty,
        evidenceSnapshots: evidenceSnapshots as unknown as Prisma.InputJsonValue,
      },
    });

    const mistakes: Mistake[] = [];
    if (!isCorrect) {
      const diagnosedType = input.confidence !== undefined && input.confidence < 0.3
        ? "UNKNOWN_CONCEPT"
        : input.confidence !== undefined && input.confidence > 0.8
          ? "CARELESS_ERROR"
          : question.errorType;
      const descriptions: Record<string, string> = {
        UNKNOWN_CONCEPT: "La respuesta indica que el concepto todavía no está adquirido.",
        CONCEPT_CONFUSION: "La respuesta confunde conceptos o reglas cercanas.",
        FORGOT_RULE: "La regla fue recuperada de forma incompleta.",
        MISSED_EXCEPTION: "La respuesta no identificó una condición o excepción relevante.",
        NORM_VERSION_ERROR: "La respuesta parece apoyarse en una versión normativa distinta.",
        PROCEDURE_ORDER_ERROR: "La secuencia del procedimiento no fue identificada correctamente.",
        CASE_INTERPRETATION_ERROR: "La situación jurídica fue interpretada de forma incorrecta.",
        CARELESS_ERROR: "La alta seguridad y el resultado sugieren revisar la lectura cuidadosa de la pregunta.",
      };
      const mistake = await tx.mistake.create({
        data: {
          questionAttemptId: storedAttempt.id,
          objectiveId: question.objectiveId,
          type: diagnosedType,
          description: descriptions[diagnosedType] ?? descriptions.UNKNOWN_CONCEPT,
        },
      });
      mistakes.push({ ...mistake, attemptId: storedAttempt.id });
    }

    const current = await tx.masteryState.findUnique({
      where: { studentId_objectiveId: { studentId: input.studentId, objectiveId: question.objectiveId } },
    });
    const currentState: MasteryState = current ?? engine.initializeMastery(input.studentId, question.objectiveId, now);
    const attempt: QuestionAttempt = {
      ...storedAttempt,
      result: storedAttempt.result as QuestionAttempt["result"],
      evidenceSnapshots,
    };
    const evaluation = engine.evaluateAttempt(currentState, attempt, mistakes, question.difficulty, now);

    await tx.masteryState.upsert({
      where: { studentId_objectiveId: { studentId: input.studentId, objectiveId: question.objectiveId } },
      update: {
        mastery: evaluation.newState.mastery, confidence: evaluation.newState.confidence,
        retention: evaluation.newState.retention, totalAttempts: evaluation.newState.totalAttempts,
        recall: evaluation.newState.recall, comprehension: evaluation.newState.comprehension,
        application: evaluation.newState.application, sourceAwareness: evaluation.newState.sourceAwareness,
        stability: evaluation.newState.stability,
        correctAttempts: evaluation.newState.correctAttempts, consecutiveCorrect: evaluation.newState.consecutiveCorrect,
        lastAttemptAt: evaluation.newState.lastAttemptAt,
      },
      create: {
        studentId: input.studentId, objectiveId: question.objectiveId,
        mastery: evaluation.newState.mastery, confidence: evaluation.newState.confidence,
        retention: evaluation.newState.retention, totalAttempts: evaluation.newState.totalAttempts,
        recall: evaluation.newState.recall, comprehension: evaluation.newState.comprehension,
        application: evaluation.newState.application, sourceAwareness: evaluation.newState.sourceAwareness,
        stability: evaluation.newState.stability,
        correctAttempts: evaluation.newState.correctAttempts, consecutiveCorrect: evaluation.newState.consecutiveCorrect,
        lastAttemptAt: evaluation.newState.lastAttemptAt,
      },
    });
    await tx.reviewSchedule.upsert({
      where: { studentId_objectiveId: { studentId: input.studentId, objectiveId: question.objectiveId } },
      update: { scheduledAt: evaluation.nextReviewDate, interval: evaluation.intervalDays, completed: false, completedAt: null },
      create: { studentId: input.studentId, objectiveId: question.objectiveId, scheduledAt: evaluation.nextReviewDate, interval: evaluation.intervalDays },
    });
    await tx.studySession.update({
      where: { id: input.sessionId },
      data: { totalQuestions: { increment: 1 }, correctAnswers: { increment: isCorrect ? 1 : 0 } },
    });
    await updateTopicProgress(input.studentId, question.objectiveId, tx);

    return {
      attempt, isCorrect, mistakes, explanation: question.explanation, evidence: evidenceSnapshots,
      mastery: evaluation.newState.mastery,
      masteryDimensions: {
        recall: evaluation.newState.recall, comprehension: evaluation.newState.comprehension,
        application: evaluation.newState.application, sourceAwareness: evaluation.newState.sourceAwareness,
        stability: evaluation.newState.stability,
      },
      masteryDelta: evaluation.newState.mastery - currentState.mastery,
      nextReviewDate: evaluation.nextReviewDate,
    };
  });
}
