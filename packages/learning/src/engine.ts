import type { MasteryState, QuestionAttempt, CaseAttempt, Mistake } from "@dian-study/domain";

/**
 * Result of evaluating an attempt and calculating the new mastery state.
 */
export interface EvaluationResult {
  newState: MasteryState;
  nextReviewDate: Date;
  intervalDays: number;
}

export class LearningEngine {
  /**
   * Calculates the updated mastery state after a student attempts a question or case.
   * Based on a simplified SM-2 / spaced repetition algorithm + Elo-like mastery scoring.
   *
   * @param currentState The student's current mastery state for the objective.
   * @param attempt The recent attempt (QuestionAttempt or CaseAttempt).
   * @param mistakes Any mistakes identified in the attempt.
   * @param difficulty The inherent difficulty of the item (0.0 to 1.0).
   * @param now The current date (used for scheduling).
   * @returns EvaluationResult containing the updated state and the next review schedule.
   */
  public evaluateAttempt(
    currentState: MasteryState,
    attempt: QuestionAttempt | CaseAttempt,
    mistakes: Mistake[],
    difficulty: number,
    now: Date = new Date()
  ): EvaluationResult {
    const isCorrect = attempt.result === "correct";
    const isPartial = attempt.result === "partial";

    // 1. Calculate Score (0.0 to 1.0)
    let score = 0;
    if (isCorrect) {
      score = 1.0;
    } else if (isPartial) {
      score = 0.5 - (mistakes.length * 0.1);
      if (score < 0.1) score = 0.1;
    }

    // Adjust score based on self-reported confidence if available (0.0 to 1.0)
    const confidence = 'confidence' in attempt && attempt.confidence !== null
      ? attempt.confidence
      : 0.5; // default neutral confidence

    if (isCorrect && confidence < 0.4) {
      score *= 0.8; // guessed correctly but low confidence
    }

    // 2. Update Mastery (Elo-like adjustment)
    // The change in mastery depends on the item difficulty and the score.
    // High difficulty correct -> larger increase
    // Low difficulty incorrect -> larger decrease
    const expectedScore = currentState.mastery;
    const learningRate = 0.2; // How fast mastery changes per attempt

    let newMastery = currentState.mastery + learningRate * (score - expectedScore) * (1 + difficulty);
    newMastery = Math.max(0, Math.min(1, newMastery)); // Clamp between 0 and 1

    // 3. Update Confidence (System's confidence in the student's mastery)
    // Increases as total attempts increase.
    let newSystemConfidence = currentState.confidence + 0.1;
    newSystemConfidence = Math.max(0, Math.min(1, newSystemConfidence));

    // 4. Calculate Retention and Spaced Repetition Interval (Simplified SM-2)
    // Track the current streak, not the historical number of correct attempts.
    const consecutiveCorrect = isCorrect ? currentState.consecutiveCorrect + 1 : 0;

    let intervalDays = 1;
    if (consecutiveCorrect === 0) {
      intervalDays = 1;
    } else if (consecutiveCorrect === 1) {
      intervalDays = 1;
    } else if (consecutiveCorrect === 2) {
      intervalDays = 3;
    } else {
      // Exponential growth for subsequent correct answers
      intervalDays = Math.round(3 * Math.pow(1.5, consecutiveCorrect - 2));
    }

    // Max interval 180 days
    if (intervalDays > 180) intervalDays = 180;

    const nextReviewDate = new Date(now.getTime() + intervalDays * 24 * 60 * 60 * 1000);

    // Retention drops if they got it wrong
    let newRetention = currentState.retention;
    if (isCorrect) {
      newRetention = Math.min(1, newRetention + 0.1);
    } else {
      newRetention = Math.max(0, newRetention - 0.2);
    }

    const updateDimension = (current: number, signal: number, rate = 0.18) =>
      Math.max(0, Math.min(1, current + rate * (signal - current)));
    const evidenceBacked = "evidenceSnapshots" in attempt && attempt.evidenceSnapshots.length > 0;
    const applicationSignal = difficulty >= 0.6 ? score : Math.max(0, score * 0.75);
    const newRecall = updateDimension(currentState.recall, score);
    const newComprehension = updateDimension(currentState.comprehension, score * (0.8 + difficulty * 0.2));
    const newApplication = updateDimension(currentState.application, applicationSignal, 0.14);
    const newSourceAwareness = updateDimension(currentState.sourceAwareness, evidenceBacked ? score : 0, 0.12);
    const newStability = updateDimension(currentState.stability, isCorrect ? newRetention : 0, 0.12);

    const newState: MasteryState = {
      ...currentState,
      mastery: newMastery,
      confidence: newSystemConfidence,
      retention: newRetention,
      recall: newRecall,
      comprehension: newComprehension,
      application: newApplication,
      sourceAwareness: newSourceAwareness,
      stability: newStability,
      totalAttempts: currentState.totalAttempts + 1,
      correctAttempts: isCorrect ? currentState.correctAttempts + 1 : currentState.correctAttempts,
      consecutiveCorrect,
      lastAttemptAt: now,
      updatedAt: now,
    };

    return {
      newState,
      nextReviewDate,
      intervalDays,
    };
  }

  /**
   * Initializes a blank mastery state for a new student-objective pair.
   */
  public initializeMastery(studentId: string, objectiveId: string, now: Date = new Date()): MasteryState {
    return {
      id: "", // Will be assigned by DB
      studentId,
      objectiveId,
      mastery: 0,
      confidence: 0,
      retention: 0,
      recall: 0,
      comprehension: 0,
      application: 0,
      sourceAwareness: 0,
      stability: 0,
      totalAttempts: 0,
      correctAttempts: 0,
      consecutiveCorrect: 0,
      lastAttemptAt: null,
      createdAt: now,
      updatedAt: now,
    };
  }
}
