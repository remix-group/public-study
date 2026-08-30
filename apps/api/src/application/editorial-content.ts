import { Prisma, prisma } from "@dian-study/infrastructure";
import { AttemptConflictError, AttemptNotFoundError } from "./submit-question-attempt.js";

export interface EditorialQuestionInput {
  objectiveId: string;
  difficulty: number;
  stem: string;
  options: Array<{ key: string; text: string }>;
  correctAnswer: string;
  explanation: string;
  evidenceIds: string[];
}

export async function getEditorialCatalog() {
  const [questions, objectives, evidences] = await Promise.all([
    prisma.question.findMany({
      orderBy: { updatedAt: "desc" },
      include: { objective: true, evidences: { include: { evidence: { include: { provision: true } } } } },
    }),
    prisma.learningObjective.findMany({ where: { status: "active" }, orderBy: { order: "asc" }, include: { topic: true } }),
    prisma.evidence.findMany({ orderBy: { citation: "asc" }, include: { provision: true } }),
  ]);
  return { questions, objectives, evidences };
}

function validateQuestion(input: EditorialQuestionInput) {
  const keys = input.options.map(({ key }) => key);
  if (new Set(keys).size !== keys.length) throw new AttemptConflictError("Option keys must be unique");
  if (!keys.includes(input.correctAnswer)) throw new AttemptConflictError("Correct answer must match an option");
  if (input.evidenceIds.length === 0) throw new AttemptConflictError("At least one legal evidence is required");
}

export async function createEditorialQuestion(input: EditorialQuestionInput) {
  validateQuestion(input);
  return prisma.question.create({
    data: {
      objectiveId: input.objectiveId, type: "multiple_choice", difficulty: input.difficulty,
      stem: input.stem, options: input.options as unknown as Prisma.InputJsonValue,
      correctAnswer: input.correctAnswer, explanation: input.explanation, editorialStatus: "draft",
      evidences: { create: input.evidenceIds.map((evidenceId) => ({ evidenceId })) },
    },
    include: { objective: true, evidences: { include: { evidence: true } } },
  });
}

export async function updateEditorialQuestion(id: string, input: EditorialQuestionInput) {
  validateQuestion(input);
  const current = await prisma.question.findUnique({ where: { id } });
  if (!current) throw new AttemptNotFoundError("Question not found");
  if (current.editorialStatus === "published") throw new AttemptConflictError("Unpublish the question before editing it");
  return prisma.question.update({
    where: { id },
    data: {
      objectiveId: input.objectiveId, difficulty: input.difficulty, stem: input.stem,
      options: input.options as unknown as Prisma.InputJsonValue, correctAnswer: input.correctAnswer,
      explanation: input.explanation, reviewedBy: null, reviewedAt: null,
      evidences: { deleteMany: {}, create: input.evidenceIds.map((evidenceId) => ({ evidenceId })) },
    },
    include: { objective: true, evidences: { include: { evidence: true } } },
  });
}

export async function setQuestionPublication(id: string, publish: boolean, editorId: string) {
  const question = await prisma.question.findUnique({ where: { id }, include: { evidences: true } });
  if (!question) throw new AttemptNotFoundError("Question not found");
  if (publish) {
    const options = question.options as Array<{ key?: string }> | null;
    if (!options?.some(({ key }) => key === question.correctAnswer) || question.evidences.length === 0 || !question.explanation.trim()) {
      throw new AttemptConflictError("Question is incomplete and cannot be published");
    }
  }
  return prisma.question.update({
    where: { id },
    data: publish
      ? { editorialStatus: "published", reviewedBy: editorId, reviewedAt: new Date() }
      : { editorialStatus: "draft", reviewedBy: null, reviewedAt: null },
  });
}
