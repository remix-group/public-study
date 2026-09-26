import { describe, expect, it } from "vitest";
import { buildInstitutionalMap } from "./institutional-map.js";

const provision = {
  id: "provision-1", number: "Artículo 1", title: "Competencia", content: "La entidad coordina la función.",
  citation: "Ley de prueba, artículo 1", status: "vigente", validationStatus: "pending", editorialStatus: "draft",
  document: { id: "document-1", title: "Ley de prueba", authority: "Congreso", officialUrl: "" },
};
const objective = { id: "objective-1", name: "Reconocer autoridades", topic: { id: "topic-1", name: "Instituciones" } };

describe("institutional map", () => {
  it("keeps functional and hierarchical relations separate and preserves traceability", () => {
    const map = buildInstitutionalMap([
      {
        id: "entity-a", slug: "entidad-a", officialName: "Entidad A", aliases: ["EA"], entityType: "unit", level: "national", description: "A", status: "confirmed",
        claims: [{ id: "claim-1", claimType: "function", statement: "Coordina.", status: "pending_review", confidence: "probable", sourceProvisionId: provision.id, objectiveId: objective.id, sourceProvision: provision, objective }],
        outgoingRelations: [{ id: "relation-1", sourceEntityId: "entity-a", targetEntityId: "entity-b", relationType: "coordination", label: "coordina con", description: "Relación funcional", hierarchical: false, status: "pending_review", confidence: "probable", sourceProvisionId: provision.id, objectiveId: objective.id, targetEntity: { officialName: "Entidad B" }, sourceProvision: provision, objective }],
      },
      { id: "entity-b", slug: "entidad-b", officialName: "Entidad B", aliases: [], entityType: "unit", level: null, description: "B", status: "confirmed", claims: [], outgoingRelations: [] },
    ]);

    expect(map.summary).toEqual({ entities: 2, claims: 1, relations: 1, hierarchicalRelations: 0, documents: 1, pendingReview: 2 });
    expect(map.relations[0]).toMatchObject({ type: "coordination", hierarchical: false, sourceProvisionId: "provision-1" });
    expect(map.sources[0]).toMatchObject({ provisionId: "provision-1", citation: "Ley de prueba, artículo 1", objective: { id: "objective-1" } });
  });
});
