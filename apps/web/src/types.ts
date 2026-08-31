export interface LearningObjective {
  id: string;
  name: string;
  description: string;
  order: number;
}

export interface Topic {
  id: string;
  name: string;
  description: string;
  learningObjectives: LearningObjective[];
}

export interface StudySession {
  id: string;
  startedAt: string;
  totalQuestions: number;
  correctAnswers: number;
}

export interface SessionStartResponse {
  session: StudySession;
  competency: { id: string; name: string; description: string; topics: Topic[] };
}

export interface QuestionOption { key: string; text: string }
export interface Question {
  id: string;
  objectiveId: string;
  type: string;
  difficulty: number;
  stem: string;
  options: QuestionOption[] | null;
}

export interface EvidenceSnapshot {
  evidenceId: string;
  provisionId: string;
  citation: string;
  content: string;
}

export interface AttemptResponse {
  isCorrect: boolean;
  explanation: string;
  evidence: EvidenceSnapshot[];
  mastery: number;
  masteryDelta: number;
  nextReviewDate: string;
  mistakes: Array<{ id: string; type: string; description: string }>;
}

export interface NextQuestionResponse { question: Question; objective: LearningObjective }
export interface SessionSummary {
  session: StudySession & { finishedAt: string };
  accuracy: number;
  attempts: Array<{ id: string; result: string; answer: string; question: string; objective: string }>;
}
export interface Dashboard {
  student: { id: string; name: string };
  overallMastery: number;
  objectives: Array<{ objectiveId: string; objective: string; description: string; topic: string; mastery: number; totalAttempts: number; retention: number; questionCount: number }>;
  recommendedObjective: { objectiveId: string; objective: string; description: string; topic: string; mastery: number; totalAttempts: number; retention: number; questionCount: number } | null;
  pendingReviews: Array<{ objectiveId: string; objective: string; scheduledAt: string; due: boolean }>;
  recentSessions: StudySession[];
}
export interface StudyGuide {
  objective: { id: string; name: string; description: string };
  topic: { id: string; name: string };
  competency: { id: string; name: string };
  keyConcepts: string[];
  evidences: Array<{ id: string; citation: string; content: string; provisionNumber: string; provisionTitle: string; documentTitle: string; officialUrl: string }>;
  questionCount: number;
}
export interface AuthStudent { id: string; name: string; email: string; role: "student" | "editor" }
export interface EditorialQuestion {
  id: string; objectiveId: string; stem: string; difficulty: number; options: QuestionOption[];
  correctAnswer: string; explanation: string; editorialStatus: "draft" | "published" | "archived";
  reviewedBy: string | null; reviewedAt: string | null; objective: LearningObjective;
  evidences: Array<{ evidence: EditorialEvidence }>;
}
export interface EditorialEvidence { id: string; provisionId: string; citation: string; content: string; provision: { number: string; title: string } }
export interface EditorialCatalog {
  questions: EditorialQuestion[];
  objectives: Array<LearningObjective & { topic: { name: string } }>;
  evidences: EditorialEvidence[];
}
export interface EditorialQuestionInput {
  objectiveId: string; difficulty: number; stem: string; options: QuestionOption[];
  correctAnswer: string; explanation: string; evidenceIds: string[];
}
export interface LegalVersionView { id: string; documentId: string; label: string; effectiveFrom: string; effectiveUntil: string | null; status: string; isCurrent: boolean }
export interface LegalUnitView {
  id: string; documentId: string; versionId: string | null; unitType: string; anchor: string; order: number;
  number: string; title: string; content: string; citation: string; validationStatus: string; editorialStatus: string;
  evidences: Array<{ id: string; citation: string; content: string }>;
}
export interface LegalDocumentView {
  id: string; title: string; authority: string; documentType: string; officialUrl: string; pipelineStatus: string; contentHash: string | null;
  effectiveFrom: string; status: string; versions: LegalVersionView[]; provisions: LegalUnitView[];
}
export interface KnowledgeCatalog {
  documents: LegalDocumentView[];
  relations: Array<{ id: string; type: string; description: string; sourceProvision: LegalUnitView; targetProvision: LegalUnitView }>;
  pipelineStates: string[];
}
