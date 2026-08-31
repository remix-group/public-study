import { Router, type Router as ExpressRouter } from "express";
import { z } from "zod";
import { startStudySession, StudySessionNotFoundError } from "../application/start-study-session.js";
import {
  AttemptConflictError,
  AttemptNotFoundError,
  submitQuestionAttempt,
} from "../application/submit-question-attempt.js";
import { finishStudySession, getNextQuestion } from "../application/study-session-progress.js";
import { requireAuth } from "../auth/middleware.js";

export const sessionRouter: ExpressRouter = Router();
sessionRouter.use(requireAuth);

const startSchema = z.object({
  competencyId: z.string().min(1),
});
const attemptSchema = z.object({
  questionId: z.string().min(1),
  sessionId: z.string().min(1),
  answer: z.string().min(1),
  timeSpentMs: z.number().int().positive(),
  confidence: z.number().min(0).max(1).optional(),
});

sessionRouter.post("/", async (req, res, next) => {
  try {
    res.status(201).json(await startStudySession({ ...startSchema.parse(req.body), studentId: res.locals.studentId }));
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors });
    if (error instanceof StudySessionNotFoundError) return res.status(404).json({ error: error.message });
    next(error);
  }
});

sessionRouter.post("/attempt", async (req, res, next) => {
  try {
    res.status(201).json(await submitQuestionAttempt({ ...attemptSchema.parse(req.body), studentId: res.locals.studentId }));
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors });
    if (error instanceof AttemptNotFoundError) return res.status(404).json({ error: error.message });
    if (error instanceof AttemptConflictError) return res.status(409).json({ error: error.message });
    next(error);
  }
});

sessionRouter.get("/:sessionId/next", async (req, res, next) => {
  try {
    const objectiveId = z.string().min(1).optional().parse(req.query.objectiveId);
    res.json(await getNextQuestion(req.params.sessionId, res.locals.studentId, objectiveId));
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors });
    if (error instanceof AttemptNotFoundError) return res.status(404).json({ error: error.message });
    if (error instanceof AttemptConflictError) return res.status(409).json({ error: error.message });
    next(error);
  }
});

sessionRouter.post("/:sessionId/finish", async (req, res, next) => {
  try {
    res.json(await finishStudySession(req.params.sessionId, res.locals.studentId));
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors });
    if (error instanceof AttemptNotFoundError) return res.status(404).json({ error: error.message });
    if (error instanceof AttemptConflictError) return res.status(409).json({ error: error.message });
    next(error);
  }
});
