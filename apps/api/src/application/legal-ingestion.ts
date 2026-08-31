import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { promisify } from "node:util";
import { prisma } from "@dian-study/infrastructure";
import { AttemptConflictError, AttemptNotFoundError } from "./submit-question-attempt.js";

const execFileAsync = promisify(execFile);
const articleHeading = /^\s*(ART[IÍ]CULO)\s+([0-9]+(?:-[0-9]+)?[A-Z]?)\.?\s*(?:[-–—.]\s*)?(.*)$/gim;

export type ExtractedLegalUnit = { unitType: "article"; number: string; title: string; anchor: string; content: string };

export function normalizeExtractedText(text: string) {
  return text.replace(/\f/g, "\n").replace(/\r\n?/g, "\n").replace(/-\n(?=[a-záéíóúñ])/g, "").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

export function parseLegalUnits(text: string): ExtractedLegalUnit[] {
  const normalized = normalizeExtractedText(text);
  const matches = [...normalized.matchAll(articleHeading)];
  return matches.map((match, index) => {
    const numericPart = match[2].toUpperCase();
    const start = (match.index ?? 0) + match[0].length;
    const end = matches[index + 1]?.index ?? normalized.length;
    const body = normalized.slice(start, end).trim();
    return { unitType: "article" as const, number: `Artículo ${numericPart}`, title: match[3].trim(), anchor: `articulo-${numericPart.toLowerCase()}`, content: [match[0].trim(), body].filter(Boolean).join("\n\n") };
  }).filter((unit) => unit.content.length > unit.number.length);
}

function storageRoot() {
  return resolve(process.env.LEGAL_STORAGE_PATH ?? join(process.cwd(), "data", "legal-sources"));
}

export async function ingestLegalPdf(documentId: string, pdf: Buffer, versionLabel?: string) {
  if (pdf.length < 5 || pdf.subarray(0, 5).toString("ascii") !== "%PDF-") throw new AttemptConflictError("El archivo no tiene una cabecera PDF válida");
  const document = await prisma.legalDocument.findUnique({ where: { id: documentId }, include: { versions: { where: { isCurrent: true }, take: 1 } } });
  if (!document) throw new AttemptNotFoundError("Legal document not found");

  const hash = createHash("sha256").update(pdf).digest("hex");
  const relativeKey = join(documentId, `${hash}.pdf`);
  const documentDirectory = join(storageRoot(), documentId);
  const pdfPath = join(storageRoot(), relativeKey);
  const textPath = join(documentDirectory, `${hash}.txt`);
  await mkdir(documentDirectory, { recursive: true });
  await writeFile(pdfPath, pdf, { flag: "wx" }).catch((error: NodeJS.ErrnoException) => { if (error.code !== "EEXIST") throw error; });
  await prisma.legalDocument.update({ where: { id: documentId }, data: { contentHash: hash, originalFileKey: relativeKey, pipelineStatus: "VALIDATED" } });

  try {
    await execFileAsync("pdftotext", ["-layout", "-enc", "UTF-8", pdfPath, textPath]);
    const extractedText = await readFile(textPath, "utf8");
    await prisma.legalDocument.update({ where: { id: documentId }, data: { pipelineStatus: "EXTRACTED" } });
    const units = parseLegalUnits(extractedText);
    if (units.length === 0) throw new AttemptConflictError("No se detectaron encabezados de artículos en el PDF");

    const result = await prisma.$transaction(async (tx) => {
      let version = document.versions[0];
      if (!version) {
        version = await tx.legalVersion.create({ data: { documentId, label: versionLabel?.trim() || `Ingesta ${new Date().toISOString().slice(0, 10)}`, effectiveFrom: document.effectiveFrom, effectiveUntil: document.effectiveUntil, status: document.status, sourceHash: hash, isCurrent: true } });
      } else version = await tx.legalVersion.update({ where: { id: version.id }, data: { sourceHash: hash } });
      await tx.legalProvision.deleteMany({ where: { versionId: version.id, validationStatus: "pending", editorialStatus: "draft" } });
      await tx.legalProvision.createMany({ data: units.map((unit, order) => ({ documentId, versionId: version.id, unitType: unit.unitType, anchor: unit.anchor, order, validationStatus: "pending", editorialStatus: "draft", number: unit.number, title: unit.title, content: unit.content, citation: `${document.title}, ${unit.number}`, effectiveFrom: document.effectiveFrom, effectiveUntil: document.effectiveUntil, status: document.status })) });
      await tx.legalDocument.update({ where: { id: documentId }, data: { pipelineStatus: "REVIEW_REQUIRED" } });
      return { versionId: version.id };
    });
    return { documentId, ...result, hash, unitsCreated: units.length, pipelineStatus: "REVIEW_REQUIRED" as const };
  } catch (error) {
    await prisma.legalDocument.update({ where: { id: documentId }, data: { pipelineStatus: "FAILED" } });
    throw error;
  }
}
