import { describe, expect, it } from "vitest";
import { hashPassword, hashSessionToken, verifyPassword } from "./crypto.js";
import { readSessionCookie } from "./middleware.js";

describe("authentication primitives", () => {
  it("derives and verifies passwords without retaining plaintext", async () => {
    const hash = await hashPassword("UnaClaveSegura2026!");
    expect(hash).not.toContain("UnaClaveSegura2026!");
    expect(await verifyPassword("UnaClaveSegura2026!", hash)).toBe(true);
    expect(await verifyPassword("incorrecta", hash)).toBe(false);
  });

  it("hashes session tokens and reads the named cookie", () => {
    expect(hashSessionToken("token")).not.toBe("token");
    expect(readSessionCookie("theme=dark; dian_session=abc123; locale=es")).toBe("abc123");
  });
});
