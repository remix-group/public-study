export interface GeneratedQuestion {
  provisionId: string;
  objectiveId: string;
  stem: string;
  options: Array<{ key: "A" | "B" | "C" | "D"; text: string }>;
  correctAnswer: "A" | "B" | "C" | "D";
  explanation: string;
  difficulty: number;
  confidence: number;
}

export interface StudyMaterialInput {
  objectives: Array<{ id: string; name: string; description: string }>;
  provisions: Array<{ id: string; citation: string; content: string }>;
  questionsPerProvision: number;
}

export interface AiProvider {
  readonly name: string;
  generateStudyMaterial(input: StudyMaterialInput): Promise<GeneratedQuestion[]>;
}

export class AiProviderConfigurationError extends Error {}
export class AiProviderResponseError extends Error {}
