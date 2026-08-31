import { describe, expect, it } from "vitest";
import { normalizeExtractedText, parseLegalUnits } from "./legal-ingestion.js";

describe("legal PDF parsing", () => {
  it("normalizes line wrapping without joining independent paragraphs", () => {
    expect(normalizeExtractedText("obliga-\nciones\r\n\r\nTexto")).toBe("obligaciones\n\nTexto");
  });

  it("extracts numbered articles as reviewable legal units", () => {
    const units = parseLegalUnits(`ENCABEZADO\nARTÍCULO 1. Objeto.\nEsta norma regula el proceso.\n\nARTICULO 2-1. Competencia\nCorresponde a la DIAN.`);
    expect(units).toHaveLength(2);
    expect(units[0]).toMatchObject({ number: "Artículo 1", anchor: "articulo-1", title: "Objeto." });
    expect(units[1].content).toContain("Corresponde a la DIAN");
  });
});
