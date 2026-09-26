import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const inputPath = resolve(process.cwd(), "../../data/constitucion-politica-colombia-1991.json");
const input = JSON.parse(readFileSync(inputPath, "utf8"));
const source = input.sourceReference;
const documentId = input.document.id as string;
const versionId = input.version.id as string;

function anchor(value: string, id: string) {
  const normalized = value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `${normalized || "unidad"}-${id.slice(0, 8)}`;
}

function chunks<T>(items: T[], size: number) {
  const result: T[][] = [];
  for (let index = 0; index < items.length; index += size) result.push(items.slice(index, index + size));
  return result;
}

async function main() {
  const sourceReference = await prisma.sourceReference.upsert({
    where: { sourceHash: source.source_hash },
    update: { storageKey: source.storage_key, originalName: source.original_name, mimeType: source.mime_type, byteSize: source.byte_size },
    create: { id: source.id, sourceHash: source.source_hash, storageKey: source.storage_key, originalName: source.original_name, mimeType: source.mime_type, byteSize: source.byte_size },
  });

  await prisma.$transaction(async (tx) => {
    const document = await tx.legalDocument.upsert({
      where: { id: documentId },
      update: { title: "Constitución Política de Colombia de 1991", source: source.storage_key, authority: "Asamblea Nacional Constituyente", documentType: "constitution", contentHash: source.source_hash, originalFileKey: source.storage_key, pipelineStatus: "REVIEW_REQUIRED", status: "pending_review" },
      create: { id: documentId, title: "Constitución Política de Colombia de 1991", source: source.storage_key, authority: "Asamblea Nacional Constituyente", documentType: "constitution", officialUrl: "", contentHash: source.source_hash, originalFileKey: source.storage_key, pipelineStatus: "REVIEW_REQUIRED", effectiveFrom: new Date("1991-07-04T00:00:00Z"), status: "pending_review" },
    });
    const version = await tx.legalVersion.upsert({
      where: { id: versionId },
      update: { documentId: document.id, label: "Versión importada del PDF Constitución Política 1991", status: "pending_review", sourceHash: source.source_hash, sourceReferenceId: sourceReference.id, extractor: input.version.extractor, extractorVersion: input.version.extractor_version, isCurrent: true },
      create: { id: versionId, documentId: document.id, label: "Versión importada del PDF Constitución Política 1991", status: "pending_review", sourceHash: source.source_hash, sourceReferenceId: sourceReference.id, extractor: input.version.extractor, extractorVersion: input.version.extractor_version, isCurrent: true, effectiveFrom: new Date("1991-07-04T00:00:00Z") },
    });

    const evidenceByUnit = new Map<string, any>(input.evidence.map((row: any) => [row.legal_unit_id, row]));
    const units = input.legalUnits.map((row: any) => {
      const evidence = evidenceByUnit.get(row.id);
      return {
        id: row.id,
        documentId: document.id,
        versionId: version.id,
        parentProvisionId: row.parent_id || null,
        unitType: String(row.unit_type || "unit").toLowerCase(),
        anchor: anchor(row.label || row.heading || row.unit_type, row.id),
        order: Number(row.unit_order || 0),
        validationStatus: "pending",
        editorialStatus: "draft",
        number: row.label || `${row.unit_type} ${row.unit_order || 0}`,
        title: row.heading || row.label || row.unit_type || "Unidad constitucional",
        content: row.official_text || "",
        citation: `Constitución Política de Colombia de 1991${evidence?.page_start ? `, página${evidence.page_end && evidence.page_end !== evidence.page_start ? "s" : ""} ${evidence.page_start}${evidence.page_end && evidence.page_end !== evidence.page_start ? `-${evidence.page_end}` : ""}` : ""}`,
        effectiveFrom: new Date("1991-07-04T00:00:00Z"),
        status: "pending_review",
        sourceReferenceId: sourceReference.id,
        pageStart: evidence?.page_start ?? null,
        pageEnd: evidence?.page_end ?? null,
        charStart: evidence?.char_start ?? null,
        charEnd: evidence?.char_end ?? null,
        extractor: input.version.extractor,
        extractorVersion: input.version.extractor_version,
      };
    });
    const byId = new Map(units.map((unit: any) => [unit.id, unit]));
    const depth = (unit: any, seen = new Set<string>()): number => {
      if (!unit.parentProvisionId || !byId.has(unit.parentProvisionId) || seen.has(unit.id)) return 0;
      const next = new Set(seen).add(unit.id);
      return 1 + depth(byId.get(unit.parentProvisionId), next);
    };
    units.sort((left: any, right: any) => depth(left) - depth(right) || left.order - right.order);
    for (const batch of chunks(units, 250)) await tx.legalProvision.createMany({ data: batch, skipDuplicates: true });

    const evidences = input.evidence.map((row: any) => ({
      id: row.id,
      provisionId: row.legal_unit_id,
      content: row.content || "",
      citation: `Constitución Política de Colombia de 1991${row.page_start ? `, página${row.page_end && row.page_end !== row.page_start ? "s" : ""} ${row.page_start}${row.page_end && row.page_end !== row.page_start ? `-${row.page_end}` : ""}` : ""}`,
      sourceReferenceId: sourceReference.id,
      pageStart: row.page_start ?? null,
      pageEnd: row.page_end ?? null,
      charStart: row.char_start ?? null,
      charEnd: row.char_end ?? null,
      extractor: input.version.extractor,
      extractorVersion: input.version.extractor_version,
    }));
    for (const batch of chunks(evidences, 250)) await tx.evidence.createMany({ data: batch, skipDuplicates: true });
    console.log(JSON.stringify({ documentId: document.id, versionId: version.id, sourceReferenceId: sourceReference.id, units: units.length, evidences: evidences.length, status: "pending_review" }, null, 2));
  });
}

main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
