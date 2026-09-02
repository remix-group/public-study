import { prisma } from "@dian-study/infrastructure";
import type { AiProvider } from "../ai/provider.js";
import { AttemptConflictError, AttemptNotFoundError } from "./submit-question-attempt.js";

export async function generateDocumentStudyMaterial(documentId: string, provider: AiProvider) {
  const document = await prisma.legalDocument.findUnique({
    where: { id: documentId },
    include: { provisions: { where: { editorialStatus: { in: ["draft", "published"] } }, orderBy: { order: "asc" }, take: 20 } },
  });
  if (!document) throw new AttemptNotFoundError("Legal document not found");
  if (!document.provisions.length) throw new AttemptConflictError("El documento aún no contiene unidades jurídicas extraídas");
  const objectives = await prisma.learningObjective.findMany({ where: { status: "active", topic: { status: "active", block: { status: "active", competency: { status: "active" } } } }, orderBy: [{ topic: { block: { order: "asc" } } }, { topic: { order: "asc" } }, { order: "asc" }] });
  if (!objectives.length) throw new AttemptConflictError("No hay objetivos de aprendizaje configurados");

  const approved = await prisma.$transaction(async (tx) => {
    await tx.legalProvision.updateMany({ where: { id: { in: document.provisions.map(({ id }) => id) }, validationStatus: "pending" }, data: { validationStatus: "approved", editorialStatus: "published" } });
    return Promise.all(document.provisions.map(async (unit) => {
      const existing = await tx.evidence.findFirst({ where: { provisionId: unit.id } });
      return existing ?? tx.evidence.create({ data: { provisionId: unit.id, content: unit.content, citation: unit.citation } });
    }));
  });
  const generated = await provider.generateStudyMaterial({
    objectives: objectives.map(({ id, name, description }) => ({ id, name, description })),
    provisions: document.provisions.map(({ id, citation, content }) => ({ id, citation, content: content.slice(0, 5000) })),
    questionsPerProvision: 2,
  });
  const objectiveIds = new Set(objectives.map(({ id }) => id));
  const evidenceByProvision = new Map(approved.map((evidence) => [evidence.provisionId, evidence]));
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
    await tx.legalDocument.update({ where: { id: documentId }, data: { pipelineStatus: "PUBLISHED" } });
  });
  return { documentId, provider: provider.name, unitsApproved: document.provisions.length, evidencesReady: approved.length, questionsCreated: created, questionsSkipped: skipped };
}
