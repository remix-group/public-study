import { createHash } from "node:crypto";
import { readdir, readFile, stat } from "node:fs/promises";
import { basename, join, relative, resolve } from "node:path";
import { PrismaClient } from "@prisma/client";

const repo = resolve(process.cwd(), "../..");
const roots = [
  join(repo, "docs/product/sources"),
  join(repo, "apps/api/data/legal-sources"),
  join(repo, "data/legal-sources/incoming"),
  join(repo, "packages/infrastructure/prisma/material"),
  join(repo, "get-document.pdf"),
  join(repo, "DIAN - Técnico - Analista I - 236828.pdf"),
].filter((path) => path.endsWith(".pdf") || path);

async function pdfFiles(path: string): Promise<string[]> {
  const metadata = await stat(path).catch(() => null);
  if (!metadata) return [];
  if (metadata.isFile()) return path.toLowerCase().endsWith(".pdf") ? [path] : [];
  const entries = await readdir(path, { withFileTypes: true });
  return (await Promise.all(entries.map((entry) => pdfFiles(join(path, entry.name))))).flat();
}

async function main() {
  const files = (await Promise.all(roots.map(pdfFiles))).flat().sort();
  const unique = new Map<string, { hash: string; path: string; size: number }>();
  for (const path of files) {
    const bytes = await readFile(path);
    const hash = createHash("sha256").update(bytes).digest("hex");
    const size = bytes.byteLength;
    if (!unique.has(hash)) unique.set(hash, { hash, path, size });
  }
  const prisma = new PrismaClient();
  try {
    await prisma.$transaction(async (tx) => {
      for (const source of unique.values()) {
        const storageKey = relative(repo, source.path);
        const reference = await tx.sourceReference.upsert({
          where: { sourceHash: source.hash },
          update: { storageKey, originalName: basename(source.path), byteSize: BigInt(source.size) },
          create: { id: `source-${source.hash}`, sourceHash: source.hash, storageKey, originalName: basename(source.path), byteSize: BigInt(source.size) },
        });
        await tx.legalVersion.updateMany({ where: { sourceHash: source.hash }, data: { sourceReferenceId: reference.id } });
        await tx.legalProvision.updateMany({ where: { version: { sourceHash: source.hash } }, data: { sourceReferenceId: reference.id } });
        await tx.evidence.updateMany({ where: { provision: { version: { sourceHash: source.hash } } }, data: { sourceReferenceId: reference.id } });
      }
    });
    console.log({ registeredUniquePdfSources: unique.size });
  } finally {
    await prisma.$disconnect();
  }
}

await main();
