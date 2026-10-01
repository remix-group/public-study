import { describe, expect, it } from "vitest";
import { sourcePresentation } from "./GuidedStudy";
import type { StudyGuide } from "./types";

function evidence(overrides: Partial<StudyGuide["evidences"][number]>): StudyGuide["evidences"][number] {
  return {
    id: "evidence-1",
    citation: "Constitución Política, artículo 1",
    content: "Artículo 1. Colombia es un Estado social de derecho, fundado en el respeto de la dignidad humana y en la prevalencia del interés general.",
    documentId: "constitution",
    provisionId: "article-1",
    provisionNumber: "Artículo 1",
    provisionTitle: "Fundamentos del Estado social de derecho",
    documentTitle: "Constitución Política de Colombia",
    documentType: "constitution",
    unitType: "article",
    officialUrl: "https://www.funcionpublica.gov.co/",
    validationStatus: "approved",
    editorialStatus: "published",
    status: "reviewed",
    sourceKind: "primary",
    ...overrides,
  };
}

describe("source presentation", () => {
  it("uses the provision number and its own concise title", () => {
    expect(sourcePresentation(evidence({})).title).toBe("Artículo 1 · Fundamentos del Estado social de derecho");
  });

  it("truncates an overlong heading instead of assigning a title from another topic", () => {
    const title = sourcePresentation(evidence({ provisionTitle: "Son fines esenciales del Estado servir a la comunidad, promover la prosperidad general y garantizar la efectividad de los principios y derechos" })).title;
    expect(title).toMatch(/^Artículo 1 · Son fines esenciales del Estado/);
    expect(title).not.toContain("devolución");
  });
});
