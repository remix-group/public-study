import { LearningEngine } from "@dian-study/learning";
import { prisma } from "@dian-study/infrastructure";
import type { CaseAttempt, MasteryState } from "@dian-study/domain";
import { isPublishableProvision } from "./legal-publication.js";
import { AttemptConflictError, AttemptNotFoundError } from "./submit-question-attempt.js";
import { updateTopicProgress } from "./progression.js";

const engine = new LearningEngine();

export interface SubmitCaseAttemptInput {
  studentId: string;
  caseId: string;
  sessionId: string;
  response: string;
  timeSpentMs: number;
}

/**
 * Cases are reflective legal exercises. The system records and schedules them,
 * but deliberately does not pretend to grade a free-text legal analysis with
 * an automatic correctness verdict.
 */
export async function submitCaseAttempt(input: SubmitCaseAttemptInput) {
  return prisma.$transaction(async (tx) => {
    const session = await tx.studySession.findUnique({ where: { id: input.sessionId } });
    if (!session) throw new AttemptNotFoundError("Study session not found");
    if (session.studentId !== input.studentId) throw new AttemptConflictError("Study session does not belong to student");
    if (session.finishedAt) throw new AttemptConflictError("Study session is already finished");
    if (session.mode !== "CASE") throw new AttemptConflictError("Case attempts require a case study session");

    const studyCase = await tx.case.findUnique({
      where: { id: input.caseId },
      include: {
        objective: { include: { topic: { include: { block: true } } } },
        evidences: { include: { evidence: { include: { provision: { include: { document: true } } } } } },
      },
    });
    if (!studyCase || studyCase.editorialStatus !== "published") throw new AttemptNotFoundError("Published study case not found");
    if (studyCase.objective.topic.block.competencyId !== session.competencyId) throw new AttemptConflictError("Case does not belong to the session competency");
    if (!studyCase.evidences.length || !studyCase.evidences.every(({ evidence }) => isPublishableProvision(evidence.provision))) {
      throw new AttemptConflictError("Case does not have fully reviewed current official legal evidence");
    }

    const now = new Date();
    const stored = await tx.caseAttempt.create({
      data: { studentId: input.studentId, caseId: input.caseId, sessionId: input.sessionId, response: input.response.trim(), result: "partial", timeSpentMs: input.timeSpentMs },
    });
    const current = await tx.masteryState.findUnique({ where: { studentId_objectiveId: { studentId: input.studentId, objectiveId: studyCase.objectiveId } } });
    const currentState: MasteryState = current ?? engine.initializeMastery(input.studentId, studyCase.objectiveId, now);
    const evaluation = engine.evaluateAttempt(currentState, { ...stored, result: "partial" } as CaseAttempt, [], studyCase.difficulty, now);
    await tx.masteryState.upsert({
      where: { studentId_objectiveId: { studentId: input.studentId, objectiveId: studyCase.objectiveId } },
      update: { mastery: evaluation.newState.mastery, confidence: evaluation.newState.confidence, retention: evaluation.newState.retention, totalAttempts: evaluation.newState.totalAttempts, recall: evaluation.newState.recall, comprehension: evaluation.newState.comprehension, application: evaluation.newState.application, sourceAwareness: evaluation.newState.sourceAwareness, stability: evaluation.newState.stability, correctAttempts: evaluation.newState.correctAttempts, consecutiveCorrect: evaluation.newState.consecutiveCorrect, lastAttemptAt: evaluation.newState.lastAttemptAt },
      create: { studentId: input.studentId, objectiveId: studyCase.objectiveId, mastery: evaluation.newState.mastery, confidence: evaluation.newState.confidence, retention: evaluation.newState.retention, totalAttempts: evaluation.newState.totalAttempts, recall: evaluation.newState.recall, comprehension: evaluation.newState.comprehension, application: evaluation.newState.application, sourceAwareness: evaluation.newState.sourceAwareness, stability: evaluation.newState.stability, correctAttempts: evaluation.newState.correctAttempts, consecutiveCorrect: evaluation.newState.consecutiveCorrect, lastAttemptAt: evaluation.newState.lastAttemptAt },
    });
    await tx.reviewSchedule.upsert({
      where: { studentId_objectiveId: { studentId: input.studentId, objectiveId: studyCase.objectiveId } },
      update: { scheduledAt: evaluation.nextReviewDate, interval: evaluation.intervalDays, completed: false, completedAt: null },
      create: { studentId: input.studentId, objectiveId: studyCase.objectiveId, scheduledAt: evaluation.nextReviewDate, interval: evaluation.intervalDays },
    });
    await updateTopicProgress(input.studentId, studyCase.objectiveId, tx);
    return {
      attempt: stored,
      evaluationMethod: "self_review" as const,
      expectedAnalysis: studyCase.expectedAnalysis,
      evidence: studyCase.evidences.map(({ evidence }) => ({ evidenceId: evidence.id, provisionId: evidence.provisionId, citation: evidence.citation, content: evidence.content })),
      mastery: evaluation.newState.mastery,
      masteryDelta: evaluation.newState.mastery - currentState.mastery,
      nextReviewDate: evaluation.nextReviewDate,
    };
  });
}
