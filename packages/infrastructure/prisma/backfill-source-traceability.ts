import { createReadStream } from "node:fs";
import { createInterface } from "node:readline";
import { createGunzip } from "node:zlib";
import { join, resolve } from "node:path";
import { PrismaClient } from "@prisma/client";

type Row = Record<string, string | null>;
const repo = resolve(process.cwd(), "../..");
const dumpPath = join(repo, "packages/infrastructure/prisma/material/legal_pipeline_combinada_2026-09-14.sql.gz");

function decode(value: string): string | null {
  if (value === "\\N") return null;
  return value.replace(/\\([btnr\\])/g, (_, code: string) => ({ b: "\b", t: "\t", n: "\n", r: "\r", "\\": "\\" }[code] ?? code));
}

async function readTables() {
  const wanted = new Set(["source_references", "document_versions", "evidence"]);
  const tables = new Map<string, Row[]>();
  const input = createInterface({ input: createReadStream(dumpPath).pipe(createGunzip()), crlfDelay: Infinity });
  let table: string | null = null;
  let columns: string[] = [];
  for await (const line of input) {
    if (!table) {
      const match = line.match(/^COPY public\.([a-z_]+) \((.+)\) FROM stdin;$/);
      if (!match) continue;
      table = match[1];
      columns = match[2].split(", ").map((column) => column.replaceAll('"', ""));
      if (wanted.has(table)) tables.set(table, []);
      continue;
    }
    if (line === "\\.") { table = null; columns = []; continue; }
    if (!wanted.has(table)) continue;
    const values = line.split("\t").map(decode);
    tables.get(table)!.push(Object.fromEntries(columns.map((column, index) => [column, values[index] ?? null])));
  }
  return tables;
}

function integer(value: string | null) { return value === null ? null : Number(value); }

async function main() {
  const tables = await readTables();
  const versions = tables.get("document_versions") ?? [];
  const evidences = tables.get("evidence") ?? [];
  const sources = tables.get("source_references") ?? [];
  const prisma = new PrismaClient();
  try {
    await prisma.$transaction(async (tx) => {
      for (const row of sources) {
        if (!row.source_hash || !row.storage_key || !row.original_name || !row.byte_size) continue;
        await tx.sourceReference.upsert({
          where: { sourceHash: row.source_hash },
          update: {},
          create: { id: `source-${row.source_hash}`, sourceHash: row.source_hash, storageKey: row.storage_key, originalName: row.original_name, byteSize: BigInt(row.byte_size) },
        });
      }
      for (let index = 0; index < versions.length; index += 100) {
        await Promise.all(versions.slice(index, index + 100).map((row) => tx.legalVersion.updateMany({
          where: { id: row.id ?? "" },
          data: { sourceReferenceId: row.source_hash ? `source-${row.source_hash}` : null, extractor: row.extractor, extractorVersion: row.extractor_version },
        })));
      }
      for (let index = 0; index < evidences.length; index += 100) {
        await Promise.all(evidences.slice(index, index + 100).map((row) => {
          const data = {
            sourceReferenceId: row.source_hash ? `source-${row.source_hash}` : null,
            pageStart: integer(row.page_start), pageEnd: integer(row.page_end),
            charStart: integer(row.char_start), charEnd: integer(row.char_end),
            extractor: row.extractor, extractorVersion: row.extractor_version,
          };
          return Promise.all([
            tx.evidence.updateMany({ where: { id: row.id ?? "" }, data }),
            tx.legalProvision.updateMany({ where: { id: row.legal_unit_id ?? "" }, data }),
          ]);
        }));
      }
    }, { timeout: 300000 });
    console.log({ versionsBackfilled: versions.length, evidencesBackfilled: evidences.length, provisionsBackfilled: evidences.length });
  } finally { await prisma.$disconnect(); }
}

await main();
