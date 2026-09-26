import { describe, expect, it } from "vitest";
import { ContentValidationAgent, type AuthoritativeSourceResolver } from "./content-validation.js";

const candidate = { id: "unit-1", documentId: "document-1", number: "Artículo 1", anchor: "articulo-1", citation: "Ley, artículo 1", content: "La regla jurídica aplicable exige una fuente verificable.", versionIsCurrent: true, parentProvisionId: null, order: 1 };
const resolver: AuthoritativeSourceResolver = { resolve: async () => ({ kind: "local_file", label: "source.pdf", text: `Preámbulo. ${candidate.content} Fin.` }) };

describe("ContentValidationAgent", () => {
  it("admits pending text when it is found in the primary source", async () => {
    const result = await new ContentValidationAgent(resolver).validate({ document: { originalFileKey: "source.pdf", officialUrl: "https://www.dian.gov.co" }, provisions: [candidate], allProvisionKeys: [], policy: "local_only" });
    expect(result.decision).toBe("accepted");
    expect(result.provisions[0]).toMatchObject({ decision: "accepted", reasons: [] });
  });

  it("sends altered database text to review without changing it", async () => {
    const result = await new ContentValidationAgent(resolver).validate({ document: { originalFileKey: "source.pdf", officialUrl: "https://www.dian.gov.co" }, provisions: [{ ...candidate, content: "Texto alterado en la base de datos." }], allProvisionKeys: [], policy: "local_only" });
    expect(result.decision).toBe("review_required");
    expect(result.provisions[0]?.reasons.join(" ")).toContain("no coincide");
  });

  it("flags duplicate units found in the complete database inventory", async () => {
    const result = await new ContentValidationAgent(resolver).validate({
      document: { originalFileKey: "source.pdf", officialUrl: "https://www.dian.gov.co" }, provisions: [candidate],
      allProvisionKeys: [{ id: "unit-2", documentId: candidate.documentId, number: candidate.number, anchor: "articulo-1-copia", content: "Otro texto", parentProvisionId: null }], policy: "local_only",
    });
    expect(result.provisions[0]?.decision).toBe("review_required");
    expect(result.provisions[0]?.reasons.join(" ")).toContain("mismo número");
  });
});
