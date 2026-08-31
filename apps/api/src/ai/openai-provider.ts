import { z } from "zod";
import { AiProviderConfigurationError, AiProviderResponseError, type AiProvider, type GeneratedQuestion, type StudyMaterialInput } from "./provider.js";

const generatedQuestion = z.object({
  provisionId: z.string(), objectiveId: z.string(), stem: z.string().min(15),
  options: z.array(z.object({ key: z.enum(["A", "B", "C", "D"]), text: z.string().min(1) })).length(4),
  correctAnswer: z.enum(["A", "B", "C", "D"]), explanation: z.string().min(15),
  difficulty: z.number().min(0).max(1), confidence: z.number().min(0).max(1),
});

const responseSchema = {
  type: "object",
  properties: {
    questions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          provisionId: { type: "string" }, objectiveId: { type: "string" }, stem: { type: "string" },
          options: { type: "array", minItems: 4, maxItems: 4, items: { type: "object", properties: { key: { type: "string", enum: ["A", "B", "C", "D"] }, text: { type: "string" } }, required: ["key", "text"], additionalProperties: false } },
          correctAnswer: { type: "string", enum: ["A", "B", "C", "D"] }, explanation: { type: "string" },
          difficulty: { type: "number", minimum: 0, maximum: 1 }, confidence: { type: "number", minimum: 0, maximum: 1 },
        },
        required: ["provisionId", "objectiveId", "stem", "options", "correctAnswer", "explanation", "difficulty", "confidence"], additionalProperties: false,
      },
    },
  },
  required: ["questions"], additionalProperties: false,
} as const;

export class OpenAiProvider implements AiProvider {
  readonly name = "openai";
  constructor(private readonly apiKey = process.env.OPENAI_API_KEY, private readonly model = process.env.OPENAI_MODEL ?? "gpt-5.4") {}

  async generateStudyMaterial(input: StudyMaterialInput): Promise<GeneratedQuestion[]> {
    if (!this.apiKey) throw new AiProviderConfigurationError("Configura OPENAI_API_KEY para generar material automáticamente");
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { Authorization: `Bearer ${this.apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: this.model,
        store: false,
        instructions: "Eres un diseñador de evaluación para el concurso DIAN. Usa exclusivamente el texto jurídico entregado. No inventes reglas, excepciones, términos ni citas. Cada pregunta debe poder resolverse literalmente desde su provisionId. Crea distractores plausibles pero inequívocamente falsos según esa fuente. Escribe en español colombiano claro.",
        input: JSON.stringify(input),
        text: { format: { type: "json_schema", name: "dian_study_material", strict: true, schema: responseSchema } },
      }),
    });
    if (!response.ok) throw new AiProviderResponseError(`OpenAI respondió ${response.status}: ${(await response.text()).slice(0, 300)}`);
    const payload = await response.json() as { output?: Array<{ content?: Array<{ type?: string; text?: string }> }> };
    const outputText = payload.output?.flatMap((item) => item.content ?? []).find((item) => item.type === "output_text")?.text;
    if (!outputText) throw new AiProviderResponseError("OpenAI no devolvió contenido estructurado");
    const parsed = z.object({ questions: z.array(generatedQuestion) }).safeParse(JSON.parse(outputText));
    if (!parsed.success) throw new AiProviderResponseError("La respuesta del proveedor no cumple el contrato de generación");
    return parsed.data.questions;
  }
}
