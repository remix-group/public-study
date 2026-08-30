import type { AttemptResponse, AuthStudent, Dashboard, EditorialCatalog, EditorialQuestion, EditorialQuestionInput, NextQuestionResponse, SessionStartResponse, SessionSummary } from "./types";

const COMPETENCY_ID = "competency-cobro-coactivo";

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null) as { error?: string } | null;
    throw new Error(body?.error ?? "No fue posible comunicarse con el servidor.");
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export function startSession() {
  return request<SessionStartResponse>("/api/sessions", {
    method: "POST",
    body: JSON.stringify({ competencyId: COMPETENCY_ID }),
  });
}

export function getNextQuestion(sessionId: string) {
  return request<NextQuestionResponse | null>(`/api/sessions/${sessionId}/next`);
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
