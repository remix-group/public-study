import { describe, expect, it } from "vitest";
import { buildTopicKnowledgeGraph } from "./topic-knowledge-graph.js";

const document = { id: "et", title: "Estatuto Tributario", authority: "DIAN", documentType: "statute", officialUrl: "https://example.test/et", status: "vigente" };
const provision = (id: string, number: string) => ({ id, number, title: `Regla ${number}`, content: "Texto jurídico", citation: `ET, ${number}`, status: "vigente", validationStatus: "approved", editorialStatus: "published", document });
const link = (legalProvision: ReturnType<typeof provision>) => ({ evidence: { provision: legalProvision } });

describe("topic knowledge graph", () => {
  it("derives a navigable graph from learning evidence and legal relations", () => {
    const article823 = provision("823", "Artículo 823");
    const article826 = provision("826", "Artículo 826");
    const graph = buildTopicKnowledgeGraph({
      id: "topic", name: "Fundamentos", description: "Inicio del cobro",
      block: { name: "Cobro", competency: { name: "Cobro Coactivo" } },
      learningObjectives: [{
        id: "objective", name: "Comprender el alcance", description: "Reconocer la regla",
        concepts: [{ id: "concept", name: "Deuda fiscal", description: "Obligación exigible", evidences: [link(article823)] }],
        questions: [{ evidences: [link(article823)] }], cases: [],
      }],
    }, [{ id: "relation", type: "REFERENCES", description: "Continúa el procedimiento", sourceProvision: article823, targetProvision: article826 }]);

    expect(graph.summary).toEqual({ objectives: 1, concepts: 1, provisions: 2, documents: 1, legalRelations: 1, directProvisions: 1 });
    expect(graph.nodes.some((node) => node.id === "provision:826")).toBe(true);
    expect(graph.edges.some((edge) => edge.type === "REFERENCES" && edge.label === "referencia")).toBe(true);
    expect(graph.edges.filter((edge) => edge.source === "objective:objective" && edge.target === "provision:823")).toHaveLength(1);
  });

  it("excludes unreviewed legal provisions", () => {
    const draft = { ...provision("draft", "Artículo borrador"), validationStatus: "pending", editorialStatus: "draft" };
    const graph = buildTopicKnowledgeGraph({
      id: "topic", name: "Tema", description: "Descripción", block: { name: "Bloque", competency: { name: "Competencia" } },
      learningObjectives: [{ id: "objective", name: "Objetivo", description: "Descripción", concepts: [], questions: [{ evidences: [link(draft)] }], cases: [] }],
    }, []);
    expect(graph.nodes.some((node) => node.kind === "provision")).toBe(false);
    expect(graph.summary.directProvisions).toBe(0);
  });
});
