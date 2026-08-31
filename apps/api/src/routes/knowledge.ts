import express, { Router, type NextFunction, type Response, type Router as ExpressRouter } from "express";
import { z } from "zod";
import { requireAuth, requireEditor } from "../auth/middleware.js";
import { createLegalDocument, createLegalEvidence, createLegalUnit, createLegalVersion, createNormRelation, getKnowledgeCatalog, reviewLegalUnit, transitionDocument } from "../application/legal-knowledge.js";
import { AttemptConflictError, AttemptNotFoundError } from "../application/submit-question-attempt.js";
import { ingestLegalPdf } from "../application/legal-ingestion.js";
import { generateDocumentStudyMaterial } from "../application/automated-content.js";
import { getAiProvider, AiProviderConfigurationError, AiProviderResponseError } from "../ai/index.js";
import { buildManualGenerationPrompt, importedQuestionsSchema, manualImportProvider } from "../application/manual-content.js";

export const knowledgeRouter: ExpressRouter = Router();
knowledgeRouter.use(requireAuth, requireEditor);
const date = z.string().datetime().transform((value) => new Date(value));

function handle(error: unknown, res: Response, next: NextFunction) {
  if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors });
  if (error instanceof AttemptNotFoundError) return res.status(404).json({ error: error.message });
  if (error instanceof AttemptConflictError) return res.status(409).json({ error: error.message });
  if (error instanceof AiProviderConfigurationError) return res.status(409).json({ error: error.message });
  if (error instanceof AiProviderResponseError) return res.status(502).json({ error: error.message });
  next(error);
}

knowledgeRouter.get("/catalog", async (_req, res, next) => { try { res.json(await getKnowledgeCatalog()); } catch (error) { handle(error, res, next); } });
knowledgeRouter.post("/documents", async (req, res, next) => {
  try { res.status(201).json(await createLegalDocument(z.object({ title: z.string().min(3), authority: z.string().min(2), documentType: z.string().min(2), officialUrl: z.string().url(), effectiveFrom: date, effectiveUntil: date.nullish() }).parse(req.body))); } catch (error) { handle(error, res, next); }
});
knowledgeRouter.post("/documents/:id/transition", async (req, res, next) => {
  try { res.json(await transitionDocument(req.params.id, z.object({ target: z.string() }).parse(req.body).target)); } catch (error) { handle(error, res, next); }
});
knowledgeRouter.post("/documents/:id/ingest", express.raw({ type: "application/pdf", limit: "25mb" }), async (req, res, next) => {
  try {
    if (!Buffer.isBuffer(req.body)) throw new AttemptConflictError("Se esperaba un archivo PDF");
    res.status(201).json(await ingestLegalPdf(req.params.id, req.body, req.header("x-version-label") ?? undefined));
  } catch (error) { handle(error, res, next); }
});
knowledgeRouter.post("/documents/:id/generate", async (req, res, next) => {
  try { res.status(201).json(await generateDocumentStudyMaterial(req.params.id, getAiProvider())); }
  catch (error) { handle(error, res, next); }
});
knowledgeRouter.get("/documents/:id/generation-prompt", async (req, res, next) => {
  try { res.json(await buildManualGenerationPrompt(req.params.id)); }
  catch (error) { handle(error, res, next); }
});
knowledgeRouter.post("/documents/:id/import-material", async (req, res, next) => {
  try {
    const { questions } = importedQuestionsSchema.parse(req.body);
    res.status(201).json(await generateDocumentStudyMaterial(req.params.id, manualImportProvider(questions)));
  } catch (error) { handle(error, res, next); }
});
knowledgeRouter.post("/versions", async (req, res, next) => {
  try { res.status(201).json(await createLegalVersion(z.object({ documentId: z.string(), label: z.string().min(2), effectiveFrom: date, effectiveUntil: date.nullish(), status: z.enum(["vigente", "derogado", "modificado", "suspendido"]), sourceHash: z.string().nullish(), isCurrent: z.boolean() }).parse(req.body))); } catch (error) { handle(error, res, next); }
});
knowledgeRouter.post("/units", async (req, res, next) => {
  try { res.status(201).json(await createLegalUnit(z.object({ documentId: z.string(), versionId: z.string(), parentProvisionId: z.string().nullish(), unitType: z.enum(["title", "chapter", "article", "paragraph", "subparagraph", "numeral", "annex"]), anchor: z.string().min(1), order: z.number().int().min(0), number: z.string().min(1), title: z.string(), content: z.string().min(1), citation: z.string().min(2), effectiveFrom: date, effectiveUntil: date.nullish(), status: z.enum(["vigente", "derogado", "modificado", "suspendido"]) }).parse(req.body))); } catch (error) { handle(error, res, next); }
});
knowledgeRouter.post("/units/:id/review", async (req, res, next) => {
  try { res.json(await reviewLegalUnit(req.params.id, z.object({ decision: z.enum(["approved", "rejected"]) }).parse(req.body).decision)); } catch (error) { handle(error, res, next); }
});
knowledgeRouter.post("/evidences", async (req, res, next) => {
  try { res.status(201).json(await createLegalEvidence(z.object({ provisionId: z.string(), content: z.string().min(1), citation: z.string().min(2) }).parse(req.body))); } catch (error) { handle(error, res, next); }
});
knowledgeRouter.post("/relations", async (req, res, next) => {
  try { res.status(201).json(await createNormRelation(z.object({ sourceProvisionId: z.string(), targetProvisionId: z.string(), type: z.enum(["MODIFIES", "ADDS", "REPEALS", "REPLACES", "REFERENCES", "REGULATES"]), description: z.string().min(3) }).parse(req.body))); } catch (error) { handle(error, res, next); }
});
