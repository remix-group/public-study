import { prisma } from "@dian-study/infrastructure";
import type { AiProvider } from "../ai/provider.js";
import { ContentValidationAgent, RecoverableSourceResolver, type SourceVerificationPolicy } from "./content-validation.js";
import { AttemptConflictError, AttemptNotFoundError } from "./submit-question-attempt.js";

const generationBatchSize = 20;

export async function generateDocumentStudyMaterial(documentId: string, provider: AiProvider, sourceVerification: SourceVerificationPolicy = "local_then_official_url") {
  const document = await prisma.legalDocument.findUnique({
    where: { id: documentId },
    include: { provisions: { orderBy: { order: "asc" }, include: { version: { select: { isCurrent: true } } } } },
  });
  if (!document) throw new AttemptNotFoundError("Legal document not found");
  if (!document.provisions.length) throw new AttemptConflictError("El documento aún no contiene unidades jurídicas extraídas");
  const objectives = await prisma.learningObjective.findMany({ where: { status: "active", topic: { status: "active", block: { status: "active", competency: { status: "active" } } } }, orderBy: [{ topic: { block: { order: "asc" } } }, { topic: { order: "asc" } }, { order: "asc" }] });
  if (!objectives.length) throw new AttemptConflictError("No hay objetivos de aprendizaje configurados");

  // Full database inventory is supplied to the validator for duplicate and
  // mixed-version detection; no status filter or arbitrary row limit is used.
  const allProvisionKeys = await prisma.legalProvision.findMany({ select: { id: true, documentId: true, number: true, anchor: true, content: true, parentProvisionId: true } });
  const validation = await new ContentValidationAgent(new RecoverableSourceResolver()).validate({
    document: { originalFileKey: document.originalFileKey, sourceHash: document.contentHash, officialUrl: document.officialUrl },
    provisions: document.provisions.map((unit) => ({ ...unit, versionIsCurrent: unit.version?.isCurrent ?? null })),
    allProvisionKeys,
    policy: sourceVerification,
  });
  const acceptedIds = new Set(validation.provisions.filter(({ decision }) => decision === "accepted").map(({ provisionId }) => provisionId));
  const validatedUnits = document.provisions.filter(({ id }) => acceptedIds.has(id));
  if (!validatedUnits.length) throw new AttemptConflictError("El subagente validador no encontró unidades utilizables; revisa el informe de validación y la fuente original");

  const evidences = await prisma.$transaction(async (tx) => Promise.all(validatedUnits.map(async (unit) => {
      const existing = await tx.evidence.findFirst({ where: { provisionId: unit.id } });
      return existing ?? tx.evidence.create({ data: {
        provisionId: unit.id, content: unit.content, citation: unit.citation, sourceReferenceId: unit.sourceReferenceId,
        pageStart: unit.pageStart, pageEnd: unit.pageEnd, charStart: unit.charStart, charEnd: unit.charEnd,
        extractor: unit.extractor, extractorVersion: unit.extractorVersion,
      } });
  })));
  const generated = (await Promise.all(Array.from({ length: Math.ceil(validatedUnits.length / generationBatchSize) }, (_, batch) => {
    const provisions = validatedUnits.slice(batch * generationBatchSize, (batch + 1) * generationBatchSize);
    return provider.generateStudyMaterial({ objectives: objectives.map(({ id, name, description }) => ({ id, name, description })), provisions: provisions.map(({ id, citation, content }) => ({ id, citation, content: content.slice(0, 5000) })), questionsPerProvision: 2 });
  }))).flat();
  const objectiveIds = new Set(objectives.map(({ id }) => id));
  const evidenceByProvision = new Map(evidences.map((evidence) => [evidence.provisionId, evidence]));
  const valid = generated.filter((question) => {
    const keys = new Set(question.options.map(({ key }) => key));
    return objectiveIds.has(question.objectiveId) && evidenceByProvision.has(question.provisionId) && keys.size === 4 && keys.has(question.correctAnswer) && question.confidence >= 0.8;
  });
  if (!valid.length) throw new AttemptConflictError("El proveedor no generó preguntas con confianza y evidencia suficientes");

  let created = 0;
  let skipped = generated.length - valid.length;
  await prisma.$transaction(async (tx) => {
    for (const question of valid) {
      const duplicate = await tx.question.findFirst({ where: { objectiveId: question.objectiveId, stem: question.stem } });
      if (duplicate) { skipped += 1; continue; }
      const evidence = evidenceByProvision.get(question.provisionId)!;
      const saved = await tx.question.create({ data: { objectiveId: question.objectiveId, type: "multiple_choice", difficulty: question.difficulty, stem: question.stem, options: question.options, correctAnswer: question.correctAnswer, explanation: question.explanation, editorialStatus: "published" } });
      await tx.questionEvidence.create({ data: { questionId: saved.id, evidenceId: evidence.id } });
      created += 1;
    }
  });
  return { documentId, provider: provider.name, validation, unitsValidated: validatedUnits.length, unitsExcluded: document.provisions.length - validatedUnits.length, evidencesReady: evidences.length, questionsCreated: created, questionsSkipped: skipped };
}
