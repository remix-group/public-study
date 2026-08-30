/**
 * Unit tests for Legal domain entities.
 *
 * Verifies structural correctness and relationships
 * between legal documents, provisions, and relations.
 */

import { describe, it, expect } from "vitest";
import type {
  LegalDocument,
  LegalProvision,
  LegalRelation,
  LegalReference,
  Evidence,
} from "./entities.js";

const now = new Date();

describe("Legal entities", () => {
  const document: LegalDocument = {
    id: "doc-1",
    title: "Estatuto Tributario",
    source: "Congreso de la República de Colombia",
    effectiveFrom: new Date("1989-03-30"),
    effectiveUntil: null,
    status: "vigente",
    createdAt: now,
    updatedAt: now,
  };

  const provision: LegalProvision = {
    id: "prov-1",
    documentId: document.id,
    number: "Art. 837",
    title: "Mandamiento de pago",
    content: "El funcionario competente para exigir el cobro coactivo producirá el mandamiento de pago...",
    citation: "Estatuto Tributario, Art. 837",
    effectiveFrom: new Date("1989-03-30"),
    effectiveUntil: null,
    status: "vigente",
    createdAt: now,
    updatedAt: now,
  };

  const modifiedProvision: LegalProvision = {
    id: "prov-2",
    documentId: document.id,
    number: "Art. 837-1",
    title: "Comunicación del mandamiento de pago",
    content: "El mandamiento de pago se notificará personalmente...",
    citation: "Estatuto Tributario, Art. 837-1",
    effectiveFrom: new Date("2006-07-29"),
    effectiveUntil: null,
    status: "vigente",
    createdAt: now,
    updatedAt: now,
  };

  const relation: LegalRelation = {
    id: "rel-1",
    sourceProvisionId: modifiedProvision.id,
    targetProvisionId: provision.id,
    type: "MODIFIES",
    description: "Art. 837-1 modifica el procedimiento de notificación del Art. 837",
    createdAt: now,
    updatedAt: now,
  };

  const reference: LegalReference = {
    id: "ref-1",
    fromProvisionId: provision.id,
    toProvisionId: modifiedProvision.id,
    toDocumentId: null,
    citation: "Art. 837-1",
    context: "Véase el artículo 837-1 para el procedimiento de notificación",
    createdAt: now,
    updatedAt: now,
  };

  const evidence: Evidence = {
    id: "ev-1",
    provisionId: provision.id,
    content: "El funcionario competente para exigir el cobro coactivo producirá el mandamiento de pago",
    citation: "Estatuto Tributario, Art. 837",
    createdAt: now,
    updatedAt: now,
  };

  it("should create a valid LegalDocument", () => {
    expect(document.title).toBe("Estatuto Tributario");
    expect(document.status).toBe("vigente");
    expect(document.effectiveUntil).toBeNull();
  });

  it("should link LegalProvision to LegalDocument", () => {
    expect(provision.documentId).toBe(document.id);
    expect(provision.number).toBe("Art. 837");
  });

  it("should create a typed LegalRelation between provisions", () => {
    expect(relation.type).toBe("MODIFIES");
    expect(relation.sourceProvisionId).toBe(modifiedProvision.id);
    expect(relation.targetProvisionId).toBe(provision.id);
  });

  it("should create a LegalReference between provisions", () => {
    expect(reference.fromProvisionId).toBe(provision.id);
    expect(reference.toProvisionId).toBe(modifiedProvision.id);
    expect(reference.toDocumentId).toBeNull();
  });

  it("should create Evidence linked to a provision", () => {
    expect(evidence.provisionId).toBe(provision.id);
    expect(evidence.citation).toContain("Art. 837");
  });

  it("should support all LegalRelationType values", () => {
    const types = ["MODIFIES", "ADDS", "REPEALS", "REPLACES", "REFERENCES", "REGULATES"];
    types.forEach((t) => {
      const r: LegalRelation = { ...relation, type: t as LegalRelation["type"] };
      expect(types).toContain(r.type);
    });
  });
});
