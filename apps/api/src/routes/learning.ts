import { Router, type Router as ExpressRouter } from "express";
import {
  LearningObjectivePrismaRepository,
  QuestionPrismaRepository,
} from "@dian-study/infrastructure";
import { getObjectiveStudyGuide, getStudentDashboard, getStudyLibrary } from "../application/study-session-progress.js";
import { getTopicKnowledgeGraph } from "../application/topic-knowledge-graph.js";
import { AttemptNotFoundError } from "../application/submit-question-attempt.js";
import { requireAuth } from "../auth/middleware.js";

export const learningRouter: ExpressRouter = Router();
learningRouter.use(requireAuth);

const objectiveRepo = new LearningObjectivePrismaRepository();
const questionRepo = new QuestionPrismaRepository();

/**
 * GET /api/learning/topics/:topicId/objectives
 * Returns learning objectives for a specific topic (useful for AC-001)
 */
learningRouter.get("/topics/:topicId/objectives", async (req, res) => {
  try {
    const { topicId } = req.params;
    const objectives = await objectiveRepo.findByTopicId(topicId);
    res.json(objectives);
  } catch (error) {
    console.error("Failed to fetch objectives:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

learningRouter.get("/topics/:topicId/graph", async (req, res, next) => {
  try {
    res.json(await getTopicKnowledgeGraph(req.params.topicId));
  } catch (error) {
    if (error instanceof AttemptNotFoundError) return res.status(404).json({ error: error.message });
    next(error);
  }
});

/**
 * GET /api/learning/objectives/:objectiveId/questions
 * Returns questions for a specific learning objective
 */
learningRouter.get("/objectives/:objectiveId/questions", async (req, res) => {
  try {
    const { objectiveId } = req.params;
    const questions = await questionRepo.findByObjectiveId(objectiveId);

    // Strip correct answers from payload before sending to client
    const safeQuestions = questions.map((q) => {
      const { correctAnswer, explanation, ...safeQ } = q;
      return safeQ;
    });

    res.json(safeQuestions);
  } catch (error) {
    console.error("Failed to fetch questions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

learningRouter.get("/dashboard", async (_req, res, next) => {
  try {
    res.json(await getStudentDashboard(res.locals.studentId));
  } catch (error) {
    if (error instanceof AttemptNotFoundError) return res.status(404).json({ error: error.message });
    next(error);
  }
});

learningRouter.get("/library", async (req, res, next) => {
  try {
    const page = typeof req.query.page === "string" ? Number(req.query.page) : 1;
    res.json(await getStudyLibrary({
      documentId: typeof req.query.documentId === "string" ? req.query.documentId : undefined,
      versionId: typeof req.query.versionId === "string" ? req.query.versionId : undefined,
      unitId: typeof req.query.unitId === "string" ? req.query.unitId : undefined,
      query: typeof req.query.query === "string" ? req.query.query : undefined,
      unitType: typeof req.query.unitType === "string" ? req.query.unitType : undefined,
      validationStatus: typeof req.query.validationStatus === "string" ? req.query.validationStatus : undefined,
      status: typeof req.query.status === "string" ? req.query.status : undefined,
      withIssues: req.query.withIssues === "true",
      page: Number.isFinite(page) ? page : 1,
    }));
  } catch (error) {
    next(error);
  }
});

learningRouter.get("/objectives/:objectiveId/guide", async (req, res, next) => {
  try {
    res.json(await getObjectiveStudyGuide(req.params.objectiveId, res.locals.studentId));
  } catch (error) {
    if (error instanceof AttemptNotFoundError) return res.status(404).json({ error: error.message });
    next(error);
  }
});
