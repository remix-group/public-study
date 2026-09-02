import { z } from "zod";
import { prisma } from "@dian-study/infrastructure";
import type { AiProvider, GeneratedQuestion } from "../ai/provider.js";
import { AttemptConflictError, AttemptNotFoundError } from "./submit-question-attempt.js";

export const importedQuestionsSchema = z.object({
  questions: z.array(z.object({
    provisionId: z.string(), objectiveId: z.string(), stem: z.string().min(15),
    options: z.array(z.object({ key: z.enum(["A", "B", "C", "D"]), text: z.string().min(1) })).length(4),
    correctAnswer: z.enum(["A", "B", "C", "D"]), explanation: z.string().min(15),
    difficulty: z.number().min(0).max(1), confidence: z.number().min(0).max(1),
  })).min(1).max(40),
});

export async function buildManualGenerationPrompt(documentId: string) {
  const document = await prisma.legalDocument.findUnique({
    where: { id: documentId },
    include: { provisions: { orderBy: { order: "asc" }, take: 20, select: { id: true, citation: true, content: true } } },
  });
  if (!document) throw new AttemptNotFoundError("Legal document not found");
  if (!document.provisions.length) throw new AttemptConflictError("Primero carga y procesa el PDF para extraer unidades jurídicas");
  const objectives = await prisma.learningObjective.findMany({
    where: { status: "active", topic: { status: "active", block: { status: "active", competency: { status: "active" } } } },
    orderBy: [{ topic: { block: { order: "asc" } } }, { topic: { order: "asc" } }, { order: "asc" }], select: { id: true, name: true, description: true },
  });
  const source = { document: document.title, objectives, provisions: document.provisions.map((unit) => ({ ...unit, content: unit.content.slice(0, 5000) })) };
  const prompt = `Actúa como diseñador de evaluación para el concurso de méritos de la DIAN en Colombia.\n\nREGLAS OBLIGATORIAS:\n1. Usa exclusivamente el texto jurídico incluido al final. No agregues conocimiento externo.\n2. Genera hasta 2 preguntas por disposición que sea relevante para alguno de los objetivos. Omite disposiciones irrelevantes.\n3. Cada pregunta debe usar exactamente un provisionId y un objectiveId existentes.\n4. Incluye cuatro opciones A, B, C y D, sin repetir claves.\n5. La respuesta debe poder demostrarse literalmente con la disposición asociada.\n6. La explicación debe indicar la regla aplicable sin inventar citas.\n7. confidence debe estar entre 0 y 1; usa menos de 0.8 si existe cualquier ambigüedad.\n8. Devuelve SOLAMENTE JSON válido, sin markdown, comentarios ni texto adicional.\n\nFORMATO EXACTO:\n{"questions":[{"provisionId":"id existente","objectiveId":"id existente","stem":"pregunta","options":[{"key":"A","text":"opción"},{"key":"B","text":"opción"},{"key":"C","text":"opción"},{"key":"D","text":"opción"}],"correctAnswer":"A","explanation":"explicación sustentada","difficulty":0.5,"confidence":0.9}]}\n\nFUENTE Y OBJETIVOS:\n${JSON.stringify(source, null, 2)}`;
  return { documentId, documentTitle: document.title, prompt, provisionCount: document.provisions.length, objectiveCount: objectives.length };
}

export function manualImportProvider(questions: GeneratedQuestion[]): AiProvider {
  return { name: "chatgpt-manual-import", async generateStudyMaterial() { return questions; } };
}
