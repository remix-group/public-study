import { describe, it, expect, beforeEach } from "vitest";
import { LearningEngine } from "./engine.js";
import type { MasteryState, QuestionAttempt } from "@dian-study/domain";

describe("LearningEngine", () => {
  let engine: LearningEngine;
  let initialState: MasteryState;
  const now = new Date("2026-08-24T10:00:00Z");

  beforeEach(() => {
    engine = new LearningEngine();
    initialState = engine.initializeMastery("student-1", "obj-1", now);
  });

  it("should initialize a zeroed mastery state", () => {
    expect(initialState.mastery).toBe(0);
    expect(initialState.totalAttempts).toBe(0);
    expect(initialState.correctAttempts).toBe(0);
  });

  describe("evaluateAttempt (Correct Answer)", () => {
    it("should increase mastery and schedule review for tomorrow on first correct attempt", () => {
      const attempt: QuestionAttempt = {
        id: "attempt-1",
        studentId: "student-1",
        questionId: "q-1",
        sessionId: "sess-1",
        answer: "A",
        result: "correct",
        timeSpentMs: 5000,
        confidence: 0.8,
        difficulty: 0.5,
        evidenceSnapshots: [],
        createdAt: now,
        updatedAt: now,
      };

      const result = engine.evaluateAttempt(initialState, attempt, [], 0.5, now);

      expect(result.newState.mastery).toBeGreaterThan(0);
      expect(result.newState.totalAttempts).toBe(1);
      expect(result.newState.correctAttempts).toBe(1);
      expect(result.intervalDays).toBe(1); // First correct answers schedules for 1 day later

      const expectedDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      expect(result.nextReviewDate.toISOString()).toBe(expectedDate.toISOString());
    });

    it("should exponentially increase interval for consecutive correct answers", () => {
      const attempt: QuestionAttempt = {
        id: "attempt-1",
        studentId: "student-1",
        questionId: "q-1",
        sessionId: "sess-1",
        answer: "A",
        result: "correct",
        timeSpentMs: 5000,
        confidence: 0.8,
        difficulty: 0.5,
        evidenceSnapshots: [],
        createdAt: now,
        updatedAt: now,
      };

      let state = initialState;
      let lastResult;

      // Attempt 1 (1 day)
      lastResult = engine.evaluateAttempt(state, attempt, [], 0.5, now);
      state = lastResult.newState;
      expect(lastResult.intervalDays).toBe(1);

      // Attempt 2 (3 days)
      lastResult = engine.evaluateAttempt(state, attempt, [], 0.5, now);
      state = lastResult.newState;
      expect(lastResult.intervalDays).toBe(3);

      // Attempt 3 (4+ days - exponential)
      lastResult = engine.evaluateAttempt(state, attempt, [], 0.5, now);
      state = lastResult.newState;
      expect(lastResult.intervalDays).toBeGreaterThan(3);

      // Attempt 4 (exponential)
      lastResult = engine.evaluateAttempt(state, attempt, [], 0.5, now);
      state = lastResult.newState;
      expect(lastResult.intervalDays).toBeGreaterThan(3);
    });
  });

  describe("evaluateAttempt (Incorrect Answer - AC-003)", () => {
    it("should decrease mastery and retention when failing", () => {
      // First, get some mastery
      const correctAttempt: QuestionAttempt = {
        id: "attempt-1",
        studentId: "student-1",
        questionId: "q-1",
        sessionId: "sess-1",
        answer: "A",
        result: "correct",
        timeSpentMs: 5000,
        confidence: 0.8,
        difficulty: 0.5,
        evidenceSnapshots: [],
        createdAt: now,
        updatedAt: now,
      };

      const goodState = engine.evaluateAttempt(initialState, correctAttempt, [], 0.5, now).newState;
      const initialMastery = goodState.mastery;
      const initialRetention = goodState.retention;

      // Then fail
      const incorrectAttempt: QuestionAttempt = {
        id: "attempt-2",
        studentId: "student-1",
        questionId: "q-2",
        sessionId: "sess-1",
        answer: "B",
        result: "incorrect",
        timeSpentMs: 4000,
        confidence: 0.9, // High confidence but wrong!
        difficulty: 0.5,
        evidenceSnapshots: [],
        createdAt: now,
        updatedAt: now,
      };

      const result = engine.evaluateAttempt(goodState, incorrectAttempt, [], 0.5, now);

      expect(result.newState.mastery).toBeLessThan(initialMastery);
      expect(result.newState.retention).toBeLessThan(initialRetention);
      expect(result.newState.totalAttempts).toBe(2);
      expect(result.newState.correctAttempts).toBe(1); // Unchanged

      // Interval resets to 1 day because consecutive correct is broken
      expect(result.intervalDays).toBe(1);
    });
  });

  describe("Edge cases", () => {
    it("should not allow mastery to exceed 1.0 or drop below 0.0", () => {
      const attempt: QuestionAttempt = {
        id: "attempt-1",
        studentId: "student-1",
        questionId: "q-1",
        sessionId: "sess-1",
        answer: "A",
        result: "correct",
        timeSpentMs: 5000,
        confidence: 1.0,
        difficulty: 0.9,
        evidenceSnapshots: [],
        createdAt: now,
        updatedAt: now,
      };

      let state = initialState;
      // Answer correctly 50 times
      for (let i = 0; i < 50; i++) {
        state = engine.evaluateAttempt(state, attempt, [], 0.9, now).newState;
      }

      expect(state.mastery).toBeLessThanOrEqual(1.0);
      expect(state.mastery).toBeGreaterThan(0.9); // Should be very close to 1
    });
  });
});
