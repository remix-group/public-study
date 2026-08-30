import { describe, expect, it } from "vitest";
import { difficultyLabel, masteryPercent } from "./format";

describe("learning presentation", () => {
  it("clamps and formats mastery", () => {
    expect(masteryPercent(0.428)).toBe(43);
    expect(masteryPercent(2)).toBe(100);
    expect(masteryPercent(-1)).toBe(0);
  });

  it("labels question difficulty", () => {
    expect(difficultyLabel(0.3)).toBe("Fundamental");
    expect(difficultyLabel(0.5)).toBe("Intermedia");
    expect(difficultyLabel(0.9)).toBe("Avanzada");
  });
});
