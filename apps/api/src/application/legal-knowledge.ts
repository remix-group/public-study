import { prisma } from "@dian-study/infrastructure";
import { AttemptConflictError, AttemptNotFoundError } from "./submit-question-attempt.js";

const pipelineOrder = ["RECEIVED", "VALIDATED", "EXTRACTED", "PARSED", "ENRICHED", "INDEXED", "DRAFT_KNOWLEDGE", "REVIEW_REQUIRED", "PUBLISHED"] as const;

export async function getKnowledgeCatalog() {
  const documents = await prisma.legalDocument.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      versions: { orderBy: { effectiveFrom: "desc" } },
      provisions: { orderBy: { order: "asc" }, include: { evidences: true } },
    },
  });
  const relations = await prisma.legalRelation.findMany({
    orderBy: { createdAt: "desc" }, include: { sourceProvision: true, targetProvision: true },
  });
  return { documents, relations, pipelineStates: [...pipelineOrder, "FAILED"] };
}

export async function createLegalDocument(input: {
  title: string; authority: string; documentType: string; officialUrl: string;
  effectiveFrom: Date; effectiveUntil?: Date | null;
}) {
  return prisma.legalDocument.create({
    data: {
      title: input.title, authority: input.authority, documentType: input.documentType,
      officialUrl: input.officialUrl, source: input.officialUrl,
      effectiveFrom: input.effectiveFrom, effectiveUntil: input.effectiveUntil ?? null,
      status: "vigente", pipelineStatus: "RECEIVED",
    },
  });
}

export async function transitionDocument(id: string, target: string) {
  const document = await prisma.legalDocument.findUnique({ where: { id } });
  if (!document) throw new AttemptNotFoundError("Legal document not found");
  if (target !== "FAILED") {
    const currentIndex = pipelineOrder.indexOf(document.pipelineStatus as typeof pipelineOrder[number]);
    const targetIndex = pipelineOrder.indexOf(target as typeof pipelineOrder[number]);
    if (targetIndex < 0 || targetIndex !== currentIndex + 1) {
      throw new AttemptConflictError("Pipeline transitions must advance exactly one state");
    }
  }
  return prisma.legalDocument.update({ where: { id }, data: { pipelineStatus: target } });
}

export async function createLegalVersion(input: {
  documentId: string; label: string; effectiveFrom: Date; effectiveUntil?: Date | null;
  status: string; sourceHash?: string | null; isCurrent: boolean;
}) {
  const document = await prisma.legalDocument.findUnique({ where: { id: input.documentId } });
  if (!document) throw new AttemptNotFoundError("Legal document not found");
  return prisma.$transaction(async (tx) => {
    if (input.isCurrent) await tx.legalVersion.updateMany({ where: { documentId: input.documentId }, data: { isCurrent: false } });
    return tx.legalVersion.create({ data: { ...input, effectiveUntil: input.effectiveUntil ?? null, sourceHash: input.sourceHash ?? null } });
  });
}

export async function createLegalUnit(input: {
  documentId: string; versionId: string; parentProvisionId?: string | null; unitType: string;
  anchor: string; order: number; number: string; title: string; content: string; citation: string;
  effectiveFrom: Date; effectiveUntil?: Date | null; status: string;
}) {
  const version = await prisma.legalVersion.findFirst({ where: { id: input.versionId, documentId: input.documentId } });
  if (!version) throw new AttemptConflictError("Version does not belong to document");
  return prisma.legalProvision.create({
    data: { ...input, parentProvisionId: input.parentProvisionId ?? null, effectiveUntil: input.effectiveUntil ?? null, validationStatus: "pending", editorialStatus: "draft" },
  });
}

export async function reviewLegalUnit(id: string, decision: "approved" | "rejected") {
  const unit = await prisma.legalProvision.findUnique({ where: { id }, include: { version: true } });
  if (!unit) throw new AttemptNotFoundError("Legal unit not found");
  return prisma.legalProvision.update({
    where: { id }, data: { validationStatus: decision, editorialStatus: decision === "approved" ? "published" : "draft" },
  });
}

export async function createLegalEvidence(input: { provisionId: string; content: string; citation: string }) {
  const unit = await prisma.legalProvision.findUnique({ where: { id: input.provisionId } });
  if (!unit) throw new AttemptNotFoundError("Legal unit not found");
  if (unit.validationStatus !== "approved" || unit.editorialStatus !== "published") {
    throw new AttemptConflictError("Evidence requires an approved and published legal unit");
  }
  return prisma.evidence.create({ data: input });
}

export async function createNormRelation(input: { sourceProvisionId: string; targetProvisionId: string; type: string; description: string }) {
  if (input.sourceProvisionId === input.targetProvisionId) throw new AttemptConflictError("A legal unit cannot relate to itself");
  const count = await prisma.legalProvision.count({ where: { id: { in: [input.sourceProvisionId, input.targetProvisionId] } } });
  if (count !== 2) throw new AttemptNotFoundError("Source or target legal unit not found");
  return prisma.legalRelation.create({ data: input });
}
