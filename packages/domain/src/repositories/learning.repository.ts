/**
 * Repository port interfaces for the Learning subdomain.
 */

import type { EntityId } from "../shared/types.js";
import type {
  Student,
  Question,
  Case,
  QuestionAttempt,
  CaseAttempt,
  Mistake,
  MasteryState,
  ReviewSchedule,
  StudySession,
} from "../learning/entities.js";

export interface StudentRepository {
  findById(id: EntityId): Promise<Student | null>;
  findByEmail(email: string): Promise<Student | null>;
  create(data: Omit<Student, "id" | "createdAt" | "updatedAt">): Promise<Student>;
}

export interface QuestionRepository {
  findById(id: EntityId): Promise<Question | null>;
  findByObjectiveId(objectiveId: EntityId): Promise<Question[]>;
  create(data: Omit<Question, "id" | "createdAt" | "updatedAt">): Promise<Question>;
}

export interface AttemptRepository {
  saveQuestionAttempt(data: Omit<QuestionAttempt, "id" | "createdAt" | "updatedAt">): Promise<QuestionAttempt>;
  saveCaseAttempt(data: Omit<CaseAttempt, "id" | "createdAt" | "updatedAt">): Promise<CaseAttempt>;
}

export interface MasteryRepository {
  findByStudentAndObjective(studentId: EntityId, objectiveId: EntityId): Promise<MasteryState | null>;
  save(data: Omit<MasteryState, "id" | "createdAt" | "updatedAt">): Promise<MasteryState>;
  update(id: EntityId, data: Partial<MasteryState>): Promise<MasteryState>;
}

export interface StudySessionRepository {
  findById(id: EntityId): Promise<StudySession | null>;
  create(data: Omit<StudySession, "id" | "createdAt" | "updatedAt">): Promise<StudySession>;
  update(id: EntityId, data: Partial<StudySession>): Promise<StudySession>;
}
