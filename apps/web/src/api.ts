import type { AttemptResponse, AuthStudent, Dashboard, EditorialCatalog, EditorialQuestion, EditorialQuestionInput, KnowledgeCatalog, LegalDocumentView, LegalUnitView, LegalVersionView, NextQuestionResponse, SessionStartResponse, SessionSummary, StudyGuide, TopicKnowledgeGraph } from "./types";

const COMPETENCY_ID = "competency-cobro-coactivo";

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const isBinary = init?.body instanceof Blob || init?.body instanceof ArrayBuffer;
  const response = await fetch(url, {
    ...init,
    headers: { ...(isBinary ? {} : { "Content-Type": "application/json" }), ...init?.headers },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null) as { error?: string } | null;
    throw new Error(body?.error ?? "No fue posible comunicarse con el servidor.");
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export function startSession(mode: "LEARN" | "PRACTICE" | "ASSESS" | "REVIEW" | "CASE" = "PRACTICE", focusObjectiveId?: string) {
  return request<SessionStartResponse>("/api/sessions", {
    method: "POST",
    body: JSON.stringify({ competencyId: COMPETENCY_ID, mode, focusObjectiveId }),
  });
}

export function getNextQuestion(sessionId: string, objectiveId?: string) {
  const query = objectiveId ? `?objectiveId=${encodeURIComponent(objectiveId)}` : "";
  return request<NextQuestionResponse | null>(`/api/sessions/${sessionId}/next${query}`);
}

export function submitAttempt(input: {
  sessionId: string;
  questionId: string;
  answer: string;
  timeSpentMs: number;
  confidence: number;
}) {
  return request<AttemptResponse>("/api/sessions/attempt", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function finishSession(sessionId: string) {
  return request<SessionSummary>(`/api/sessions/${sessionId}/finish`, {
    method: "POST", body: JSON.stringify({}),
  });
}

export function getDashboard() {
  return request<Dashboard>("/api/learning/dashboard");
}
export function getStudyGuide(objectiveId: string) { return request<StudyGuide>(`/api/learning/objectives/${objectiveId}/guide`); }
export function getTopicKnowledgeGraph(topicId: string) { return request<TopicKnowledgeGraph>(`/api/learning/topics/${topicId}/graph`); }

export function getCurrentStudent() { return request<{ student: AuthStudent }>("/api/auth/me"); }
export function login(email: string, password: string) {
  return request<{ student: AuthStudent }>("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
}
export function register(name: string, email: string, password: string) {
  return request<{ student: AuthStudent }>("/api/auth/register", { method: "POST", body: JSON.stringify({ name, email, password }) });
}
export function logout() { return request<void>("/api/auth/logout", { method: "POST", body: JSON.stringify({}) }); }
export function getEditorialCatalog() { return request<EditorialCatalog>("/api/editorial/catalog"); }
export function createEditorialQuestion(input: EditorialQuestionInput) {
  return request<EditorialQuestion>("/api/editorial/questions", { method: "POST", body: JSON.stringify(input) });
}
export function setQuestionPublication(id: string, publish: boolean) {
  return request<EditorialQuestion>(`/api/editorial/questions/${id}/publication`, { method: "POST", body: JSON.stringify({ publish }) });
}
export function getKnowledgeCatalog() { return request<KnowledgeCatalog>("/api/knowledge/catalog"); }
export function createKnowledgeDocument(input: object) { return request<LegalDocumentView>("/api/knowledge/documents", { method: "POST", body: JSON.stringify(input) }); }
export function transitionKnowledgeDocument(id: string, target: string) { return request<LegalDocumentView>(`/api/knowledge/documents/${id}/transition`, { method: "POST", body: JSON.stringify({ target }) }); }
export function createKnowledgeVersion(input: object) { return request<LegalVersionView>("/api/knowledge/versions", { method: "POST", body: JSON.stringify(input) }); }
export function createKnowledgeUnit(input: object) { return request<LegalUnitView>("/api/knowledge/units", { method: "POST", body: JSON.stringify(input) }); }
export function reviewKnowledgeUnit(id: string, decision: "approved" | "rejected") { return request<LegalUnitView>(`/api/knowledge/units/${id}/review`, { method: "POST", body: JSON.stringify({ decision }) }); }
export function createKnowledgeEvidence(input: object) { return request(`/api/knowledge/evidences`, { method: "POST", body: JSON.stringify(input) }); }
export function createKnowledgeRelation(input: object) { return request(`/api/knowledge/relations`, { method: "POST", body: JSON.stringify(input) }); }
export function ingestKnowledgePdf(documentId: string, file: File, versionLabel: string) {
  return request<{ documentId: string; versionId: string; hash: string; unitsCreated: number; pipelineStatus: string }>(`/api/knowledge/documents/${documentId}/ingest`, {
    method: "POST", headers: { "Content-Type": "application/pdf", "X-Version-Label": versionLabel }, body: file,
  });
}
export function generateKnowledgeMaterial(documentId: string) {
  return request<{ provider: string; unitsApproved: number; evidencesReady: number; questionsCreated: number; questionsSkipped: number }>(`/api/knowledge/documents/${documentId}/generate`, { method: "POST", body: JSON.stringify({}) });
}
export function getManualGenerationPrompt(documentId: string) {
  return request<{ documentId: string; documentTitle: string; prompt: string; provisionCount: number; objectiveCount: number }>(`/api/knowledge/documents/${documentId}/generation-prompt`);
}
export function importKnowledgeMaterial(documentId: string, generatedJson: string) {
  let body: unknown;
  try { body = JSON.parse(generatedJson); } catch { throw new Error("El contenido pegado no es JSON válido."); }
  return request<{ provider: string; unitsApproved: number; evidencesReady: number; questionsCreated: number; questionsSkipped: number }>(`/api/knowledge/documents/${documentId}/import-material`, { method: "POST", body: JSON.stringify(body) });
}
