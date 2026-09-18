import { Prisma, prisma } from "@dian-study/infrastructure";
import { AttemptConflictError, AttemptNotFoundError } from "./submit-question-attempt.js";
import { ensureTopicProgress } from "./progression.js";

async function requireOwnedSession(sessionId: string, studentId: string) {
  const session = await prisma.studySession.findUnique({ where: { id: sessionId } });
  if (!session) throw new AttemptNotFoundError("Study session not found");
  if (session.studentId !== studentId) throw new AttemptConflictError("Study session does not belong to student");
  return session;
}

function safeQuestion<T extends { correctAnswer: string; explanation: string }>(question: T) {
  const { correctAnswer: _answer, explanation: _explanation, ...safe } = question;
  return safe;
}

export async function getNextQuestion(sessionId: string, studentId: string, objectiveId?: string) {
  const session = await requireOwnedSession(sessionId, studentId);
  if (session.finishedAt) throw new AttemptConflictError("Study session is already finished");
  if (objectiveId) {
    const belongs = await prisma.learningObjective.count({ where: { id: objectiveId, topic: { block: { competencyId: session.competencyId } } } });
    if (!belongs) throw new AttemptConflictError("Learning objective does not belong to the session competency");
  }

  const previous = await prisma.questionAttempt.findMany({
    where: { sessionId }, select: { questionId: true },
  });
  const question = await prisma.question.findFirst({
    where: {
      id: { notIn: previous.map(({ questionId }) => questionId) },
      editorialStatus: "published",
      ...(objectiveId ? { objectiveId } : {}),
      objective: { topic: { block: { competencyId: session.competencyId } } },
      evidences: { some: {} },
    },
    orderBy: [{ objective: { order: "asc" } }, { difficulty: "asc" }, { createdAt: "asc" }],
    include: { objective: true },
  });
  return question ? { question: safeQuestion(question), objective: question.objective } : null;
}

export async function finishStudySession(sessionId: string, studentId: string) {
  await requireOwnedSession(sessionId, studentId);
  return prisma.$transaction(async (tx) => {
    const session = await tx.studySession.update({
      where: { id: sessionId }, data: { finishedAt: new Date() },
    });
    const attempts = await tx.questionAttempt.findMany({
      where: { sessionId }, orderBy: { createdAt: "asc" },
      include: { question: { include: { objective: true } }, mistakes: true },
    });
    return {
      session,
      accuracy: session.totalQuestions ? session.correctAnswers / session.totalQuestions : 0,
      attempts: attempts.map((attempt) => ({
        id: attempt.id, result: attempt.result, answer: attempt.answer,
        question: attempt.question.stem, objective: attempt.question.objective.name,
        mistakes: attempt.mistakes,
      })),
    };
  });
}

export async function getStudentDashboard(studentId: string) {
  const student = await prisma.student.findUnique({ where: { id: studentId } });
  if (!student) throw new AttemptNotFoundError("Student not found");
  const competencies = await prisma.competency.findMany({ where: { status: "active" }, select: { id: true } });
  for (const competency of competencies) await ensureTopicProgress(studentId, competency.id);
  const [mastery, reviews, sessions, blocks, progress, mistakes] = await Promise.all([
    prisma.masteryState.findMany({
      where: { studentId }, orderBy: { updatedAt: "desc" }, include: { objective: { include: { topic: { include: { block: true } } } } },
    }),
    prisma.reviewSchedule.findMany({
      where: { studentId, completed: false }, orderBy: { scheduledAt: "asc" }, include: { objective: true },
    }),
    prisma.studySession.findMany({ where: { studentId, finishedAt: { not: null } }, orderBy: { finishedAt: "desc" }, take: 5 }),
    prisma.block.findMany({
      where: { status: "active", competency: { status: "active" } }, orderBy: { order: "asc" },
      include: { competency: { include: { opec: true } }, topics: { where: { status: "active" }, orderBy: { order: "asc" }, include: {
        learningObjectives: { where: { status: "active" }, orderBy: { order: "asc" }, include: { _count: { select: { questions: { where: { editorialStatus: "published" } } } } } },
      } } },
    }),
    prisma.topicProgress.findMany({ where: { studentId } }),
    prisma.mistake.findMany({ where: { questionAttempt: { studentId } }, orderBy: { createdAt: "desc" }, take: 8, include: { objective: { include: { topic: true } } } }),
  ]);
  const masteryByObjective = new Map(mastery.map((item) => [item.objectiveId, item]));
  const progressByTopic = new Map(progress.map((item) => [item.topicId, item]));
  const objectives = blocks.flatMap((block) => block.topics.flatMap((topic) => topic.learningObjectives.map((objective) => ({ objective, topic, block }))));
  const objectiveProgress = objectives.map(({ objective, topic, block }) => {
    const state = masteryByObjective.get(objective.id);
    const curriculumState = progressByTopic.get(topic.id)?.state ?? "LOCKED";
    return {
      objectiveId: objective.id, objective: objective.name, description: objective.description,
      topicId: topic.id, topic: topic.name, blockId: block.id, block: block.name, critical: objective.critical,
      curriculumState, accessible: curriculumState !== "LOCKED", mastery: state?.mastery ?? 0,
      totalAttempts: state?.totalAttempts ?? 0, retention: state?.retention ?? 0, questionCount: objective._count.questions,
      dimensions: { recall: state?.recall ?? 0, comprehension: state?.comprehension ?? 0, application: state?.application ?? 0, sourceAwareness: state?.sourceAwareness ?? 0, stability: state?.stability ?? 0 },
    };
  });
  const dueReview = reviews.find((review) => review.scheduledAt <= new Date() && objectiveProgress.some((item) => item.objectiveId === review.objectiveId && item.accessible));
  const recommended = dueReview
    ? objectiveProgress.find((item) => item.objectiveId === dueReview.objectiveId)
    : [...objectiveProgress].filter((item) => item.accessible && item.questionCount > 0).sort((a, b) => a.mastery - b.mastery || a.totalAttempts - b.totalAttempts)[0]
      ?? objectiveProgress.find((item) => item.accessible);
  const recommendation = recommended ? {
    ...recommended,
    action: dueReview ? "REVIEW" : recommended.questionCount && recommended.totalAttempts ? "PRACTICE" : "LEARN",
    reason: dueReview
      ? "El objetivo tiene un repaso programado y riesgo de olvido."
      : recommended.questionCount && recommended.totalAttempts
        ? "El objetivo está desbloqueado y presenta el dominio más bajo de tu ruta actual."
        : recommended.questionCount
          ? "Es el siguiente objetivo disponible en la ruta curricular."
          : "Es el siguiente material disponible en la ruta; la práctica se habilitará cuando tenga preguntas revisadas.",
  } : null;
  const route = blocks.map((block) => ({
    id: block.id, name: block.name, description: block.description, threshold: block.progressionThreshold,
    competency: block.competency.name, profile: block.competency.opec.name,
    topics: block.topics.map((topic) => {
      const topicObjectives = objectiveProgress.filter((item) => item.topicId === topic.id);
      const topicProgress = progressByTopic.get(topic.id);
      return { id: topic.id, name: topic.name, description: topic.description, order: topic.order,
        state: topicProgress?.state ?? "LOCKED", accessible: (topicProgress?.state ?? "LOCKED") !== "LOCKED",
        mastery: topicObjectives.length ? topicObjectives.reduce((sum, item) => sum + item.mastery, 0) / topicObjectives.length : 0,
        objectives: topicObjectives };
    }),
  }));
  return {
    student: { id: student.id, name: student.name },
    process: { title: "Aprendizaje activo y adaptativo", steps: ["Recupera lo que sabes", "Estudia con evidencia", "Practica y aplica", "Recibe diagnóstico", "Refuerza o avanza", "Repasa para mantener"] },
    overallMastery: mastery.length ? mastery.reduce((sum, item) => sum + item.mastery, 0) / mastery.length : 0,
    objectives: objectiveProgress,
    route,
    recommendedObjective: recommendation,
    pendingReviews: reviews.map((review) => ({
      objectiveId: review.objectiveId, objective: review.objective.name,
      scheduledAt: review.scheduledAt, due: review.scheduledAt <= new Date(),
    })),
    recentSessions: sessions,
    recentMistakes: mistakes.map((mistake) => ({ id: mistake.id, type: mistake.type, description: mistake.description, objective: mistake.objective.name, topic: mistake.objective.topic.name, createdAt: mistake.createdAt })),
  };
}

export async function getObjectiveStudyGuide(objectiveId: string, studentId?: string) {
  const objective = await prisma.learningObjective.findFirst({
    where: { id: objectiveId, status: "active", topic: { status: "active" } },
    include: {
      topic: { include: { block: { include: { competency: true } } } },
      concepts: {
        orderBy: { createdAt: "asc" },
        include: { evidences: { include: { evidence: { include: { provision: { include: { document: true } } } } } } },
      },
      questions: {
        where: { editorialStatus: "published", evidences: { some: {} } },
        orderBy: [{ difficulty: "asc" }, { createdAt: "asc" }],
        select: {
          id: true, difficulty: true, explanation: true,
          evidences: { include: { evidence: { include: { provision: { include: { document: true } } } } } },
        },
      },
      cases: {
        orderBy: [{ difficulty: "asc" }, { createdAt: "asc" }],
        include: { evidences: { include: { evidence: { include: { provision: { include: { document: true } } } } } } },
      },
    },
  });
  if (!objective) throw new AttemptNotFoundError("Learning objective not found");

  const evidenceById = new Map<string, {
    id: string; citation: string; content: string; provisionNumber: string; provisionTitle: string;
    documentTitle: string; documentType: string; unitType: string; officialUrl: string;
    validationStatus: string; editorialStatus: string; status: "reviewed" | "pending";
    sourceKind: "primary" | "pedagogical";
  }>();
  const addEvidence = (evidence: typeof objective.concepts[number]["evidences"][number]["evidence"]) => {
    const reviewed = evidence.provision.validationStatus === "approved" && evidence.provision.editorialStatus === "published";
    const pedagogical = ["study_manual", "learning_route"].includes(evidence.provision.document.documentType)
      || ["study_guide", "study_topic", "learning_route", "visual_extraction"].includes(evidence.provision.unitType);
    evidenceById.set(evidence.id, {
      id: evidence.id, citation: evidence.citation, content: evidence.content,
      provisionNumber: evidence.provision.number, provisionTitle: evidence.provision.title,
      documentTitle: evidence.provision.document.title, documentType: evidence.provision.document.documentType,
      unitType: evidence.provision.unitType, officialUrl: evidence.provision.document.officialUrl,
      validationStatus: evidence.provision.validationStatus, editorialStatus: evidence.provision.editorialStatus,
      status: reviewed ? "reviewed" : "pending", sourceKind: pedagogical ? "pedagogical" : "primary",
    });
  };
  for (const concept of objective.concepts) {
    for (const link of concept.evidences) addEvidence(link.evidence);
  }
  for (const question of objective.questions) {
    for (const link of question.evidences) {
      const { evidence } = link;
      if (evidence.provision.validationStatus !== "approved" || evidence.provision.editorialStatus !== "published") continue;
      addEvidence(evidence);
    }
  }
  for (const studyCase of objective.cases) {
    for (const link of studyCase.evidences) addEvidence(link.evidence);
  }
  const keyConcepts = [...new Set([
    ...objective.concepts.map((concept) => concept.description.trim()),
    ...objective.questions.map((question) => question.explanation.trim()),
  ].filter(Boolean))].slice(0, 6);
  const evidences = [...evidenceById.values()];
  const reviewedEvidenceIds = new Set(evidences.filter((evidence) => evidence.status === "reviewed").map((evidence) => evidence.id));
  const conceptEvidenceIds = (concept: typeof objective.concepts[number]) => concept.evidences.map(({ evidence }) => evidence.id);
  const questionEvidenceIds = (question: typeof objective.questions[number]) => question.evidences.map(({ evidence }) => evidence.id).filter((id) => reviewedEvidenceIds.has(id));
  const centralEvidenceIds = [...new Set(objective.concepts.flatMap(conceptEvidenceIds))];
  const lesson = [
    {
      id: `${objective.id}-central-idea`, kind: "central_idea" as const, title: "Idea central",
      content: objective.description, sourceEvidenceIds: centralEvidenceIds,
      status: centralEvidenceIds.some((id) => reviewedEvidenceIds.has(id)) ? "reviewed" as const : "pending" as const,
    },
    ...objective.questions.slice(0, 2).map((question, index) => {
      const sourceEvidenceIds = questionEvidenceIds(question);
      return {
        id: `${objective.id}-rule-${index + 1}`, kind: "rule" as const, title: index ? `Regla complementaria ${index + 1}` : "Regla o procedimiento",
        content: question.explanation, sourceEvidenceIds,
        status: sourceEvidenceIds.length ? "reviewed" as const : "pending" as const,
      };
    }),
    ...objective.concepts.slice(0, 6).map((concept) => {
      const sourceEvidenceIds = conceptEvidenceIds(concept);
      return {
        id: concept.id, kind: "term" as const, title: concept.name, content: concept.description,
        sourceEvidenceIds, status: sourceEvidenceIds.some((id) => reviewedEvidenceIds.has(id)) ? "reviewed" as const : "pending" as const,
      };
    }),
    ...evidences.map((evidence) => ({
      id: `source-${evidence.id}`, kind: "source" as const,
      title: evidence.sourceKind === "primary" ? "Fuente primaria" : "Material pedagógico",
      content: evidence.content, sourceEvidenceIds: [evidence.id], status: evidence.status,
    })),
  ].filter((item, index, items) => item.content.trim() && items.findIndex((candidate) => candidate.kind === item.kind && candidate.content === item.content) === index);
  const checks = objective.concepts.slice(0, 2).map((concept, index) => {
    const sourceEvidenceIds = conceptEvidenceIds(concept);
    return {
      id: `${objective.id}-check-${index + 1}`,
      prompt: `Sin mirar la lectura, explica con tus propias palabras: ${concept.name}.`,
      expectedAnswer: concept.description,
      feedback: `Compara tu respuesta con esta idea esencial y vuelve a la fuente si omitiste una condición: ${concept.description}`,
      sourceEvidenceIds,
      status: sourceEvidenceIds.some((id) => reviewedEvidenceIds.has(id)) ? "reviewed" as const : "pending" as const,
    };
  });
  const supportedCase = objective.cases.find((studyCase) => studyCase.evidences.some(({ evidence }) => reviewedEvidenceIds.has(evidence.id))) ?? null;
  const caseEvidenceIds = supportedCase
    ? supportedCase.evidences.map(({ evidence }) => evidence.id).filter((id) => reviewedEvidenceIds.has(id))
    : [];
  const hasReviewedSource = evidences.some((evidence) => evidence.status === "reviewed");
  const hasStudyMaterial = lesson.length > 1 || evidences.length > 0;
  const readiness = hasReviewedSource && checks.length > 0 && (objective.questions.length > 0 || supportedCase)
    ? "READY"
    : hasReviewedSource && hasStudyMaterial ? "PARTIAL" : "IN_REVIEW";
  const nextReview = studentId
    ? await prisma.reviewSchedule.findUnique({ where: { studentId_objectiveId: { studentId, objectiveId } } })
    : null;
  const words = lesson.reduce((total, item) => total + item.content.split(/\s+/).filter(Boolean).length, 0);
  return {
    objective: { id: objective.id, name: objective.name, description: objective.description },
    topic: { id: objective.topic.id, name: objective.topic.name },
    block: { id: objective.topic.block.id, name: objective.topic.block.name },
    competency: { id: objective.topic.block.competency.id, name: objective.topic.block.competency.name },
    readiness,
    readinessMessage: readiness === "READY"
      ? "La lectura, sus fuentes y una actividad de práctica o aplicación están disponibles."
      : readiness === "PARTIAL"
        ? "Puedes estudiar esta lectura y sus fuentes; algunos ejemplos, casos o actividades aún están en preparación."
        : "Este tema está incorporado a la ruta, pero su material permanece en revisión editorial y no se presenta como fuente jurídica validada.",
    estimatedMinutes: Math.min(25, Math.max(5, Math.ceil(words / 180) + 4)),
    outcome: objective.description,
    retrievalPrompt: `Antes de leer, explica qué recuerdas sobre: ${objective.name}.`,
    studyProcess: [
      { mode: "RETRIEVAL", title: "Recupera", description: "Intenta explicar la regla antes de volver a leerla." },
      { mode: "LEARN", title: "Comprende", description: "Contrasta tu respuesta con los conceptos y la fuente oficial." },
      { mode: "PRACTICE", title: "Practica", description: "Resuelve preguntas con feedback específico." },
      { mode: "APPLICATION", title: "Aplica", description: "Lleva la regla a una situación del procedimiento." },
      { mode: "REVIEW", title: "Mantén", description: "Vuelve a recuperar el conocimiento cuando el sistema lo programe." },
    ],
    keyConcepts,
    lesson,
    evidences,
    workedExample: supportedCase ? {
      id: supportedCase.id, situation: supportedCase.scenario, analysis: supportedCase.expectedAnalysis,
      sourceEvidenceIds: caseEvidenceIds,
    } : null,
    checks,
    practice: { available: objective.questions.length > 0, questionCount: objective.questions.length },
    applicationCase: supportedCase ? {
      id: supportedCase.id, scenario: supportedCase.scenario, expectedAnalysis: supportedCase.expectedAnalysis,
      difficulty: supportedCase.difficulty, sourceEvidenceIds: caseEvidenceIds,
    } : null,
    closure: {
      title: "Recupera antes de cerrar",
      prompts: ["Explica la idea principal sin mirar.", "Menciona dos condiciones, pasos o excepciones.", "Describe una aplicación posible.", "Identifica la fuente que respalda lo estudiado."],
    },
    nextReview: nextReview?.scheduledAt ?? null,
    questionCount: objective.questions.length,
  };
}

export async function getStudyLibrary(input: {
  documentId?: string; versionId?: string; query?: string; page?: number;
  unitType?: string; validationStatus?: string; status?: string; withIssues?: boolean;
}) {
  const page = Math.max(1, Math.trunc(input.page ?? 1));
  const take = 12;
  const documents = await prisma.legalDocument.findMany({
    orderBy: { title: "asc" },
    select: {
      id: true, title: true, authority: true, documentType: true, pipelineStatus: true,
      source: true, officialUrl: true, contentHash: true, originalFileKey: true, originalFileName: true,
      effectiveFrom: true, status: true, createdAt: true, updatedAt: true,
      versions: { orderBy: [{ isCurrent: "desc" }, { createdAt: "desc" }], select: {
        id: true, label: true, effectiveFrom: true, effectiveUntil: true, status: true,
        sourceHash: true, isCurrent: true, createdAt: true,
      } },
      _count: { select: { provisions: true } },
    },
  });
  const selectedId = documents.some((document) => document.id === input.documentId) ? input.documentId! : documents[0]?.id;
  if (!selectedId) return { documents: [], selectedDocument: null, units: [], unitTypes: [], selectedVersionId: null, page, pageSize: take, totalDocumentUnits: 0, totalPages: 0, totalUnits: 0 };
  const selectedDocument = documents.find((document) => document.id === selectedId)!;
  const selectedVersionId = selectedDocument.versions.some((version) => version.id === input.versionId)
    ? input.versionId!
    : selectedDocument.versions.find((version) => version.isCurrent)?.id ?? selectedDocument.versions[0]?.id;
  const query = input.query?.trim();
  const where: Prisma.LegalProvisionWhereInput = {
    documentId: selectedId,
    ...(selectedVersionId ? { versionId: selectedVersionId } : {}),
    ...(input.unitType ? { unitType: input.unitType } : {}),
    ...(input.validationStatus ? { validationStatus: input.validationStatus } : {}),
    ...(input.status ? { status: input.status } : {}),
    ...(input.withIssues ? { NOT: { extractionIssues: { equals: [] } } } : {}),
    ...(query ? { OR: [
      { number: { contains: query, mode: "insensitive" as const } },
      { title: { contains: query, mode: "insensitive" as const } },
      { content: { contains: query, mode: "insensitive" as const } },
    ] } : {}),
  };
  const positionWhere: Prisma.LegalProvisionWhereInput = {
    documentId: selectedId,
    ...(selectedVersionId ? { versionId: selectedVersionId } : {}),
  };
  const [units, totalUnits, orderedUnits, unitTypes] = await Promise.all([
    prisma.legalProvision.findMany({
      where, orderBy: [{ documentPath: "asc" }, { order: "asc" }, { anchor: "asc" }, { id: "asc" }], skip: (page - 1) * take, take,
      select: {
        id: true, versionId: true, parentProvisionId: true, unitType: true, anchor: true, documentPath: true, order: true,
        number: true, title: true, content: true, citation: true, validationStatus: true,
        editorialStatus: true, status: true, extractionIssues: true,
        version: { select: { id: true, label: true, status: true, isCurrent: true } },
        parent: { select: { id: true, unitType: true, number: true, title: true } },
        _count: { select: { children: true } },
      },
    }),
    prisma.legalProvision.count({ where }),
    prisma.legalProvision.findMany({ where: positionWhere, orderBy: [{ documentPath: "asc" }, { order: "asc" }, { anchor: "asc" }, { id: "asc" }], select: { id: true } }),
    prisma.legalProvision.findMany({ where: positionWhere, distinct: ["unitType"], orderBy: { unitType: "asc" }, select: { unitType: true } }),
  ]);
  const positionById = new Map(orderedUnits.map(({ id }, index) => [id, index + 1]));
  const { _count: selectedCount, ...selectedDocumentData } = selectedDocument;
  return {
    documents: documents.map(({ _count, ...document }) => ({ ...document, unitCount: _count.provisions })),
    selectedDocument: { ...selectedDocumentData, unitCount: selectedCount.provisions },
    selectedVersionId: selectedVersionId ?? null,
    unitTypes: unitTypes.map(({ unitType }) => unitType),
    units: units.map(({ _count, ...unit }) => ({
      ...unit,
      position: positionById.get(unit.id) ?? null,
      childCount: _count.children,
      contentLayer: ["study_guide", "study_topic", "visual_extraction"].includes(unit.unitType) ? "derived" : "original",
    })),
    page,
    pageSize: take,
    totalDocumentUnits: orderedUnits.length,
    totalPages: Math.ceil(totalUnits / take),
    totalUnits,
  };
}
