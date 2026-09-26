import type { PrismaClient } from "@prisma/client";
import { createReadStream, readFileSync } from "node:fs";
import { createInterface } from "node:readline";
import { fileURLToPath } from "node:url";
import { createGunzip } from "node:zlib";
import { curriculum236828, routeMarkdown } from "./curriculum-236828.js";
import { seedOpecFunctions } from "./opec-functions.js";

type Row = Record<string, string | null>;

const MATERIAL_DIR = fileURLToPath(new URL("./material/", import.meta.url));
const DUMP_PATH = `${MATERIAL_DIR}legal_pipeline_combinada_2026-09-14.sql.gz`;
const MANUAL_PATH = `${MATERIAL_DIR}opec-236828-manual.txt`;
const ROUTE_PATH = `${MATERIAL_DIR}opec-236828-route.txt`;
const SOURCE_HASH = "472ac8a2ebec49f60b7d0fcc69b41d313918368f75aba448de8052f7747022d2";

const wantedTables = new Set([
  "documents",
  "document_versions",
  "source_references",
  "legal_units",
  "evidence",
  "study_guides",
  "visual_extractions",
]);

function decodeCopyValue(value: string): string | null {
  if (value === "\\N") return null;
  let result = "";
  for (let index = 0; index < value.length; index += 1) {
    if (value[index] !== "\\") {
      result += value[index];
      continue;
    }
    const next = value[index + 1];
    if (next === undefined) {
      result += "\\";
      continue;
    }
    index += 1;
    const simple: Record<string, string> = { b: "\b", f: "\f", n: "\n", r: "\r", t: "\t", v: "\v", "\\": "\\" };
    if (simple[next] !== undefined) {
      result += simple[next];
      continue;
    }
    if (next === "x") {
      const match = value.slice(index + 1).match(/^[0-9a-fA-F]{1,2}/)?.[0];
      if (match) {
        result += String.fromCharCode(Number.parseInt(match, 16));
        index += match.length;
        continue;
      }
    }
    if (/[0-7]/.test(next)) {
      const match = value.slice(index).match(/^[0-7]{1,3}/)?.[0] ?? next;
      result += String.fromCharCode(Number.parseInt(match, 8));
      index += match.length - 1;
      continue;
    }
    result += next;
  }
  return result;
}

async function readDumpTables() {
  const tables = new Map<string, Row[]>();
  const input = createReadStream(DUMP_PATH).pipe(createGunzip());
  const lines = createInterface({ input, crlfDelay: Infinity });
  let table: string | null = null;
  let columns: string[] = [];
  let keep = false;

  for await (const line of lines) {
    if (!table) {
      const match = line.match(/^COPY public\.([a-z_]+) \((.+)\) FROM stdin;$/);
      if (!match) continue;
      table = match[1];
      columns = match[2].split(", ").map((column) => column.replaceAll('"', ""));
      keep = wantedTables.has(table);
      if (keep && !tables.has(table)) tables.set(table, []);
      continue;
    }
    if (line === "\\.") {
      table = null;
      columns = [];
      keep = false;
      continue;
    }
    if (!keep) continue;
    const values = line.split("\t").map(decodeCopyValue);
    tables.get(table)!.push(Object.fromEntries(columns.map((column, index) => [column, values[index] ?? null])));
  }
  return tables;
}

function required(row: Row, key: string) {
  const value = row[key];
  if (value === null || value === undefined) throw new Error(`Missing ${key} in imported material`);
  return value;
}

function numberValue(value: string | null | undefined, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function anchor(value: string) {
  const normalized = value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return normalized.slice(0, 100) || "unidad";
}

function chunks<T>(items: T[], size = 500) {
  const result: T[][] = [];
  for (let index = 0; index < items.length; index += size) result.push(items.slice(index, index + size));
  return result;
}

async function createManyInChunks<T>(items: T[], create: (data: T[]) => Promise<unknown>, size = 500) {
  for (const batch of chunks(items, size)) await create(batch);
}

function provisionDepth(row: Row, byId: Map<string, Row>, visiting = new Set<string>()): number {
  const id = required(row, "id");
  const parentId = row.parent_id;
  if (!parentId || !byId.has(parentId) || visiting.has(id)) return 0;
  const next = new Set(visiting);
  next.add(id);
  return 1 + provisionDepth(byId.get(parentId)!, byId, next);
}

export async function seedImportedMaterial(prisma: PrismaClient) {
  const tables = await readDumpTables();
  const sourceRows = tables.get("source_references") ?? [];
  const versionRows = tables.get("document_versions") ?? [];
  const documentRows = tables.get("documents") ?? [];
  const unitRows = tables.get("legal_units") ?? [];
  const evidenceRows = tables.get("evidence") ?? [];
  const guideRows = tables.get("study_guides") ?? [];
  const visualRows = tables.get("visual_extractions") ?? [];

  const sources = new Map(sourceRows.map((row) => [required(row, "id"), row]));
  const versions = new Map(versionRows.map((row) => [required(row, "id"), row]));
  const documents = new Map(documentRows.map((row) => [required(row, "id"), row]));
  const units = new Map(unitRows.map((row) => [required(row, "id"), row]));
  const evidenceByUnit = new Map(evidenceRows.map((row) => [required(row, "legal_unit_id"), row]));

  for (const row of documentRows) {
    const id = required(row, "id");
    const currentVersion = row.current_version_id ? versions.get(row.current_version_id) : versionRows.find((item) => item.document_id === id);
    const source = currentVersion?.source_reference_id ? sources.get(currentVersion.source_reference_id) : undefined;
    const data = {
      title: required(row, "title").trim() || "Documento sin título",
      source: source?.storage_key ?? `imported/${id}`,
      authority: "Pendiente de verificación",
      documentType: (row.document_type || row.document_family || "unclassified").toLowerCase(),
      officialUrl: "",
      contentHash: currentVersion?.source_hash ?? source?.source_hash ?? null,
      originalFileKey: source?.storage_key ?? null,
      pipelineStatus: "REVIEW_REQUIRED",
      effectiveFrom: null,
      effectiveUntil: null,
      status: "pending_review",
    };
    await prisma.legalDocument.upsert({ where: { id }, update: data, create: { id, ...data } });
  }

  const importedVersions = versionRows.map((row) => ({
    id: required(row, "id"),
    documentId: required(row, "document_id"),
    label: `Versión importada ${required(row, "version_number")}`,
    effectiveFrom: null,
    effectiveUntil: null,
    status: "pending_review",
    sourceHash: row.source_hash,
    sourceReferenceId: row.source_hash ? `source-${row.source_hash}` : null,
    extractor: row.extractor,
    extractorVersion: row.extractor_version,
    isCurrent: documents.get(required(row, "document_id"))?.current_version_id === row.id,
  }));
  await createManyInChunks(importedVersions, (data) => prisma.legalVersion.createMany({ data, skipDuplicates: true }));

  const provisionRows = unitRows.map((row) => {
    const evidence = evidenceByUnit.get(required(row, "id"));
    const document = documents.get(required(row, "document_id"));
    const label = row.label?.trim() || "";
    const heading = row.heading?.trim() || "";
    const pageStart = evidence?.page_start;
    const pageEnd = evidence?.page_end;
    const page = pageStart ? `, página${pageStart === pageEnd || !pageEnd ? "" : "s"} ${pageStart}${pageEnd && pageEnd !== pageStart ? `-${pageEnd}` : ""}` : "";
    return {
      id: required(row, "id"),
      documentId: required(row, "document_id"),
      versionId: required(row, "version_id"),
      parentProvisionId: row.parent_id && units.has(row.parent_id) ? row.parent_id : null,
      unitType: required(row, "unit_type").toLowerCase(),
      anchor: `${anchor(label || heading || required(row, "unit_type"))}-${required(row, "id").slice(0, 8)}`,
      order: Math.trunc(numberValue(row.unit_order)),
      validationStatus: "pending",
      editorialStatus: "draft",
      number: label || `${required(row, "unit_type")} ${required(row, "unit_order")}`,
      title: heading || label || required(row, "unit_type"),
      content: row.official_text ?? "",
      citation: `${document?.title?.trim() || "Documento importado"}${page}`,
      effectiveFrom: null,
      effectiveUntil: null,
      status: "pending_review",
      sourceReferenceId: evidence?.source_hash ? `source-${evidence.source_hash}` : null,
      pageStart: pageStart ? numberValue(pageStart) : null,
      pageEnd: pageEnd ? numberValue(pageEnd) : null,
      charStart: evidence?.char_start ? numberValue(evidence.char_start) : null,
      charEnd: evidence?.char_end ? numberValue(evidence.char_end) : null,
      extractor: evidence?.extractor ?? null,
      extractorVersion: evidence?.extractor_version ?? null,
    };
  });
  const rawById = new Map(unitRows.map((row) => [required(row, "id"), row]));
  provisionRows.sort((left, right) => provisionDepth(rawById.get(left.id)!, rawById) - provisionDepth(rawById.get(right.id)!, rawById) || left.order - right.order);
  const byDepth = new Map<number, typeof provisionRows>();
  for (const provision of provisionRows) {
    const depth = provisionDepth(rawById.get(provision.id)!, rawById);
    byDepth.set(depth, [...(byDepth.get(depth) ?? []), provision]);
  }
  for (const depth of [...byDepth.keys()].sort((a, b) => a - b)) {
    await createManyInChunks(byDepth.get(depth)!, (data) => prisma.legalProvision.createMany({ data, skipDuplicates: true }), 350);
  }

  const importedEvidences = evidenceRows.map((row) => {
    const unit = units.get(required(row, "legal_unit_id"));
    const document = unit ? documents.get(required(unit, "document_id")) : undefined;
    const pageStart = row.page_start;
    const pageEnd = row.page_end;
    return {
      id: required(row, "id"),
      provisionId: required(row, "legal_unit_id"),
      content: row.content ?? "",
      citation: `${document?.title?.trim() || "Documento importado"}${pageStart ? `, página${pageStart === pageEnd || !pageEnd ? "" : "s"} ${pageStart}${pageEnd && pageEnd !== pageStart ? `-${pageEnd}` : ""}` : ""}`,
      sourceReferenceId: row.source_hash ? `source-${row.source_hash}` : null,
      pageStart: pageStart ? numberValue(pageStart) : null,
      pageEnd: pageEnd ? numberValue(pageEnd) : null,
      charStart: row.char_start ? numberValue(row.char_start) : null,
      charEnd: row.char_end ? numberValue(row.char_end) : null,
      extractor: row.extractor,
      extractorVersion: row.extractor_version,
    };
  });
  await createManyInChunks(importedEvidences, (data) => prisma.evidence.createMany({ data, skipDuplicates: true }), 350);

  const guideProvisions = guideRows.map((row) => ({
    id: `study-guide-${required(row, "id")}`,
    documentId: required(row, "document_id"),
    versionId: required(row, "version_id"),
    parentProvisionId: null,
    unitType: "study_guide",
    anchor: `study-guide-${anchor(required(row, "guide_slug"))}`,
    order: 0,
    validationStatus: "pending",
    editorialStatus: "draft",
    number: "Cartilla de estudio",
    title: required(row, "title"),
    content: required(row, "content_markdown"),
    citation: `${required(row, "source_pdf_name")} — cartilla importada`,
    effectiveFrom: null,
    effectiveUntil: null,
    status: "pending_review",
  }));
  const visualProvisions = visualRows.map((row) => ({
    id: `visual-extraction-${required(row, "id")}`,
    documentId: required(row, "document_id"),
    versionId: required(row, "version_id"),
    parentProvisionId: null,
    unitType: "visual_extraction",
    anchor: `visual-extraction-${required(row, "id").slice(0, 8)}`,
    order: 1,
    validationStatus: "pending",
    editorialStatus: "draft",
    number: "Extracción visual",
    title: `Extracción visual ${required(row, "extraction_id")}`,
    content: JSON.stringify(JSON.parse(required(row, "payload")), null, 2),
    citation: `Extracción visual importada; hash ${required(row, "source_hash")}`,
    effectiveFrom: null,
    effectiveUntil: null,
    status: "pending_review",
  }));
  const supplemental = [...guideProvisions, ...visualProvisions];
  await createManyInChunks(supplemental, (data) => prisma.legalProvision.createMany({ data, skipDuplicates: true }), 100);
  await createManyInChunks(supplemental.map((item) => ({ id: `evidence-${item.id}`, provisionId: item.id, content: item.content, citation: item.citation })), (data) => prisma.evidence.createMany({ data, skipDuplicates: true }), 100);

  await seedCurriculum(prisma, documentRows);
  console.log({ importedDocuments: documentRows.length, importedUnits: provisionRows.length, importedEvidences: importedEvidences.length, studyGuides: guideRows.length, visualExtractions: visualRows.length, sourceHash: SOURCE_HASH });
}

async function seedCurriculum(prisma: PrismaClient, documentRows: Row[]) {
  const manualText = readFileSync(MANUAL_PATH, "utf8");
  const routeText = readFileSync(ROUTE_PATH, "utf8");
  const opec = await prisma.opec.upsert({
    where: { id: "opec-analista-i" },
    update: { name: "Analista I — OPEC 236828", description: "Ruta integral de preparación para la OPEC 236828", level: "Técnico", area: "Cumplimiento de obligaciones tributarias", process: "Cumplimiento de obligaciones tributarias", subprocess: "Administración de cartera, Recaudo-Devoluciones", sourceHash: "96a579edd0af108a9db1b33833945f8e07c2cd13d55f108cc141751c048afd9b", sourceFileKey: "get-document.pdf", sourceVersion: "Ficha 01 — 15/04/2024" },
    create: { id: "opec-analista-i", name: "Analista I — OPEC 236828", description: "Ruta integral de preparación para la OPEC 236828", level: "Técnico", area: "Cumplimiento de obligaciones tributarias", process: "Cumplimiento de obligaciones tributarias", subprocess: "Administración de cartera, Recaudo-Devoluciones", sourceHash: "96a579edd0af108a9db1b33833945f8e07c2cd13d55f108cc141751c048afd9b", sourceFileKey: "get-document.pdf", sourceVersion: "Ficha 01 — 15/04/2024" },
  });
  await seedOpecFunctions(prisma);
  const competency = await prisma.competency.upsert({
    where: { id: "competency-cobro-coactivo" },
    update: { opecId: opec.id, name: "Ruta integral OPEC 236828", description: "Competencias básicas, funcionales, comportamentales y de integridad organizadas en seis bloques" },
    create: { id: "competency-cobro-coactivo", opecId: opec.id, name: "Ruta integral OPEC 236828", description: "Competencias básicas, funcionales, comportamentales y de integridad organizadas en seis bloques" },
  });

  await prisma.block.updateMany({ where: { competencyId: competency.id }, data: { status: "inactive" } });
  await prisma.block.updateMany({ where: { id: "block-competency-cobro-coactivo" }, data: { order: 99 } });
  await prisma.topic.updateMany({ where: { block: { competencyId: competency.id } }, data: { status: "inactive" } });

  await prisma.legalDocument.upsert({
    where: { id: "material-manual-opec-236828" },
    update: { contentHash: "49ac8b402f7b1741d79ca38790b9889329cbd61936357cf750781b02c2e6181b", pipelineStatus: "REVIEW_REQUIRED" },
    create: { id: "material-manual-opec-236828", title: "Manual de estudio — OPEC 236828", source: "docs/product/sources/opec-236828-manual-estudio.pdf", authority: "Material aportado por el usuario", documentType: "study_manual", contentHash: "49ac8b402f7b1741d79ca38790b9889329cbd61936357cf750781b02c2e6181b", originalFileKey: "docs/product/sources/opec-236828-manual-estudio.pdf", pipelineStatus: "REVIEW_REQUIRED", effectiveFrom: null, status: "pending_review" },
  });
  await prisma.legalVersion.upsert({
    where: { id: "material-manual-opec-236828-v1" }, update: { sourceHash: "49ac8b402f7b1741d79ca38790b9889329cbd61936357cf750781b02c2e6181b" },
    create: { id: "material-manual-opec-236828-v1", documentId: "material-manual-opec-236828", label: "Documento aportado 2026-09-14", effectiveFrom: null, status: "pending_review", sourceHash: "49ac8b402f7b1741d79ca38790b9889329cbd61936357cf750781b02c2e6181b", isCurrent: true },
  });
  await prisma.legalDocument.upsert({
    where: { id: "material-route-opec-236828" },
    update: { contentHash: "33099ed3832ca3febb9bd134d64c35d18417abc363534abde4b4819b11a40c2b", pipelineStatus: "REVIEW_REQUIRED" },
    create: { id: "material-route-opec-236828", title: "Ruta de aprendizaje — OPEC 236828", source: "docs/product/sources/opec-236828-ruta-aprendizaje.pdf", authority: "Material aportado por el usuario", documentType: "learning_route", contentHash: "33099ed3832ca3febb9bd134d64c35d18417abc363534abde4b4819b11a40c2b", originalFileKey: "docs/product/sources/opec-236828-ruta-aprendizaje.pdf", pipelineStatus: "REVIEW_REQUIRED", effectiveFrom: null, status: "pending_review" },
  });
  await prisma.legalVersion.upsert({
    where: { id: "material-route-opec-236828-v1" }, update: { sourceHash: "33099ed3832ca3febb9bd134d64c35d18417abc363534abde4b4819b11a40c2b" },
    create: { id: "material-route-opec-236828-v1", documentId: "material-route-opec-236828", label: "Documento aportado 2026-09-14", effectiveFrom: null, status: "pending_review", sourceHash: "33099ed3832ca3febb9bd134d64c35d18417abc363534abde4b4819b11a40c2b", isCurrent: true },
  });

  const fullMaterials = [
    { id: "material-manual-opec-236828-full", documentId: "material-manual-opec-236828", versionId: "material-manual-opec-236828-v1", unitType: "study_manual", number: "Manual completo", title: "Listado de temas, recomendaciones y fuentes", content: manualText, citation: "DIAN - Técnico - Analista I - 236828.pdf" },
    { id: "material-route-opec-236828-full", documentId: "material-route-opec-236828", versionId: "material-route-opec-236828-v1", unitType: "learning_route", number: "Ruta completa", title: "Seis bloques y veinticinco temas", content: `${routeMarkdown}\n\n${routeText}`, citation: "Ruta - Hoja 1.pdf" },
  ];
  for (const [index, item] of fullMaterials.entries()) {
    await prisma.legalProvision.upsert({ where: { id: item.id }, update: { content: item.content }, create: { ...item, parentProvisionId: null, anchor: anchor(item.id), order: index, validationStatus: "pending", editorialStatus: "draft", effectiveFrom: null, status: "pending_review" } });
    await prisma.evidence.upsert({ where: { id: `evidence-${item.id}` }, update: { content: item.content }, create: { id: `evidence-${item.id}`, provisionId: item.id, content: item.content, citation: item.citation } });
  }

  for (const blockSeed of curriculum236828) {
    const blockId = `block-route-${String(blockSeed.order).padStart(2, "0")}`;
    await prisma.block.upsert({ where: { id: blockId }, update: { competencyId: competency.id, name: blockSeed.name, description: blockSeed.description, order: blockSeed.order, status: "active" }, create: { id: blockId, competencyId: competency.id, name: blockSeed.name, description: blockSeed.description, order: blockSeed.order, progressionThreshold: 0.7, status: "active" } });
    for (const topicSeed of blockSeed.topics) {
      const suffix = String(topicSeed.order).padStart(2, "0");
      const topicId = `topic-route-${suffix}`;
      const objectiveId = `objective-route-${suffix}`;
      const conceptId = `concept-route-${suffix}`;
      const manualProvisionId = `material-manual-topic-${suffix}`;
      const manualEvidenceId = `evidence-${manualProvisionId}`;
      await prisma.topic.upsert({ where: { id: topicId }, update: { blockId, name: topicSeed.name, description: topicSeed.description, order: topicSeed.order, status: "active" }, create: { id: topicId, blockId, name: topicSeed.name, description: topicSeed.description, order: topicSeed.order, status: "active" } });
      await prisma.learningObjective.upsert({ where: { id: objectiveId }, update: { topicId, name: topicSeed.objective, description: topicSeed.description, order: 1, critical: topicSeed.critical ?? false, status: "active" }, create: { id: objectiveId, topicId, name: topicSeed.objective, description: topicSeed.description, order: 1, critical: topicSeed.critical ?? false, status: "active" } });
      await prisma.concept.upsert({ where: { id: conceptId }, update: { objectiveId, name: topicSeed.name, description: topicSeed.description }, create: { id: conceptId, objectiveId, name: topicSeed.name, description: topicSeed.description } });
      await prisma.conceptEvidence.deleteMany({ where: { conceptId } });
      const sourceTitles = documentRows.filter((document) => topicSeed.sourcePatterns.some((pattern) => pattern.test(required(document, "title")))).map((document) => required(document, "title").trim());
      const manualContent = `${topicSeed.description}\n\nObjetivo: ${topicSeed.objective}.\n\nFuentes disponibles en la base importada:\n${sourceTitles.length ? sourceTitles.map((title) => `- ${title}`).join("\n") : "- El manual aporta referencias; la fuente primaria aún debe incorporarse y verificarse."}`;
      await prisma.legalProvision.upsert({ where: { id: manualProvisionId }, update: { content: manualContent }, create: { id: manualProvisionId, documentId: "material-manual-opec-236828", versionId: "material-manual-opec-236828-v1", parentProvisionId: "material-manual-opec-236828-full", unitType: "study_topic", anchor: `tema-${suffix}-${anchor(topicSeed.name)}`, order: topicSeed.order, validationStatus: "pending", editorialStatus: "draft", number: `Tema ${topicSeed.order}`, title: topicSeed.name, content: manualContent, citation: `Manual de estudio OPEC 236828, tema ${topicSeed.order}`, effectiveFrom: null, status: "pending_review" } });
      await prisma.evidence.upsert({ where: { id: manualEvidenceId }, update: { content: manualContent }, create: { id: manualEvidenceId, provisionId: manualProvisionId, content: manualContent, citation: `Manual de estudio OPEC 236828, tema ${topicSeed.order}` } });
      await prisma.conceptEvidence.create({ data: { conceptId, evidenceId: manualEvidenceId } });
    }
  }

  await prisma.learningObjective.updateMany({ where: { id: { in: ["objective-alcance-art-823", "objective-mandamiento-pago", "objective-titulos-ejecutivos"] } }, data: { topicId: "topic-route-13" } });
  await prisma.learningObjective.updateMany({ where: { id: "objective-medidas-preventivas" }, data: { topicId: "topic-route-14" } });
  await prisma.topicProgress.upsert({ where: { studentId_topicId: { studentId: "student-demo", topicId: "topic-route-01" } }, update: { state: "AVAILABLE", unlockedAt: new Date() }, create: { studentId: "student-demo", topicId: "topic-route-01", state: "AVAILABLE", unlockedAt: new Date() } });
}
