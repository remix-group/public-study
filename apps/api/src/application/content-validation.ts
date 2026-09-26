import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { access, readFile, readdir } from "node:fs/promises";
import { join, relative, resolve } from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export type SourceVerificationPolicy = "local_only" | "local_then_official_url";
export type ValidationDecision = "accepted" | "review_required";

export type ValidationCandidate = {
  id: string;
  documentId: string;
  number: string;
  anchor: string;
  citation: string;
  content: string;
  versionIsCurrent: boolean | null;
  parentProvisionId: string | null;
  order?: number;
};

export type AuthoritativeSource = { kind: "local_file" | "official_url"; label: string; text: string };
export type ProvisionValidation = {
  provisionId: string;
  decision: ValidationDecision;
  reasons: string[];
};
export type ContentValidationReport = {
  decision: ValidationDecision;
  source: { kind: AuthoritativeSource["kind"]; label: string } | null;
  provisions: ProvisionValidation[];
};

export interface AuthoritativeSourceResolver {
  resolve(input: { originalFileKey: string | null; sourceHash?: string | null; officialUrl: string; policy: SourceVerificationPolicy }): Promise<AuthoritativeSource | null>;
}

/**
 * This is deliberately a gate, not an approver. It compares the complete
 * requested document against its primary source and reports parsing defects.
 */
export class ContentValidationAgent {
  constructor(private readonly sourceResolver: AuthoritativeSourceResolver) {}

  async validate(input: {
    document: { originalFileKey: string | null; sourceHash?: string | null; officialUrl: string };
    provisions: ValidationCandidate[];
    allProvisionKeys: Array<{ id: string; documentId: string; number: string; anchor: string; content: string; parentProvisionId: string | null }>;
    policy: SourceVerificationPolicy;
  }): Promise<ContentValidationReport> {
    const source = await this.sourceResolver.resolve({ ...input.document, policy: input.policy });
    const provisions = input.provisions.map((provision) => validateProvision(provision, source, input.allProvisionKeys));
    return {
      decision: provisions.some(({ decision }) => decision === "accepted") ? "accepted" : "review_required",
      source: source ? { kind: source.kind, label: source.label } : null,
      provisions,
    };
  }
}

function normalize(value: string) {
  return value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export function validateProvision(
  provision: ValidationCandidate,
  source: AuthoritativeSource | null,
  allProvisionKeys: Array<{ id: string; documentId: string; number: string; anchor: string; content: string; parentProvisionId: string | null }> = [],
): ProvisionValidation {
  const reasons: string[] = [];
  // Statuses are intentionally not a criterion: this agent is the evidence gate
  // for records that are still pending because of the historical import.
  if (provision.versionIsCurrent === false) reasons.push("La unidad pertenece a una versión que no es la actual.");
  if (!provision.number.trim() || !provision.content.trim()) reasons.push("La unidad carece de número o contenido y revela un fallo de parsing.");
  if (!provision.anchor.trim()) reasons.push("La unidad carece de anchor estable y revela un fallo de estructura.");
  if (/\uFFFD|\u0000/.test(provision.content)) reasons.push("El texto contiene caracteres anómalos propios de una extracción u OCR defectuoso.");
  if (typeof provision.order === "number" && provision.order < 0) reasons.push("El orden de la unidad es inválido.");
  const sameNumber = allProvisionKeys.filter((item) => item.id !== provision.id && item.number === provision.number && item.documentId === provision.documentId);
  if (sameNumber.length) reasons.push("Hay otra unidad con el mismo número en el documento; la estructura es ambigua.");
  const sameAnchor = allProvisionKeys.filter((item) => item.id !== provision.id && item.anchor === provision.anchor && item.documentId === provision.documentId);
  if (sameAnchor.length) reasons.push("Hay otra unidad con el mismo anchor en el documento; la estructura es ambigua.");
  if (provision.parentProvisionId && !allProvisionKeys.some((item) => item.id === provision.parentProvisionId && item.documentId === provision.documentId)) {
    reasons.push("La unidad apunta a una unidad superior inexistente o perteneciente a otro documento.");
  }
  const duplicateText = allProvisionKeys.filter((item) => item.id !== provision.id && normalize(item.content) === normalize(provision.content));
  if (duplicateText.length) reasons.push("El contenido está duplicado en otra unidad de la base de datos.");
  if (!source) reasons.push("No fue posible recuperar una fuente primaria local ni oficial para esta generación.");
  else if (!normalize(source.text).includes(normalize(provision.content))) {
    reasons.push("El texto almacenado no coincide de forma íntegra con la fuente primaria recuperada.");
  }
  return { provisionId: provision.id, decision: reasons.length ? "review_required" : "accepted", reasons };
}

export class RecoverableSourceResolver implements AuthoritativeSourceResolver {
  private readonly repoRoots = [resolve(process.cwd()), resolve(process.cwd(), "../..")];
  private readonly storageRoot = resolve(process.env.LEGAL_STORAGE_PATH ?? join(process.cwd(), "data", "legal-sources"));

  async resolve(input: { originalFileKey: string | null; sourceHash?: string | null; officialUrl: string; policy: SourceVerificationPolicy }) {
    const local = input.originalFileKey ? await this.readLocal(input.originalFileKey) : null;
    if (local) return local;
    const recoveredByHash = input.sourceHash ? await this.findLocalPdfByHash(input.sourceHash) : null;
    if (recoveredByHash) return recoveredByHash;
    if (input.policy === "local_only") return null;
    return this.readOfficialUrl(input.officialUrl);
  }

  private async readLocal(storageKey: string): Promise<AuthoritativeSource | null> {
    const paths = [...this.repoRoots.map((root) => resolve(root, storageKey)), resolve(this.storageRoot, storageKey)];
    for (const path of paths) {
      if (![...this.repoRoots, this.storageRoot].some((root) => path === root || path.startsWith(`${root}/`))) continue;
      try {
        await access(path);
        const text = path.toLowerCase().endsWith(".pdf")
          ? (await execFileAsync("pdftotext", ["-layout", "-enc", "UTF-8", path, "-"])).stdout
          : await readFile(path, "utf8");
        return { kind: "local_file", label: relative(this.repoRoots[0], path), text };
      } catch {
        // Try the next configured, recoverable location. A source mismatch is a review outcome, not a server error.
      }
    }
    return null;
  }

  private async findLocalPdfByHash(sourceHash: string): Promise<AuthoritativeSource | null> {
    if (!/^[a-f0-9]{64}$/i.test(sourceHash)) return null;
    const roots = [...this.repoRoots.map((root) => join(root, "data", "legal-sources", "incoming")), this.storageRoot];
    for (const root of roots) {
      const match = await this.findPdf(root, sourceHash.toLowerCase());
      if (!match) continue;
      const text = (await execFileAsync("pdftotext", ["-layout", "-enc", "UTF-8", match, "-"])).stdout;
      return { kind: "local_file", label: relative(this.repoRoots[0], match), text };
    }
    return null;
  }

  private async findPdf(directory: string, sourceHash: string): Promise<string | null> {
    const entries = await readdir(directory, { withFileTypes: true }).catch(() => []);
    for (const entry of entries) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) {
        const nested = await this.findPdf(path, sourceHash);
        if (nested) return nested;
      } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".pdf")) {
        const bytes = await readFile(path);
        if (createHash("sha256").update(bytes).digest("hex") === sourceHash) return path;
      }
    }
    return null;
  }

  private async readOfficialUrl(url: string): Promise<AuthoritativeSource | null> {
    let parsed: URL;
    try { parsed = new URL(url); } catch { return null; }
    if (parsed.protocol !== "https:") return null;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8_000);
    try {
      const response = await fetch(parsed, { signal: controller.signal, redirect: "error" });
      if (!response.ok) return null;
      const type = response.headers.get("content-type") ?? "";
      if (!type.includes("text/")) return null; // PDFs must be registered locally to retain reproducible page evidence.
      const body = await response.text();
      return { kind: "official_url", label: parsed.toString(), text: body.replace(/<[^>]*>/g, " ") };
    } catch { return null; } finally { clearTimeout(timeout); }
  }
}
