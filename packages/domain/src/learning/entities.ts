/**
 * Learning domain entities.
 *
 * Models the learning cycle: questions, attempts, evaluation,
 * mistakes, mastery tracking, and spaced repetition scheduling.
 *
 * See: docs/domain/learning-domain.md
 */

import type { BaseEntity, EntityId } from "../shared/types.js";

/** Types of evaluative items. */
export type QuestionType =
  | "multiple_choice"
  | "true_false"
  | "open_ended";

/** Result of evaluating an attempt. */
export type AttemptResult = "correct" | "incorrect" | "partial";
export type EditorialStatus = "draft" | "published" | "archived";
export type StudentRole = "student" | "editor";
export type StudyMode = "LEARN" | "PRACTICE" | "ASSESS" | "REVIEW" | "CASE";
export type CurriculumState = "LOCKED" | "AVAILABLE" | "IN_PROGRESS" | "COMPLETED" | "MASTERED";
export type MistakeType =
  | "UNKNOWN_CONCEPT" | "CONCEPT_CONFUSION" | "FORGOT_RULE" | "MISSED_EXCEPTION"
  | "NORM_VERSION_ERROR" | "PROCEDURE_ORDER_ERROR" | "CASE_INTERPRETATION_ERROR" | "CARELESS_ERROR";

/** Immutable legal evidence captured when an attempt is evaluated. */
export interface EvidenceSnapshot {
  readonly evidenceId: EntityId;
  readonly provisionId: EntityId;
  readonly citation: string;
  readonly content: string;
}

/**
 * A concept — an atomic legal or procedural idea that can be studied.
 */
export interface Concept extends BaseEntity {
  readonly objectiveId: EntityId;
  readonly name: string;
  readonly description: string;
  readonly evidenceIds: EntityId[];
}

/**
 * A question linked to a learning objective and backed by legal evidence.
 */
export interface Question extends BaseEntity {
  readonly objectiveId: EntityId;
  readonly type: QuestionType;
  readonly difficulty: number; // 0.0 – 1.0
  readonly stem: string;
  readonly options: QuestionOption[] | null;
  readonly correctAnswer: string;
  readonly explanation: string;
  readonly errorType: MistakeType;
  readonly evidenceIds: EntityId[];
  readonly editorialStatus: EditorialStatus;
  readonly reviewedBy: EntityId | null;
  readonly reviewedAt: Date | null;
}

/** An option within a multiple-choice question. */
export interface QuestionOption {
  readonly key: string; // e.g. "A", "B", "C", "D"
  readonly text: string;
}

/**
 * A situational-judgment case or scenario.
 */
export interface Case extends BaseEntity {
  readonly objectiveId: EntityId;
  readonly difficulty: number;
  readonly scenario: string;
  readonly expectedAnalysis: string;
  readonly evidenceIds: EntityId[];
}

/**
 * A recorded attempt at answering a question.
 */
export interface QuestionAttempt extends BaseEntity {
  readonly studentId: EntityId;
  readonly questionId: EntityId;
  readonly sessionId: EntityId;
  readonly answer: string;
  readonly result: AttemptResult;
  readonly timeSpentMs: number;
  readonly confidence: number | null; // 0.0 – 1.0, self-reported
  readonly difficulty: number; // Snapshot used by the evaluation
  readonly evidenceSnapshots: EvidenceSnapshot[];
}

/**
 * A recorded attempt at resolving a case.
 */
export interface CaseAttempt extends BaseEntity {
  readonly studentId: EntityId;
  readonly caseId: EntityId;
  readonly sessionId: EntityId;
  readonly response: string;
  readonly result: AttemptResult;
  readonly timeSpentMs: number;
}

/**
 * A typed mistake or error pattern committed in an attempt.
 */
export interface Mistake extends BaseEntity {
  readonly attemptId: EntityId;
  readonly objectiveId: EntityId;
  readonly type: string;
  readonly description: string;
}

/**
 * The student's current mastery state for a specific learning objective.
 */
export interface MasteryState extends BaseEntity {
  readonly studentId: EntityId;
  readonly objectiveId: EntityId;
  readonly mastery: number; // 0.0 – 1.0
  readonly confidence: number; // 0.0 – 1.0
  readonly retention: number; // 0.0 – 1.0
  readonly recall: number;
  readonly comprehension: number;
  readonly application: number;
  readonly sourceAwareness: number;
  readonly stability: number;
  readonly totalAttempts: number;
  readonly correctAttempts: number;
  readonly consecutiveCorrect: number;
  readonly lastAttemptAt: Date | null;
}

/**
 * A scheduled review based on spaced-repetition algorithms.
 */
export interface ReviewSchedule extends BaseEntity {
  readonly studentId: EntityId;
  readonly objectiveId: EntityId;
  readonly scheduledAt: Date;
  readonly interval: number; // days until next review
  readonly completed: boolean;
  readonly completedAt: Date | null;
}

/**
 * A study session grouping a student's activities within a time window.
 */
export interface StudySession extends BaseEntity {
  readonly studentId: EntityId;
  readonly competencyId: EntityId;
  readonly mode: StudyMode;
  readonly focusObjectiveId: EntityId | null;
  readonly startedAt: Date;
  readonly finishedAt: Date | null;
  readonly totalQuestions: number;
  readonly correctAnswers: number;
}

/** Persistent access/progression state for one topic. */
export interface TopicProgress extends BaseEntity {
  readonly studentId: EntityId;
  readonly topicId: EntityId;
  readonly state: CurriculumState;
  readonly unlockedAt: Date | null;
  readonly startedAt: Date | null;
  readonly completedAt: Date | null;
  readonly masteredAt: Date | null;
}

/**
 * A student / user of the platform.
 */
export interface Student extends BaseEntity {
  readonly name: string;
  readonly email: string;
  readonly passwordHash: string;
  readonly role: StudentRole;
}

/** Server-side login session. Only a hash of the browser token is stored. */
export interface AuthSession extends BaseEntity {
  readonly studentId: EntityId;
  readonly tokenHash: string;
  readonly expiresAt: Date;
}
