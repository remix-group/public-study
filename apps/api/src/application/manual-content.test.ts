import { describe, expect, it } from "vitest";
import { importedQuestionsSchema, manualImportProvider } from "./manual-content.js";

const validQuestion = { provisionId: "provision-1", objectiveId: "objective-1", stem: "¿Cuál es la regla jurídica aplicable al caso descrito?", options: [{ key: "A", text: "Primera" }, { key: "B", text: "Segunda" }, { key: "C", text: "Tercera" }, { key: "D", text: "Cuarta" }], correctAnswer: "A", explanation: "La primera opción reproduce la regla de la evidencia.", difficulty: 0.5, confidence: 0.9 };

describe("manual ChatGPT import", () => {
  it("accepts the strict interchange format", () => {
    expect(importedQuestionsSchema.parse({ questions: [validQuestion] }).questions).toHaveLength(1);
  });

  it("rejects incomplete model output", () => {
    expect(() => importedQuestionsSchema.parse({ questions: [{ ...validQuestion, options: validQuestion.options.slice(0, 3) }] })).toThrow();
  });

  it("adapts imported questions to the provider contract", async () => {
    const parsed = importedQuestionsSchema.parse({ questions: [validQuestion] });
    expect(await manualImportProvider(parsed.questions).generateStudyMaterial({ objectives: [], provisions: [], questionsPerProvision: 2 })).toEqual(parsed.questions);
  });
});
