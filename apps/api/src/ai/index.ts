import type { AiProvider } from "./provider.js";
import { OpenAiProvider } from "./openai-provider.js";

export * from "./provider.js";

export function getAiProvider(): AiProvider {
  const provider = process.env.AI_PROVIDER ?? "openai";
  if (provider === "openai") return new OpenAiProvider();
  throw new Error(`Proveedor de IA no soportado: ${provider}`);
}
