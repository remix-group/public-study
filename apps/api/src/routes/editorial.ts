import { Router, type NextFunction, type Response, type Router as ExpressRouter } from "express";
import { z } from "zod";
import { requireAuth, requireEditor } from "../auth/middleware.js";
import { createEditorialQuestion, getEditorialCatalog, setQuestionPublication, updateEditorialQuestion } from "../application/editorial-content.js";
import { AttemptConflictError, AttemptNotFoundError } from "../application/submit-question-attempt.js";

export const editorialRouter: ExpressRouter = Router();
editorialRouter.use(requireAuth, requireEditor);

const questionSchema = z.object({
  objectiveId: z.string().min(1), difficulty: z.number().min(0).max(1), stem: z.string().trim().min(10),
  options: z.array(z.object({ key: z.string().trim().min(1).max(3), text: z.string().trim().min(1) })).min(2).max(6),
  correctAnswer: z.string().min(1), explanation: z.string().trim().min(10),
  evidenceIds: z.array(z.string().min(1)).min(1),
});

function editorialError(error: unknown, res: Response, next: NextFunction) {
  if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors });
  if (error instanceof AttemptNotFoundError) return res.status(404).json({ error: error.message });
  if (error instanceof AttemptConflictError) return res.status(409).json({ error: error.message });
  next(error);
}

editorialRouter.get("/catalog", async (_req, res, next) => {
  try { res.json(await getEditorialCatalog()); } catch (error) { editorialError(error, res, next); }
});
editorialRouter.post("/questions", async (req, res, next) => {
  try { res.status(201).json(await createEditorialQuestion(questionSchema.parse(req.body))); } catch (error) { editorialError(error, res, next); }
});
editorialRouter.put("/questions/:id", async (req, res, next) => {
  try { res.json(await updateEditorialQuestion(req.params.id, questionSchema.parse(req.body))); } catch (error) { editorialError(error, res, next); }
});
editorialRouter.post("/questions/:id/publication", async (req, res, next) => {
  try {
    const { publish } = z.object({ publish: z.boolean() }).parse(req.body);
    res.json(await setQuestionPublication(req.params.id, publish, res.locals.studentId));
  } catch (error) { editorialError(error, res, next); }
});
