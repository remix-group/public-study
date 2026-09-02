/**
 * Unit tests for Learning domain entities.
 *
 * Verifies the learning cycle: Question → Attempt → Evaluation →
 * Mistake → MasteryState → ReviewSchedule.
 */

import { describe, it, expect } from "vitest";
import type {
  Concept,
  Question,
  Case,
  QuestionAttempt,
  CaseAttempt,
  Mistake,
  MasteryState,
  ReviewSchedule,
  StudySession,
  Student,
} from "./entities.js";

const now = new Date();

describe("Learning entities", () => {
  const student: Student = {
    id: "student-1",
    name: "Juan Pérez",
    email: "juan@example.com",
    passwordHash: "scrypt:fixture",
    role: "student",
    createdAt: now,
    updatedAt: now,
  };

  const concept: Concept = {
    id: "concept-1",
    objectiveId: "obj-1",
    name: "Mandamiento de Pago",
    description: "Acto administrativo que ordena el cobro coactivo",
    evidenceIds: ["ev-1"],
    createdAt: now,
    updatedAt: now,
  };

  const question: Question = {
    id: "q-1",
    objectiveId: "obj-1",
    type: "multiple_choice",
    difficulty: 0.5,
    stem: "¿Cuál es el requisito principal del mandamiento de pago?",
    options: [
      { key: "A", text: "Título ejecutivo claro" },
      { key: "B", text: "Autorización judicial" },
      { key: "C", text: "Concepto de la DIAN" },
      { key: "D", text: "Recurso de reposición" },
    ],
    correctAnswer: "A",
    explanation: "El mandamiento de pago requiere un título ejecutivo claro, expreso y exigible.",
    errorType: "CONCEPT_CONFUSION",
    evidenceIds: ["ev-1"],
    editorialStatus: "published",
    reviewedBy: "editor-1",
    reviewedAt: now,
    createdAt: now,
    updatedAt: now,
  };

  const situationalCase: Case = {
    id: "case-1",
    objectiveId: "obj-1",
    difficulty: 0.7,
    scenario: "Un contribuyente recibe mandamiento de pago sin firma del funcionario competente...",
    expectedAnalysis: "El mandamiento de pago es nulo por falta de competencia del funcionario.",
    evidenceIds: ["ev-1"],
    createdAt: now,
    updatedAt: now,
  };

  const session: StudySession = {
    id: "session-1",
    studentId: student.id,
    competencyId: "comp-1",
    mode: "PRACTICE",
    focusObjectiveId: null,
    startedAt: now,
    finishedAt: null,
    totalQuestions: 0,
    correctAnswers: 0,
    createdAt: now,
    updatedAt: now,
  };

  const correctAttempt: QuestionAttempt = {
    id: "attempt-1",
    studentId: student.id,
    questionId: question.id,
    sessionId: session.id,
    answer: "A",
    result: "correct",
    timeSpentMs: 12000,
    confidence: 0.8,
    difficulty: 0.5,
    evidenceSnapshots: [],
    createdAt: now,
    updatedAt: now,
  };

  const incorrectAttempt: QuestionAttempt = {
    id: "attempt-2",
    studentId: student.id,
    questionId: question.id,
    sessionId: session.id,
    answer: "B",
    result: "incorrect",
    timeSpentMs: 8000,
    confidence: 0.4,
    difficulty: 0.5,
    evidenceSnapshots: [],
    createdAt: now,
    updatedAt: now,
  };

  const caseAttempt: CaseAttempt = {
    id: "cattempt-1",
    studentId: student.id,
    caseId: situationalCase.id,
    sessionId: session.id,
    response: "El mandamiento es nulo...",
    result: "correct",
    timeSpentMs: 45000,
    createdAt: now,
    updatedAt: now,
  };

  const mistake: Mistake = {
    id: "mistake-1",
    attemptId: incorrectAttempt.id,
    objectiveId: "obj-1",
    type: "conceptual_error",
    description: "Confundió requisito de título ejecutivo con autorización judicial",
    createdAt: now,
    updatedAt: now,
  };

  const mastery: MasteryState = {
    id: "mastery-1",
    studentId: student.id,
    objectiveId: "obj-1",
    mastery: 0.6,
    confidence: 0.5,
    retention: 0.7,
    recall: 0.7,
    comprehension: 0.6,
    application: 0.5,
    sourceAwareness: 0.6,
    stability: 0.5,
    totalAttempts: 2,
    correctAttempts: 1,
    consecutiveCorrect: 1,
    lastAttemptAt: now,
    createdAt: now,
    updatedAt: now,
  };

  const review: ReviewSchedule = {
    id: "review-1",
    studentId: student.id,
    objectiveId: "obj-1",
    scheduledAt: new Date(now.getTime() + 86400000), // tomorrow
    interval: 1,
    completed: false,
    completedAt: null,
    createdAt: now,
    updatedAt: now,
  };

  describe("Student", () => {
    it("should create a valid student", () => {
      expect(student.name).toBe("Juan Pérez");
      expect(student.email).toBe("juan@example.com");
    });
  });

  describe("Concept", () => {
    it("should link to a learning objective and evidence", () => {
      expect(concept.objectiveId).toBe("obj-1");
      expect(concept.evidenceIds).toContain("ev-1");
    });
  });

  describe("Question", () => {
    it("should have a stem, options, and correct answer", () => {
      expect(question.type).toBe("multiple_choice");
      expect(question.options).toHaveLength(4);
      expect(question.correctAnswer).toBe("A");
    });

    it("should have difficulty between 0 and 1", () => {
      expect(question.difficulty).toBeGreaterThanOrEqual(0);
      expect(question.difficulty).toBeLessThanOrEqual(1);
    });
  });

  describe("Case", () => {
    it("should have a scenario and expected analysis", () => {
      expect(situationalCase.scenario).toBeTruthy();
      expect(situationalCase.expectedAnalysis).toBeTruthy();
    });
  });

  describe("QuestionAttempt", () => {
    it("should record correct attempt with time and confidence", () => {
      expect(correctAttempt.result).toBe("correct");
      expect(correctAttempt.timeSpentMs).toBe(12000);
      expect(correctAttempt.confidence).toBe(0.8);
    });

    it("should record incorrect attempt", () => {
      expect(incorrectAttempt.result).toBe("incorrect");
      expect(incorrectAttempt.answer).toBe("B");
    });

    it("should link to student, question, and session", () => {
      expect(correctAttempt.studentId).toBe(student.id);
      expect(correctAttempt.questionId).toBe(question.id);
      expect(correctAttempt.sessionId).toBe(session.id);
    });
  });

  describe("CaseAttempt", () => {
    it("should record the case resolution attempt", () => {
      expect(caseAttempt.caseId).toBe(situationalCase.id);
      expect(caseAttempt.result).toBe("correct");
    });
  });

  describe("Mistake", () => {
    it("should link to an incorrect attempt and objective", () => {
      expect(mistake.attemptId).toBe(incorrectAttempt.id);
      expect(mistake.objectiveId).toBe("obj-1");
      expect(mistake.type).toBe("conceptual_error");
    });
  });

  describe("MasteryState", () => {
    it("should track mastery metrics", () => {
      expect(mastery.mastery).toBe(0.6);
      expect(mastery.totalAttempts).toBe(2);
      expect(mastery.correctAttempts).toBe(1);
    });

    it("should have values between 0 and 1", () => {
      expect(mastery.mastery).toBeGreaterThanOrEqual(0);
      expect(mastery.mastery).toBeLessThanOrEqual(1);
      expect(mastery.confidence).toBeGreaterThanOrEqual(0);
      expect(mastery.confidence).toBeLessThanOrEqual(1);
      expect(mastery.retention).toBeGreaterThanOrEqual(0);
      expect(mastery.retention).toBeLessThanOrEqual(1);
    });
  });

  describe("ReviewSchedule", () => {
    it("should schedule a future review", () => {
      expect(review.scheduledAt.getTime()).toBeGreaterThan(now.getTime());
      expect(review.interval).toBe(1);
      expect(review.completed).toBe(false);
    });
  });

  describe("StudySession", () => {
    it("should track session for a competency", () => {
      expect(session.studentId).toBe(student.id);
      expect(session.competencyId).toBe("comp-1");
      expect(session.finishedAt).toBeNull();
    });
  });

  describe("Full learning cycle", () => {
    it("should maintain the chain: Question → Attempt → Mistake → Mastery → Review", () => {
      // Question belongs to an objective
      expect(question.objectiveId).toBe("obj-1");
      // Attempt answers a question
      expect(incorrectAttempt.questionId).toBe(question.id);
      // Mistake references the attempt
      expect(mistake.attemptId).toBe(incorrectAttempt.id);
      // Mastery tracks the objective
      expect(mastery.objectiveId).toBe("obj-1");
      // Review schedules for the objective
      expect(review.objectiveId).toBe("obj-1");
    });
  });
});
