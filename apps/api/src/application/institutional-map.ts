import { prisma } from "@dian-study/infrastructure";

interface InstitutionalMapRecord {
  id: string;
  slug: string;
  officialName: string;
  aliases: unknown;
  entityType: string;
  level: string | null;
  description: string;
  status: string;
  claims: Array<{
    id: string; claimType: string; statement: string; status: string; confidence: string;
    sourceProvisionId: string; objectiveId: string | null;
    sourceProvision: SourceProvision;
    objective: ObjectiveLink | null;
  }>;
  outgoingRelations: Array<{
    id: string; sourceEntityId: string; targetEntityId: string; relationType: string; label: string;
    description: string; hierarchical: boolean; status: string; confidence: string;
    sourceProvisionId: string; objectiveId: string | null;
    targetEntity: { officialName: string };
    sourceProvision: SourceProvision;
    objective: ObjectiveLink | null;
  }>;
}

interface SourceProvision {
  id: string; number: string; title: string; content: string; citation: string; status: string;
  validationStatus: string; editorialStatus: string;
  document: { id: string; title: string; authority: string; officialUrl: string };
}

interface ObjectiveLink {
  id: string; name: string;
  topic: { id: string; name: string };
}

function aliases(value: unknown) {
  return Array.isArray(value) ? value.filter((alias): alias is string => typeof alias === "string") : [];
}

function sourceView(provision: SourceProvision, objective: ObjectiveLink | null) {
  return {
    provisionId: provision.id,
    number: provision.number,
    title: provision.title,
    content: provision.content,
    citation: provision.citation,
    legalStatus: provision.status,
    validationStatus: provision.validationStatus,
    editorialStatus: provision.editorialStatus,
    document: provision.document,
    objective: objective ? { id: objective.id, name: objective.name, topic: objective.topic } : null,
  };
}

export function buildInstitutionalMap(records: InstitutionalMapRecord[]) {
  const sources = new Map<string, ReturnType<typeof sourceView>>();
  const entities = records.map((entity) => ({
    id: entity.id,
    slug: entity.slug,
    officialName: entity.officialName,
    aliases: aliases(entity.aliases),
    entityType: entity.entityType,
    level: entity.level,
    description: entity.description,
    status: entity.status,
    claims: entity.claims.map((claim) => {
      const source = sourceView(claim.sourceProvision, claim.objective);
      sources.set(source.provisionId, source);
      return {
        id: claim.id, type: claim.claimType, statement: claim.statement, status: claim.status,
        confidence: claim.confidence, sourceProvisionId: claim.sourceProvisionId, objectiveId: claim.objectiveId,
      };
    }),
  }));

  const relations = records.flatMap((entity) => entity.outgoingRelations.map((relation) => {
    const source = sourceView(relation.sourceProvision, relation.objective);
    sources.set(source.provisionId, source);
    return {
      id: relation.id,
      sourceEntityId: relation.sourceEntityId,
      targetEntityId: relation.targetEntityId,
      targetName: relation.targetEntity.officialName,
      type: relation.relationType,
      label: relation.label,
      description: relation.description,
      hierarchical: relation.hierarchical,
      status: relation.status,
      confidence: relation.confidence,
      sourceProvisionId: relation.sourceProvisionId,
      objectiveId: relation.objectiveId,
    };
  }));

  const sourceList = [...sources.values()];
  const pendingClaims = entities.flatMap((entity) => entity.claims).filter((claim) => claim.status !== "confirmed").length;
  const pendingRelations = relations.filter((relation) => relation.status !== "confirmed").length;
  return {
    entities,
    relations,
    sources: sourceList,
    summary: {
      entities: entities.length,
      claims: entities.reduce((total, entity) => total + entity.claims.length, 0),
      relations: relations.length,
      hierarchicalRelations: relations.filter((relation) => relation.hierarchical).length,
      documents: new Set(sourceList.map((source) => source.document.id)).size,
      pendingReview: pendingClaims + pendingRelations,
    },
    filters: {
      entityTypes: [...new Set(entities.map((entity) => entity.entityType))].sort(),
      documents: [...new Map(sourceList.map((source) => [source.document.id, { id: source.document.id, title: source.document.title }])).values()].sort((a, b) => a.title.localeCompare(b.title)),
      objectives: [...new Map(sourceList.filter((source) => source.objective).map((source) => [source.objective!.id, source.objective!])).values()].sort((a, b) => a.name.localeCompare(b.name)),
      confidences: [...new Set([...entities.flatMap((entity) => entity.claims.map((claim) => claim.confidence)), ...relations.map((relation) => relation.confidence)])],
    },
  };
}

export async function getInstitutionalMap() {
  const records = await prisma.institutionalEntity.findMany({
    orderBy: { officialName: "asc" },
    include: {
      claims: {
        orderBy: { claimType: "asc" },
        include: {
          sourceProvision: { include: { document: true } },
          objective: { include: { topic: true } },
        },
      },
      outgoingRelations: {
        orderBy: { label: "asc" },
        include: {
          targetEntity: { select: { officialName: true } },
          sourceProvision: { include: { document: true } },
          objective: { include: { topic: true } },
        },
      },
    },
  });
  return buildInstitutionalMap(records);
}
