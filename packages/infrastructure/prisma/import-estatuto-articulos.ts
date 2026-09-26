import { createHash } from "node:crypto";
import { readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const inputPath = resolve(process.cwd(), "../../data/legal-sources/incoming/estatuto_articulos_solicitados.md");
const sourceText = readFileSync(inputPath, "utf8");
const sourceHash = createHash("sha256").update(sourceText).digest("hex");
const sourceId = sourceHash;
const documentId = "legal-estatuto-tributario";
const versionLabel = "Artículos solicitados desde Markdown 2026-09-18";
const effectiveFrom = new Date("1989-03-30T00:00:00Z");

type Article = { number: number; title: string; content: string; sourceUrl: string };

function parseArticles(markdown: string): Article[] {
  const sections = markdown.split(/^### Artículo (\d+)\s*$/m).slice(1);
  const articles: Article[] = [];
  for (let index = 0; index < sections.length; index += 2) {
    const number = Number(sections[index]);
    const section = sections[index + 1] ?? "";
    const sourceUrl = section.match(/Fuente:\s*(https?:\/\/\S+)/)?.[1] ?? "";
    const current = section.split(/\n(?:Modificaciones|Normas Relacionadas|Texto Anterior)\s*\n/i, 1)[0];
    const lines = current.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    const headingIndex = lines.findIndex((line) => new RegExp(`^Art\\.?\\s+${number}\\.`).test(line));
    if (headingIndex < 0) throw new Error(`No se encontró el encabezado del artículo ${number}`);
    const heading = lines[headingIndex].replace(/^Art\.?\s+\d+\.\s*/, "").trim();
    const content = lines.slice(headingIndex + 1).join("\n").replace(/\nFuente:.*$/is, "").trim();
    if (!content) throw new Error(`El artículo ${number} no tiene contenido vigente`);
    articles.push({ number, title: heading, content, sourceUrl });
  }
  return articles;
}

async function main() {
  const articles = parseArticles(sourceText);
  const byteSize = statSync(inputPath).size;
  const source = await prisma.sourceReference.upsert({
    where: { sourceHash },
    update: { storageKey: "incoming/estatuto_articulos_solicitados.md", originalName: "estatuto_articulos_solicitados.md", mimeType: "text/markdown", byteSize },
    create: { id: sourceId, sourceHash, storageKey: "incoming/estatuto_articulos_solicitados.md", originalName: "estatuto_articulos_solicitados.md", mimeType: "text/markdown", byteSize },
  });

  await prisma.$transaction(async (tx) => {
    const document = await tx.legalDocument.upsert({
      where: { id: documentId },
      update: { source: "https://estatuto.co/", officialUrl: "https://estatuto.co/", contentHash: sourceHash, originalFileKey: source.storageKey, pipelineStatus: "REVIEW_REQUIRED", status: "pending_review" },
      create: { id: documentId, title: "Estatuto Tributario — artículos solicitados", source: "https://estatuto.co/", authority: "Pendiente de verificación", documentType: "statute", officialUrl: "https://estatuto.co/", contentHash: sourceHash, originalFileKey: source.storageKey, pipelineStatus: "REVIEW_REQUIRED", effectiveFrom, status: "pending_review" },
    });
    const version = await tx.legalVersion.upsert({
      where: { documentId_label: { documentId: document.id, label: versionLabel } },
      update: { sourceHash, sourceReferenceId: source.id, extractor: "markdown-import", extractorVersion: "1", status: "pending_review", isCurrent: true },
      create: { documentId: document.id, label: versionLabel, effectiveFrom, status: "pending_review", sourceHash, sourceReferenceId: source.id, extractor: "markdown-import", extractorVersion: "1", isCurrent: true },
    });

    for (const article of articles) {
      const id = `provision-et-${article.number}`;
      const provision = await tx.legalProvision.upsert({
        where: { id },
        update: { documentId: document.id, versionId: version.id, unitType: "article", anchor: `articulo-${article.number}`, order: article.number, validationStatus: "pending", editorialStatus: "draft", number: `Artículo ${article.number}`, title: article.title, content: article.content, citation: `Estatuto Tributario, artículo ${article.number}`, effectiveFrom, status: "pending_review", sourceReferenceId: source.id, extractor: "markdown-import", extractorVersion: "1" },
        create: { id, documentId: document.id, versionId: version.id, unitType: "article", anchor: `articulo-${article.number}`, order: article.number, validationStatus: "pending", editorialStatus: "draft", number: `Artículo ${article.number}`, title: article.title, content: article.content, citation: `Estatuto Tributario, artículo ${article.number}`, effectiveFrom, status: "pending_review", sourceReferenceId: source.id, extractor: "markdown-import", extractorVersion: "1" },
      });
      const evidence = await tx.evidence.upsert({
        where: { id: `evidence-${id}` },
        update: { provisionId: provision.id, content: article.content, citation: provision.citation, sourceReferenceId: source.id, extractor: "markdown-import", extractorVersion: "1" },
        create: { id: `evidence-${id}`, provisionId: provision.id, content: article.content, citation: provision.citation, sourceReferenceId: source.id, extractor: "markdown-import", extractorVersion: "1" },
      });
      const questions = await tx.question.findMany({ where: { OR: [{ stem: { contains: `artículo ${article.number}`, mode: "insensitive" } }, { explanation: { contains: `artículo ${article.number}`, mode: "insensitive" } }] }, select: { id: true } });
      for (const question of questions) await tx.questionEvidence.upsert({ where: { questionId_evidenceId: { questionId: question.id, evidenceId: evidence.id } }, update: {}, create: { questionId: question.id, evidenceId: evidence.id } });
    }
    console.log(JSON.stringify({ articles: articles.length, sourceHash, sourceReferenceId: source.id, documentId: document.id, versionId: version.id }, null, 2));
  });
}

main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
