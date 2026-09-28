import type { PrismaClient } from "@prisma/client";
import { createReadStream, readFileSync } from "node:fs";
import { createInterface } from "node:readline";
import { fileURLToPath } from "node:url";
import { createGunzip } from "node:zlib";
import { curriculum236828, routeMarkdown } from "./curriculum-236828.js";
import { curatedTopics12To24 } from "./curated-topic-content.js";

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

function extractionIssues(content: string) {
  const issues: Array<{ code: string; label: string }> = [];
  if (!content.trim()) issues.push({ code: "EMPTY_CONTENT", label: "La extracción no contiene texto." });
  if (content.includes("�")) issues.push({ code: "REPLACEMENT_CHARACTER", label: "La extracción contiene caracteres de reemplazo." });
  if (/\w-\n\w/.test(content)) issues.push({ code: "SPLIT_WORD", label: "La extracción puede contener palabras partidas por salto de línea." });
  return issues;
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

function provisionPath(row: Row, byId: Map<string, Row>, visiting = new Set<string>()): string {
  const id = required(row, "id");
  const segment = `${String(Math.trunc(numberValue(row.unit_order))).padStart(10, "0")}-${id}`;
  const parentId = row.parent_id;
  if (!parentId || !byId.has(parentId) || visiting.has(id)) return segment;
  const next = new Set(visiting);
  next.add(id);
  return `${provisionPath(byId.get(parentId)!, byId, next)}/${segment}`;
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
      originalFileName: source?.original_name ?? null,
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
      documentPath: provisionPath(row, units),
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
      extractionIssues: extractionIssues(row.official_text ?? ""),
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
  const issueGroups = new Map<string, string[]>();
  for (const provision of provisionRows) {
    const key = JSON.stringify(provision.extractionIssues);
    issueGroups.set(key, [...(issueGroups.get(key) ?? []), provision.id]);
  }
  for (const [serialized, ids] of issueGroups) {
    for (const batch of chunks(ids, 500)) {
      await prisma.legalProvision.updateMany({ where: { id: { in: batch } }, data: { extractionIssues: JSON.parse(serialized) } });
    }
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
    update: { name: "Analista I — OPEC 236828", description: "Ruta integral de preparación para la OPEC 236828", level: "Técnico", area: "Cumplimiento de obligaciones tributarias", process: "Cumplimiento de obligaciones tributarias", subprocess: "Administración de cartera, Recaudo-Devoluciones" },
    create: { id: "opec-analista-i", name: "Analista I — OPEC 236828", description: "Ruta integral de preparación para la OPEC 236828", level: "Técnico", area: "Cumplimiento de obligaciones tributarias", process: "Cumplimiento de obligaciones tributarias", subprocess: "Administración de cartera, Recaudo-Devoluciones" },
  });
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
    update: { contentHash: "49ac8b402f7b1741d79ca38790b9889329cbd61936357cf750781b02c2e6181b", originalFileName: "DIAN - Técnico - Analista I - 236828.pdf", pipelineStatus: "REVIEW_REQUIRED" },
    create: { id: "material-manual-opec-236828", title: "Manual de estudio — OPEC 236828", source: "docs/product/sources/opec-236828-manual-estudio.pdf", authority: "Material aportado por el usuario", documentType: "study_manual", contentHash: "49ac8b402f7b1741d79ca38790b9889329cbd61936357cf750781b02c2e6181b", originalFileKey: "docs/product/sources/opec-236828-manual-estudio.pdf", originalFileName: "DIAN - Técnico - Analista I - 236828.pdf", pipelineStatus: "REVIEW_REQUIRED", effectiveFrom: null, status: "pending_review" },
  });
  await prisma.legalVersion.upsert({
    where: { id: "material-manual-opec-236828-v1" }, update: { sourceHash: "49ac8b402f7b1741d79ca38790b9889329cbd61936357cf750781b02c2e6181b" },
    create: { id: "material-manual-opec-236828-v1", documentId: "material-manual-opec-236828", label: "Documento aportado 2026-09-14", effectiveFrom: null, status: "pending_review", sourceHash: "49ac8b402f7b1741d79ca38790b9889329cbd61936357cf750781b02c2e6181b", isCurrent: true },
  });
  await prisma.legalDocument.upsert({
    where: { id: "material-route-opec-236828" },
    update: { contentHash: "33099ed3832ca3febb9bd134d64c35d18417abc363534abde4b4819b11a40c2b", originalFileName: "Ruta - Hoja 1.pdf", pipelineStatus: "REVIEW_REQUIRED" },
    create: { id: "material-route-opec-236828", title: "Ruta de aprendizaje — OPEC 236828", source: "docs/product/sources/opec-236828-ruta-aprendizaje.pdf", authority: "Material aportado por el usuario", documentType: "learning_route", contentHash: "33099ed3832ca3febb9bd134d64c35d18417abc363534abde4b4819b11a40c2b", originalFileKey: "docs/product/sources/opec-236828-ruta-aprendizaje.pdf", originalFileName: "Ruta - Hoja 1.pdf", pipelineStatus: "REVIEW_REQUIRED", effectiveFrom: null, status: "pending_review" },
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

  // Curated practice set for topic 11, grounded in the ET provisions already imported.
  const statute = await prisma.legalDocument.findFirstOrThrow({ where: { title: { contains: "Decreto-Ley-624" } } });
  const statuteProvisions = new Map(
    (await prisma.legalProvision.findMany({
      where: { documentId: statute.id, number: { in: ["ARTÍCULO 800", "ARTÍCULO 803", "ARTÍCULO 804"] } },
    })).map((provision) => [provision.number, provision]),
  );
  const topic11Questions = [
    {
      id: "question-route-11-800-1", provisionNumber: "ARTÍCULO 800", difficulty: 0.35, errorType: "CONCEPT_CONFUSION",
      stem: "Según el artículo 800 del Estatuto Tributario, ¿dónde deben efectuarse los pagos de impuestos, anticipos y retenciones?",
      options: [
        { key: "A", text: "En los lugares que señale el Gobierno Nacional" },
        { key: "B", text: "Únicamente en la oficina de cada contribuyente" },
        { key: "C", text: "Solo ante un juez administrativo" },
        { key: "D", text: "En cualquier establecimiento comercial no autorizado" },
      ], correctAnswer: "A",
      explanation: "El artículo 800 dispone que el pago debe efectuarse en los lugares que señale el Gobierno Nacional.",
    },
    {
      id: "question-route-11-800-2", provisionNumber: "ARTÍCULO 800", difficulty: 0.45, errorType: "SOURCE_AWARENESS",
      stem: "¿A través de qué entidades puede el Gobierno Nacional recaudar total o parcialmente los tributos administrados por la DIAN, según el artículo 800?",
      options: [
        { key: "A", text: "A través de bancos y demás entidades financieras" },
        { key: "B", text: "Exclusivamente mediante empresas de mensajería" },
        { key: "C", text: "Solo mediante notarías" },
        { key: "D", text: "Únicamente mediante pagos en especie" },
      ], correctAnswer: "A",
      explanation: "El artículo 800 autoriza el recaudo total o parcial a través de bancos y demás entidades financieras.",
    },
    {
      id: "question-route-11-803-1", provisionNumber: "ARTÍCULO 803", difficulty: 0.4, errorType: "PROCEDURE_ORDER_ERROR",
      stem: "¿Qué fecha se tiene como fecha de pago del impuesto para cada contribuyente, de acuerdo con el artículo 803?",
      options: [
        { key: "A", text: "La fecha en que los valores imputables ingresan a las oficinas de impuestos o a los bancos autorizados" },
        { key: "B", text: "La fecha en que se imprime la declaración" },
        { key: "C", text: "La fecha en que se inicia una fiscalización" },
        { key: "D", text: "La fecha en que se solicita un certificado bancario" },
      ], correctAnswer: "A",
      explanation: "El artículo 803 fija como fecha de pago aquella en que los valores imputables ingresan a las oficinas de impuestos o a los bancos autorizados.",
    },
    {
      id: "question-route-11-803-2", provisionNumber: "ARTÍCULO 803", difficulty: 0.55, errorType: "CONCEPT_CONFUSION",
      stem: "¿Cuál de los siguientes valores puede ser tenido en cuenta para establecer la fecha de pago conforme al artículo 803?",
      options: [
        { key: "A", text: "Un valor recibido inicialmente como simple depósito o buena cuenta" },
        { key: "B", text: "Una promesa verbal de pago no registrada" },
        { key: "C", text: "Una obligación privada sin relación tributaria" },
        { key: "D", text: "Una factura aún no presentada a la Administración" },
      ], correctAnswer: "A",
      explanation: "El artículo 803 incluye valores recibidos inicialmente como simples depósitos, buenas cuentas, retenciones o saldos a favor.",
    },
    {
      id: "question-route-11-804-1", provisionNumber: "ARTÍCULO 804", difficulty: 0.6, errorType: "PROCEDURE_ORDER_ERROR",
      stem: "En una deuda vencida, ¿cómo deben imputarse los pagos según el inciso primero del artículo 804?",
      options: [
        { key: "A", text: "Al período e impuesto indicados, en proporción a los componentes de la obligación total" },
        { key: "B", text: "Siempre primero a intereses, sin considerar la obligación total" },
        { key: "C", text: "Únicamente al impuesto más antiguo de cualquier período" },
        { key: "D", text: "Al concepto que el banco elija libremente" },
      ], correctAnswer: "A",
      explanation: "El artículo 804 ordena imputar el pago al período e impuesto indicado, en las mismas proporciones de sanciones actualizadas, intereses, anticipos, impuestos y retenciones dentro de la obligación total.",
    },
    {
      id: "question-route-11-804-2", provisionNumber: "ARTÍCULO 804", difficulty: 0.7, errorType: "MISSED_EXCEPTION",
      stem: "Si el contribuyente imputa el pago de una forma diferente a la prevista en el artículo 804, ¿qué procede?",
      options: [
        { key: "A", text: "La Administración lo reimputa en el orden señalado sin acto administrativo previo" },
        { key: "B", text: "El pago se anula automáticamente" },
        { key: "C", text: "El banco decide de forma definitiva la imputación" },
        { key: "D", text: "Debe iniciarse un proceso judicial antes de corregirlo" },
      ], correctAnswer: "A",
      explanation: "El artículo 804 permite a la Administración reimputar el pago en el orden legal sin que se requiera acto administrativo previo.",
    },
  ];
  for (const item of topic11Questions) {
    const provision = statuteProvisions.get(item.provisionNumber);
    if (!provision) throw new Error(`Missing statute provision for topic 11: ${item.provisionNumber}`);
    const evidence = await prisma.evidence.upsert({
      where: { id: `evidence-topic-11-${item.provisionNumber.replaceAll(" ", "-").toLowerCase()}` },
      update: { provisionId: provision.id, content: provision.content, citation: provision.citation },
      create: { id: `evidence-topic-11-${item.provisionNumber.replaceAll(" ", "-").toLowerCase()}`, provisionId: provision.id, content: provision.content, citation: provision.citation },
    });
    await prisma.conceptEvidence.upsert({ where: { conceptId_evidenceId: { conceptId: "concept-route-11", evidenceId: evidence.id } }, update: {}, create: { conceptId: "concept-route-11", evidenceId: evidence.id } });
    const question = await prisma.question.upsert({
      where: { id: item.id },
      update: { objectiveId: "objective-route-11", difficulty: item.difficulty, stem: item.stem, options: item.options, correctAnswer: item.correctAnswer, explanation: item.explanation, errorType: item.errorType, editorialStatus: "published", reviewedBy: "student-demo", reviewedAt: new Date() },
      create: { id: item.id, objectiveId: "objective-route-11", type: "multiple_choice", difficulty: item.difficulty, stem: item.stem, options: item.options, correctAnswer: item.correctAnswer, explanation: item.explanation, errorType: item.errorType, editorialStatus: "published", reviewedBy: "student-demo", reviewedAt: new Date() },
    });
    await prisma.questionEvidence.upsert({ where: { questionId_evidenceId: { questionId: question.id, evidenceId: evidence.id } }, update: {}, create: { questionId: question.id, evidenceId: evidence.id } });
  }

  const topic11Cases = [
    {
      id: "case-route-11-worked-example", difficulty: 0.45,
      scenario: "Una obligación tributaria vencida aparece en la cuenta corriente de un contribuyente. El 14 de marzo, el contribuyente entrega el dinero en un banco autorizado y solicita que el pago se registre contra el período e impuesto que identifica en el comprobante. El valor fue recibido inicialmente como una buena cuenta y la obligación incluye impuesto, intereses y sanciones actualizadas.",
      expectedAnalysis: "El análisis empieza por el artículo 800: el pago puede recaudarse a través de bancos y demás entidades financieras autorizadas. Luego, conforme al artículo 803, la fecha de pago es el 14 de marzo, cuando los valores imputables ingresaron al banco autorizado, aunque inicialmente se hayan recibido como buena cuenta. Finalmente, el artículo 804 exige imputar el pago al período e impuesto indicado, en las proporciones en que participan el impuesto, los intereses y las sanciones actualizadas dentro de la obligación total. La cuenta corriente debe reflejar ese movimiento con su fecha y distribución normativa.",
      provisionNumbers: ["ARTÍCULO 800", "ARTÍCULO 803", "ARTÍCULO 804"],
    },
    {
      id: "case-route-11-situational", difficulty: 0.7,
      scenario: "Al revisar la cuenta corriente, una funcionaria observa que un pago de una deuda vencida fue registrado por el contribuyente únicamente contra los intereses, aunque el comprobante identifica el período y el impuesto. El contribuyente sostiene que la Administración no puede modificar la distribución porque el banco ya aplicó el dinero. ¿Qué debe decidir la funcionaria y cómo debe quedar reflejado el movimiento?",
      expectedAnalysis: "Debe conservarse la fecha en que el pago ingresó al banco autorizado, de acuerdo con el artículo 803. La imputación debe corresponder al período e impuesto indicado y distribuirse en las proporciones previstas por el artículo 804 entre sanciones actualizadas, intereses, anticipos, impuestos y retenciones que integren la obligación total. Como la imputación realizada fue diferente, la Administración puede reimputar el pago en el orden legal sin acto administrativo previo. El registro de la cuenta corriente debe conservar la trazabilidad del pago, su fecha y la reimputación aplicada.",
      provisionNumbers: ["ARTÍCULO 803", "ARTÍCULO 804"],
    },
  ];
  for (const item of topic11Cases) {
    const studyCase = await prisma.case.upsert({
      where: { id: item.id },
      update: { objectiveId: "objective-route-11", difficulty: item.difficulty, scenario: item.scenario, expectedAnalysis: item.expectedAnalysis },
      create: { id: item.id, objectiveId: "objective-route-11", difficulty: item.difficulty, scenario: item.scenario, expectedAnalysis: item.expectedAnalysis },
    });
    for (const provisionNumber of item.provisionNumbers) {
      const evidence = await prisma.evidence.findUnique({ where: { id: `evidence-topic-11-${provisionNumber.replaceAll(" ", "-").toLowerCase()}` } });
      if (!evidence) throw new Error(`Missing evidence for topic 11 case: ${provisionNumber}`);
      await prisma.caseEvidence.upsert({ where: { caseId_evidenceId: { caseId: studyCase.id, evidenceId: evidence.id } }, update: {}, create: { caseId: studyCase.id, evidenceId: evidence.id } });
    }
  }

  await seedCuratedTopics12To24(prisma);

  await prisma.learningObjective.updateMany({ where: { id: { in: ["objective-alcance-art-823", "objective-mandamiento-pago", "objective-titulos-ejecutivos"] } }, data: { topicId: "topic-route-13" } });
  await prisma.learningObjective.updateMany({ where: { id: "objective-medidas-preventivas" }, data: { topicId: "topic-route-14" } });
  await prisma.topicProgress.upsert({ where: { studentId_topicId: { studentId: "student-demo", topicId: "topic-route-01" } }, update: { state: "AVAILABLE", unlockedAt: new Date() }, create: { studentId: "student-demo", topicId: "topic-route-01", state: "AVAILABLE", unlockedAt: new Date() } });
}

async function seedCuratedTopics12To24(prisma: PrismaClient) {
  const documents = await prisma.legalDocument.findMany({ select: { id: true, title: true } });
  for (const topic of curatedTopics12To24) {
    const suffix = String(topic.order).padStart(2, "0");
    const objectiveId = `objective-route-${suffix}`;
    const conceptId = `concept-route-${suffix}`;
    const manualEvidenceId = `evidence-material-manual-topic-${suffix}`;
    const selectedDocumentIds = documents
      .filter((document) => topic.sourceDocuments.some((pattern) => pattern.test(document.title)))
      .map((document) => document.id);
    const sourceProvisions = selectedDocumentIds.length
      ? await prisma.legalProvision.findMany({ where: { documentId: { in: selectedDocumentIds } }, orderBy: [{ order: "asc" }, { createdAt: "asc" }] })
      : [];
    const usableProvisions = sourceProvisions.filter((provision) => {
      const label = `${provision.number} ${provision.title} ${provision.content}`;
      const compactContent = provision.content.trim().replace(/\s+/g, " ");
      const looksLikeContentsEntry = /^\d+(?:\.\d+){1,3}\.?\s+\D.+\s+\d{1,3}$/.test(compactContent)
        || /\b(?:conclusiones|glosario)\s+\d{1,3}\b/i.test(compactContent);
      return provision.unitType !== "visual_extraction"
        && !/bibliograf[ií]a|tabla de contenido|manual completo|tema 25|harvard business review|unesco|sanguinetti/i.test(label)
        && !/\.{4,}\s*\d+/.test(provision.content)
        && !looksLikeContentsEntry;
    });
    const selectedProvisions = [
      ...usableProvisions.filter((provision) => topic.preferredNumbers?.some((pattern) => pattern.test(provision.number))),
      ...usableProvisions.filter((provision) => topic.preferredTitles?.some((pattern) => pattern.test(provision.title))),
      ...usableProvisions.filter((provision) => topic.sourceText.some((pattern) => pattern.test(`${provision.number} ${provision.title} ${provision.content}`))),
    ].filter((provision, index, items) => items.findIndex((candidate) => candidate.id === provision.id) === index).slice(0, topic.maxSources ?? 2);
    const sourceEvidenceIds: string[] = [];
    for (const [index, provision] of selectedProvisions.entries()) {
      const evidence = await prisma.evidence.upsert({
        where: { id: `evidence-topic-${suffix}-${index + 1}` },
        update: { provisionId: provision.id, content: provision.content, citation: provision.citation },
        create: { id: `evidence-topic-${suffix}-${index + 1}`, provisionId: provision.id, content: provision.content, citation: provision.citation },
      });
      sourceEvidenceIds.push(evidence.id);
    }
    if (!sourceEvidenceIds.length && topic.order === 19) {
      const visualProvision = sourceProvisions.find((provision) => provision.unitType === "visual_extraction");
      if (visualProvision) {
        const visualPayload = JSON.parse(visualProvision.content) as { sections?: Array<{ headingVerbatim?: string | null }> };
        const headings = (visualPayload.sections ?? []).map((section) => section.headingVerbatim?.trim()).filter((heading): heading is string => Boolean(heading));
        const evidence = await prisma.evidence.upsert({
          where: { id: "evidence-topic-19-1" },
          update: { provisionId: visualProvision.id, content: `Secciones identificadas en la extracción: ${headings.join(", ")}. La extracción requiere validación editorial antes de considerarse fuente jurídica validada.`, citation: "Código Ética DIAN v3 (Prueba de Integridad), extracción visual" },
          create: { id: "evidence-topic-19-1", provisionId: visualProvision.id, content: `Secciones identificadas en la extracción: ${headings.join(", ")}. La extracción requiere validación editorial antes de considerarse fuente jurídica validada.`, citation: "Código Ética DIAN v3 (Prueba de Integridad), extracción visual" },
        });
        sourceEvidenceIds.push(evidence.id);
      }
    }
    if (!sourceEvidenceIds.length) {
      const fallback = await prisma.evidence.findUnique({ where: { id: manualEvidenceId } });
      if (!fallback) throw new Error(`Missing manual evidence for topic ${topic.order}`);
      sourceEvidenceIds.push(fallback.id);
    }

    await prisma.concept.update({ where: { id: conceptId }, data: { description: topic.studyText } });
    await prisma.conceptEvidence.deleteMany({ where: { conceptId } });
    await prisma.conceptEvidence.createMany({ data: sourceEvidenceIds.map((evidenceId) => ({ conceptId, evidenceId })), skipDuplicates: true });

    const questionIds: string[] = [];
    for (const [index, item] of topic.questions.entries()) {
      const id = `question-route-${suffix}-curated-${index + 1}`;
      questionIds.push(id);
      const question = await prisma.question.upsert({
        where: { id },
        update: { objectiveId, difficulty: 0.4 + index * 0.2, stem: item.stem, options: item.options, correctAnswer: item.correctAnswer, explanation: item.explanation, errorType: item.errorType, editorialStatus: "published", reviewedBy: "student-demo", reviewedAt: new Date() },
        create: { id, objectiveId, type: "multiple_choice", difficulty: 0.4 + index * 0.2, stem: item.stem, options: item.options, correctAnswer: item.correctAnswer, explanation: item.explanation, errorType: item.errorType, editorialStatus: "published", reviewedBy: "student-demo", reviewedAt: new Date() },
      });
      await prisma.questionEvidence.deleteMany({ where: { questionId: question.id } });
      await prisma.questionEvidence.create({ data: { questionId: question.id, evidenceId: sourceEvidenceIds[index % sourceEvidenceIds.length] } });
    }

    const cases = [
      { id: `case-route-${suffix}-worked-example`, difficulty: 0.45, scenario: topic.workedExample.scenario, expectedAnalysis: topic.workedExample.analysis },
      { id: `case-route-${suffix}-situational`, difficulty: 0.7, scenario: topic.applicationCase.scenario, expectedAnalysis: topic.applicationCase.analysis },
    ];
    for (const studyCase of cases) {
      const savedCase = await prisma.case.upsert({ where: { id: studyCase.id }, update: { objectiveId, difficulty: studyCase.difficulty, scenario: studyCase.scenario, expectedAnalysis: studyCase.expectedAnalysis }, create: { ...studyCase, objectiveId } });
      await prisma.caseEvidence.deleteMany({ where: { caseId: savedCase.id } });
      await prisma.caseEvidence.createMany({ data: sourceEvidenceIds.map((evidenceId) => ({ caseId: savedCase.id, evidenceId })), skipDuplicates: true });
    }

    if (questionIds.length !== topic.questions.length) throw new Error(`Incomplete question set for topic ${topic.order}`);
  }
}
