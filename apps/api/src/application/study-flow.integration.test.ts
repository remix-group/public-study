import { afterAll, describe, expect, it } from "vitest";
import { prisma } from "@dian-study/infrastructure";
import { startStudySession } from "./start-study-session.js";
import { submitQuestionAttempt } from "./submit-question-attempt.js";
import { finishStudySession, getNextCase, getNextQuestion, getObjectiveStudyGuide, getStudentDashboard, getStudyLibrary } from "./study-session-progress.js";
import { hashPassword } from "../auth/crypto.js";
import { loginStudent } from "../auth/service.js";
import { createEditorialQuestion, setQuestionPublication } from "./editorial-content.js";
import { createLegalDocument, createLegalEvidence, createLegalUnit, createLegalVersion, createNormRelation, reviewLegalUnit, transitionDocument } from "./legal-knowledge.js";
import { generateDocumentStudyMaterial } from "./automated-content.js";
import type { AiProvider } from "../ai/provider.js";
import { buildManualGenerationPrompt } from "./manual-content.js";
import { submitCaseAttempt } from "./submit-case-attempt.js";

const integration = process.env.DATABASE_URL ? describe : describe.skip;
const studentId = "student-integration-test";
let sessionId = "";
let editorialQuestionId = "";
let knowledgeDocumentId = "";
let knowledgeVersionId = "";
let knowledgeUnitId = "";
let knowledgeEvidenceId = "";
let knowledgeRelationId = "";
let automatedQuestionId = "";
let rejectedPublicationQuestionId = "";
let caseSessionId = "";
let integrationCaseId = "";

integration("study flow AC-001/002/003", () => {
  it("starts a session and returns the competency objectives", async () => {
    await prisma.student.upsert({
      where: { email: "integration@dian-study.local" }, update: { passwordHash: await hashPassword("Integration2026!"), role: "editor" },
      create: { id: studentId, name: "Integration Test", email: "integration@dian-study.local", passwordHash: await hashPassword("Integration2026!"), role: "editor" },
    });
    const result = await startStudySession({ studentId, competencyId: "competency-cobro-coactivo" });
    sessionId = result.session.id;
    const objectiveIds = result.competency.blocks.flatMap((block) => block.topics.flatMap((topic) => topic.learningObjectives.map(({ id }) => id)));
    expect(objectiveIds).toContain("objective-alcance-art-823");
    expect(objectiveIds).toContain("objective-route-25");
  });

  it("authenticates with a derived password and stores only a token hash", async () => {
    const result = await loginStudent({ email: "integration@dian-study.local", password: "Integration2026!" });
    const stored = await prisma.authSession.findFirst({ where: { studentId } });
    expect(result.token).toBeTruthy();
    expect(stored?.tokenHash).not.toBe(result.token);
  });

  it("builds a study guide only from published legal evidence", async () => {
    const guide = await getObjectiveStudyGuide("objective-alcance-art-823");
    expect(guide.objective.name).toContain("cobro coactivo");
    expect(guide.evidences[0]).toMatchObject({ provisionNumber: "Artículo 823", documentTitle: "Estatuto Tributario" });
    expect(guide.keyConcepts.length).toBeGreaterThan(0);
    expect(guide.questionCount).toBeGreaterThan(0);
    expect(guide.readiness).toBe("READY");
    expect(guide.lesson.some(({ kind }) => kind === "central_idea")).toBe(true);
    expect(guide.lesson.filter(({ kind }) => kind === "source").every(({ sourceEvidenceIds }) => sourceEvidenceIds.length > 0)).toBe(true);
    expect(guide.checks[0]?.sourceEvidenceIds.length).toBeGreaterThan(0);
    expect(guide.practice).toEqual({ available: true, questionCount: guide.questionCount });
  });

  it("uses the same honest study-package template for route material still under review", async () => {
    const guide = await getObjectiveStudyGuide("objective-route-01");
    expect(guide.readiness).toBe("IN_REVIEW");
    expect(guide.evidences).toEqual(expect.arrayContaining([
      expect.objectContaining({ sourceKind: "pedagogical", status: "pending" }),
    ]));
    expect(guide.lesson.some(({ kind }) => kind === "central_idea")).toBe(true);
    expect(guide.lesson.filter(({ kind }) => kind !== "source").every(({ status }) => status === "pending")).toBe(true);
    expect(guide.checks.length).toBeGreaterThan(0);
    expect(guide.practice.available).toBe(false);
    expect(guide.workedExample).toBeNull();
    expect(guide.applicationCase).toBeNull();
  });

  it("preserves documentary provenance, literal content and stable library order", async () => {
    const stored = await prisma.legalProvision.findFirstOrThrow({
      where: { documentId: "material-route-opec-236828", unitType: "learning_route" },
    });
    const first = await getStudyLibrary({ documentId: "material-route-opec-236828", query: stored.content.slice(40, 90) });
    const second = await getStudyLibrary({ documentId: "material-route-opec-236828", query: stored.content.slice(40, 90) });
    expect(first.selectedDocument?.originalFileName).toBe("Ruta - Hoja 1.pdf");
    expect(first.units.find(({ id }) => id === stored.id)?.content).toBe(stored.content);
    expect(first.units.map(({ id }) => id)).toEqual(second.units.map(({ id }) => id));
    expect(first.units[0]?.contentLayer).toBe("original");
  });

  it("creates a draft and records human approval when publishing", async () => {
    const created = await createEditorialQuestion({
      objectiveId: "objective-alcance-art-823", difficulty: 0.5,
      stem: "¿Pregunta temporal para verificar el ciclo editorial?",
      options: [{ key: "A", text: "Respuesta válida" }, { key: "B", text: "Distractor" }],
      correctAnswer: "A", explanation: "Explicación temporal suficientemente extensa.",
      evidenceIds: ["evidence-et-823-scope"],
    });
    editorialQuestionId = created.id;
    expect(created.editorialStatus).toBe("draft");
    const published = await setQuestionPublication(created.id, true, studentId);
    expect(published.editorialStatus).toBe("published");
    expect(published.reviewedBy).toBe(studentId);
  });

  it("refuses to publish a question when its legal source is still pending review", async () => {
    const pendingEvidence = await prisma.evidence.findFirstOrThrow({ where: { provision: { validationStatus: "pending" } } });
    const created = await createEditorialQuestion({
      objectiveId: "objective-alcance-art-823", difficulty: 0.4,
      stem: "¿Pregunta de control que no debe publicarse con una fuente pendiente?",
      options: [{ key: "A", text: "Sí" }, { key: "B", text: "No" }], correctAnswer: "A",
      explanation: "La publicación exige que toda fuente jurídica esté revisada y vigente.", evidenceIds: [pendingEvidence.id],
    });
    rejectedPublicationQuestionId = created.id;
    await expect(setQuestionPublication(created.id, true, studentId)).rejects.toThrow("fuentes oficiales");
  });

  it("versions a source and only creates evidence from an approved legal unit", async () => {
    const document = await createLegalDocument({ title: "Documento temporal", authority: "DIAN", documentType: "concept", officialUrl: "https://www.dian.gov.co/", effectiveFrom: new Date("2026-01-01") });
    knowledgeDocumentId = document.id;
    expect(document.pipelineStatus).toBe("RECEIVED");
    expect((await transitionDocument(document.id, "VALIDATED")).pipelineStatus).toBe("VALIDATED");
    const version = await createLegalVersion({ documentId: document.id, label: "v1", effectiveFrom: new Date("2026-01-01"), status: "vigente", isCurrent: true });
    knowledgeVersionId = version.id;
    const unit = await createLegalUnit({ documentId: document.id, versionId: version.id, unitType: "article", anchor: "articulo-1", order: 1, number: "Artículo 1", title: "Temporal", content: "Contenido jurídico temporal para integración.", citation: "Documento temporal, artículo 1", effectiveFrom: new Date("2026-01-01"), status: "vigente" });
    knowledgeUnitId = unit.id;
    await expect(createLegalEvidence({ provisionId: unit.id, content: unit.content, citation: unit.citation })).rejects.toThrow("approved");
    await reviewLegalUnit(unit.id, "approved");
    const evidence = await createLegalEvidence({ provisionId: unit.id, content: unit.content, citation: unit.citation });
    knowledgeEvidenceId = evidence.id;
    const relation = await createNormRelation({ sourceProvisionId: unit.id, targetProvisionId: "provision-et-823", type: "REFERENCES", description: "Relación temporal de integración" });
    knowledgeRelationId = relation.id;
  });

  it("generates reviewable drafts through the provider abstraction without auto-publishing legal content", async () => {
    for (const state of ["EXTRACTED", "PARSED", "ENRICHED", "INDEXED", "DRAFT_KNOWLEDGE", "REVIEW_REQUIRED", "PUBLISHED"]) {
      await transitionDocument(knowledgeDocumentId, state);
    }
    const exported = await buildManualGenerationPrompt(knowledgeDocumentId);
    expect(exported.prompt).toContain(knowledgeUnitId);
    expect(exported.prompt).toContain("objective-alcance-art-823");
    const fakeProvider: AiProvider = {
      name: "fake",
      async generateStudyMaterial(input) {
        return [{ provisionId: input.provisions[0].id, objectiveId: "objective-alcance-art-823", stem: "¿Qué confirma el contenido jurídico temporal usado por esta prueba?", options: [{ key: "A", text: "El contenido temporal" }, { key: "B", text: "Una regla inexistente" }, { key: "C", text: "Un trámite judicial" }, { key: "D", text: "Una norma extranjera" }], correctAnswer: "A", explanation: "La evidencia temporal confirma literalmente el contenido jurídico de integración.", difficulty: 0.4, confidence: 0.95 }];
      },
    };
    const result = await generateDocumentStudyMaterial(knowledgeDocumentId, fakeProvider);
    expect(result.questionsCreated).toBe(1);
    const generated = await prisma.question.findFirst({ where: { stem: { contains: "contenido jurídico temporal" } } });
    automatedQuestionId = generated?.id ?? "";
    expect(generated?.editorialStatus).toBe("draft");
  });

  it("atomically records an incorrect attempt, evidence, mistake, mastery and review", async () => {
    const result = await submitQuestionAttempt({
      studentId, sessionId, questionId: "question-et-823-1", answer: "B", timeSpentMs: 4200, confidence: 0,
    });
    expect(result.attempt.confidence).toBe(0);
    expect(result.attempt.difficulty).toBe(0.3);
    expect(result.evidence).toHaveLength(1);
    expect(result.mistakes[0]?.type).toBe("UNKNOWN_CONCEPT");

    const [mastery, review] = await Promise.all([
      prisma.masteryState.findUnique({ where: { studentId_objectiveId: { studentId, objectiveId: "objective-alcance-art-823" } } }),
      prisma.reviewSchedule.findUnique({ where: { studentId_objectiveId: { studentId, objectiveId: "objective-alcance-art-823" } } }),
    ]);
    expect(mastery?.totalAttempts).toBe(1);
    expect(review?.completed).toBe(false);
  });

  it("records an evidence-backed situational case as guided self-review", async () => {
    const studyCase = await prisma.case.create({ data: {
      objectiveId: "objective-alcance-art-823", difficulty: 0.7,
      scenario: "Una obligación exigible no ha sido pagada. Explica cómo debe iniciar la actuación de cobro.",
      expectedAnalysis: "La actuación se inicia por funcionario competente con mandamiento de pago conforme a la norma aplicable.",
    } });
    integrationCaseId = studyCase.id;
    await prisma.caseEvidence.create({ data: { caseId: studyCase.id, evidenceId: "evidence-et-823-scope" } });
    const caseSession = await startStudySession({ studentId, competencyId: "competency-cobro-coactivo", mode: "CASE", focusObjectiveId: "objective-alcance-art-823" });
    caseSessionId = caseSession.session.id;
    const next = await getNextCase(caseSessionId, studentId, "objective-alcance-art-823");
    expect(next?.case.id).toBe(integrationCaseId);
    const result = await submitCaseAttempt({
      studentId, sessionId: caseSessionId, caseId: integrationCaseId, timeSpentMs: 3_000,
      response: "La administración debe identificar la obligación exigible y expedir el mandamiento de pago por el funcionario competente, indicando la obligación y el término para atenderla.",
    });
    expect(result.evaluationMethod).toBe("self_review");
    expect(result.expectedAnalysis).toContain("mandamiento de pago");
    expect(result.evidence).toHaveLength(1);
    const summary = await finishStudySession(caseSessionId, studentId);
    expect(summary.caseAttempts).toHaveLength(1);
  });

  it("selects an unanswered question, finishes the session and exposes progress", async () => {
    const next = await getNextQuestion(sessionId, studentId);
    expect(next?.question.id).not.toBe("question-et-823-1");
    const focused = await getNextQuestion(sessionId, studentId, "objective-mandamiento-pago");
    expect(focused?.question.objectiveId).toBe("objective-mandamiento-pago");
    const summary = await finishStudySession(sessionId, studentId);
    expect(summary.session.finishedAt).not.toBeNull();
    expect(summary.attempts).toHaveLength(1);
    const dashboard = await getStudentDashboard(studentId);
    expect(dashboard.objectives.find(({ objectiveId }) => objectiveId === "objective-alcance-art-823")?.totalAttempts).toBe(2);
    expect(dashboard.objectives).toHaveLength(29);
    expect(dashboard.route).toHaveLength(6);
    expect(dashboard.route.reduce((total, block) => total + block.topics.length, 0)).toBe(25);
    expect(dashboard.recommendedObjective?.accessible).toBe(true);
    expect(dashboard.recentSessions).toHaveLength(2);
  });
});

afterAll(async () => {
  if (!process.env.DATABASE_URL) return;
  if (editorialQuestionId) {
    await prisma.questionEvidence.deleteMany({ where: { questionId: editorialQuestionId } });
    await prisma.question.deleteMany({ where: { id: editorialQuestionId } });
  }
  if (rejectedPublicationQuestionId) {
    await prisma.questionEvidence.deleteMany({ where: { questionId: rejectedPublicationQuestionId } });
    await prisma.question.deleteMany({ where: { id: rejectedPublicationQuestionId } });
  }
  if (knowledgeRelationId) await prisma.legalRelation.deleteMany({ where: { id: knowledgeRelationId } });
  if (automatedQuestionId) {
    await prisma.questionEvidence.deleteMany({ where: { questionId: automatedQuestionId } });
    await prisma.question.deleteMany({ where: { id: automatedQuestionId } });
  }
  if (knowledgeEvidenceId) await prisma.evidence.deleteMany({ where: { id: knowledgeEvidenceId } });
  if (knowledgeUnitId) await prisma.legalProvision.deleteMany({ where: { id: knowledgeUnitId } });
  if (knowledgeVersionId) await prisma.legalVersion.deleteMany({ where: { id: knowledgeVersionId } });
  if (knowledgeDocumentId) await prisma.legalDocument.deleteMany({ where: { id: knowledgeDocumentId } });
  if (integrationCaseId) {
    await prisma.caseAttempt.deleteMany({ where: { caseId: integrationCaseId } });
    await prisma.caseEvidence.deleteMany({ where: { caseId: integrationCaseId } });
    await prisma.case.deleteMany({ where: { id: integrationCaseId } });
  }
  const attempts = await prisma.questionAttempt.findMany({ where: { studentId }, select: { id: true } });
  await prisma.mistake.deleteMany({ where: { questionAttemptId: { in: attempts.map(({ id }) => id) } } });
  await prisma.questionAttempt.deleteMany({ where: { studentId } });
  await prisma.caseAttempt.deleteMany({ where: { studentId } });
  await prisma.reviewSchedule.deleteMany({ where: { studentId } });
  await prisma.masteryState.deleteMany({ where: { studentId } });
  await prisma.studySession.deleteMany({ where: { studentId } });
  await prisma.student.deleteMany({ where: { id: studentId } });
  await prisma.$disconnect();
});
