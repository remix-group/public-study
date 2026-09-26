import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
try {
  const claims = await prisma.institutionalClaim.findMany({ select: { id: true, sourceProvisionId: true } });
  const relations = await prisma.institutionalRelation.findMany({ select: { id: true, sourceProvisionId: true } });
  const provisionIds = [...claims, ...relations].map((item) => item.sourceProvisionId);
  const provisions = await prisma.legalProvision.findMany({
    where: { id: { in: provisionIds } },
    select: { id: true, validationStatus: true, editorialStatus: true, sourceReferenceId: true, pageStart: true, pageEnd: true },
  });
  const byId = new Map(provisions.map((item) => [item.id, item]));
  const verified = (id: string) => {
    const provision = byId.get(id);
    return Boolean(provision?.sourceReferenceId && provision.pageStart && provision.pageEnd && provision.validationStatus === "approved" && provision.editorialStatus === "published");
  };
  const unverifiedClaimIds = claims.filter((item) => !verified(item.sourceProvisionId)).map((item) => item.id);
  const unverifiedRelationIds = relations.filter((item) => !verified(item.sourceProvisionId)).map((item) => item.id);
  await prisma.$transaction(async (tx) => {
    await tx.institutionalEntity.updateMany({ data: { status: "pending_review" } });
    if (unverifiedClaimIds.length > 0) {
      await tx.institutionalClaim.updateMany({ where: { id: { in: unverifiedClaimIds } }, data: { status: "pending_review", confidence: "probable" } });
    }
    if (unverifiedRelationIds.length > 0) {
      await tx.institutionalRelation.updateMany({ where: { id: { in: unverifiedRelationIds } }, data: { status: "pending_review", confidence: "probable" } });
    }
  });
  console.log({ quarantinedUnverifiedClaims: unverifiedClaimIds.length, quarantinedUnverifiedRelations: unverifiedRelationIds.length });
} finally {
  await prisma.$disconnect();
}
