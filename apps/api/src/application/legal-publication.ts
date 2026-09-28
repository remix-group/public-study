import type { Prisma } from "@dian-study/infrastructure";

/**
 * A learning activity can only be presented as assessed legal content when all
 * of its evidence points to a reviewed, current, official legal source.  This
 * is deliberately stricter than merely having an Evidence record: evidence is
 * a traceability link, not an editorial approval.
 */
export const publishableProvisionWhere = {
  validationStatus: "approved",
  editorialStatus: "published",
  status: "vigente",
  document: {
    pipelineStatus: "PUBLISHED",
    status: "vigente",
    officialUrl: { not: "" },
    effectiveFrom: { not: null },
  },
} satisfies Prisma.LegalProvisionWhereInput;

export const publishableEvidenceWhere = {
  evidence: { provision: publishableProvisionWhere },
} satisfies Prisma.QuestionEvidenceWhereInput;

export const publishableActivityEvidenceWhere = {
  some: publishableEvidenceWhere,
  every: publishableEvidenceWhere,
};

export function isPublishableProvision(provision: {
  validationStatus: string;
  editorialStatus: string;
  status: string;
  document: { pipelineStatus: string; status: string; officialUrl: string; effectiveFrom: Date | null };
}) {
  return provision.validationStatus === "approved"
    && provision.editorialStatus === "published"
    && provision.status === "vigente"
    && provision.document.pipelineStatus === "PUBLISHED"
    && provision.document.status === "vigente"
    && Boolean(provision.document.officialUrl.trim())
    && provision.document.effectiveFrom !== null;
}
