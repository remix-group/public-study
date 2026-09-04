import { prisma } from "@dian-study/infrastructure";
import { AttemptNotFoundError } from "./submit-question-attempt.js";

export type KnowledgeGraphNodeKind = "topic" | "objective" | "concept" | "provision" | "document";

export interface KnowledgeGraphNode {
  id: string;
  kind: KnowledgeGraphNodeKind;
  label: string;
  subtitle: string;
  description: string;
  status?: string;
  citation?: string;
  content?: string;
  officialUrl?: string;
}

export interface KnowledgeGraphEdge {
  id: string;
  source: string;
  target: string;
  type: "CONTAINS" | "DEVELOPS" | "SUPPORTED_BY" | "MODIFIES" | "ADDS" | "REPEALS" | "REPLACES" | "REFERENCES" | "REGULATES";
  label: string;
  description: string;
}

interface GraphProvision {
  id: string;
  number: string;
  title: string;
  content: string;
  citation: string;
  status: string;
  validationStatus: string;
  editorialStatus: string;
  document: { id: string; title: string; authority: string; documentType: string; officialUrl: string; status: string };
}

interface EvidenceLink { evidence: { provision: GraphProvision } }
interface GraphObjective {
  id: string;
  name: string;
  description: string;
  concepts: Array<{ id: string; name: string; description: string; evidences: EvidenceLink[] }>;
  questions: Array<{ evidences: EvidenceLink[] }>;
  cases: Array<{ evidences: EvidenceLink[] }>;
}

interface GraphTopic {
  id: string;
  name: string;
  description: string;
  block: { name: string; competency: { name: string } };
  learningObjectives: GraphObjective[];
}

interface GraphLegalRelation {
  id: string;
  type: string;
  description: string;
  sourceProvision: GraphProvision;
  targetProvision: GraphProvision;
}

const relationLabels: Record<string, string> = {
  MODIFIES: "modifica",
  ADDS: "adiciona",
  REPEALS: "deroga",
  REPLACES: "reemplaza",
  REFERENCES: "referencia",
  REGULATES: "reglamenta",
};

function isPublishable(provision: GraphProvision) {
  return provision.validationStatus === "approved" && provision.editorialStatus === "published";
}

export function buildTopicKnowledgeGraph(topic: GraphTopic, legalRelations: GraphLegalRelation[]) {
  const nodes = new Map<string, KnowledgeGraphNode>();
  const edges = new Map<string, KnowledgeGraphEdge>();
  const directProvisionIds = new Set<string>();

  const addEdge = (edge: Omit<KnowledgeGraphEdge, "id">) => {
    const id = `${edge.type}:${edge.source}:${edge.target}`;
    if (!edges.has(id)) edges.set(id, { id, ...edge });
  };
  const addProvision = (provision: GraphProvision) => {
    if (!isPublishable(provision)) return false;
    nodes.set(`provision:${provision.id}`, {
      id: `provision:${provision.id}`, kind: "provision", label: provision.number,
      subtitle: provision.title, description: provision.citation, status: provision.status,
      citation: provision.citation, content: provision.content,
      officialUrl: provision.document.officialUrl,
    });
    nodes.set(`document:${provision.document.id}`, {
      id: `document:${provision.document.id}`, kind: "document", label: provision.document.title,
      subtitle: provision.document.authority, description: provision.document.documentType,
      status: provision.document.status, officialUrl: provision.document.officialUrl,
    });
    addEdge({ source: `document:${provision.document.id}`, target: `provision:${provision.id}`, type: "CONTAINS", label: "contiene", description: provision.citation });
    return true;
  };

  nodes.set(`topic:${topic.id}`, {
    id: `topic:${topic.id}`, kind: "topic", label: topic.name,
    subtitle: `${topic.block.competency.name} · ${topic.block.name}`, description: topic.description,
  });

  for (const objective of topic.learningObjectives) {
    const objectiveNodeId = `objective:${objective.id}`;
    nodes.set(objectiveNodeId, {
      id: objectiveNodeId, kind: "objective", label: objective.name,
      subtitle: "Objetivo de aprendizaje", description: objective.description,
    });
    addEdge({ source: `topic:${topic.id}`, target: objectiveNodeId, type: "CONTAINS", label: "contiene", description: "Objetivo incluido en el tema" });

    const objectiveProvisions = new Map<string, GraphProvision>();
    for (const concept of objective.concepts) {
      const conceptNodeId = `concept:${concept.id}`;
      nodes.set(conceptNodeId, {
        id: conceptNodeId, kind: "concept", label: concept.name,
        subtitle: "Concepto jurídico", description: concept.description,
      });
      addEdge({ source: objectiveNodeId, target: conceptNodeId, type: "DEVELOPS", label: "desarrolla", description: "Concepto necesario para dominar el objetivo" });
      for (const link of concept.evidences) {
        if (!isPublishable(link.evidence.provision)) continue;
        objectiveProvisions.set(link.evidence.provision.id, link.evidence.provision);
        addEdge({ source: conceptNodeId, target: `provision:${link.evidence.provision.id}`, type: "SUPPORTED_BY", label: "se sustenta en", description: link.evidence.provision.citation });
      }
    }
    for (const item of [...objective.questions, ...objective.cases]) {
      for (const link of item.evidences) {
        if (isPublishable(link.evidence.provision)) objectiveProvisions.set(link.evidence.provision.id, link.evidence.provision);
      }
    }
    for (const provision of objectiveProvisions.values()) {
      directProvisionIds.add(provision.id);
      addProvision(provision);
      addEdge({ source: objectiveNodeId, target: `provision:${provision.id}`, type: "SUPPORTED_BY", label: "se sustenta en", description: provision.citation });
    }
  }

  for (const relation of legalRelations) {
    if (!relationLabels[relation.type]) continue;
    if (!addProvision(relation.sourceProvision) || !addProvision(relation.targetProvision)) continue;
    addEdge({
      source: `provision:${relation.sourceProvision.id}`, target: `provision:${relation.targetProvision.id}`,
      type: relation.type as KnowledgeGraphEdge["type"], label: relationLabels[relation.type], description: relation.description,
    });
  }

  const resultNodes = [...nodes.values()];
  const resultEdges = [...edges.values()].filter((edge) => nodes.has(edge.source) && nodes.has(edge.target));
  return {
    topic: { id: topic.id, name: topic.name, description: topic.description },
    nodes: resultNodes,
    edges: resultEdges,
    summary: {
      objectives: resultNodes.filter((node) => node.kind === "objective").length,
      concepts: resultNodes.filter((node) => node.kind === "concept").length,
      provisions: resultNodes.filter((node) => node.kind === "provision").length,
      documents: resultNodes.filter((node) => node.kind === "document").length,
      legalRelations: resultEdges.filter((edge) => relationLabels[edge.type]).length,
      directProvisions: directProvisionIds.size,
    },
  };
}

export async function getTopicKnowledgeGraph(topicId: string) {
  const topic = await prisma.topic.findFirst({
    where: { id: topicId, status: "active" },
    include: {
      block: { include: { competency: true } },
      learningObjectives: {
        where: { status: "active" }, orderBy: { order: "asc" },
        include: {
          concepts: { include: { evidences: { include: { evidence: { include: { provision: { include: { document: true } } } } } } } },
          questions: { where: { editorialStatus: "published" }, include: { evidences: { include: { evidence: { include: { provision: { include: { document: true } } } } } } } },
          cases: { include: { evidences: { include: { evidence: { include: { provision: { include: { document: true } } } } } } } },
        },
      },
    },
  });
  if (!topic) throw new AttemptNotFoundError("Topic not found");

  const directIds = new Set<string>();
  for (const objective of topic.learningObjectives) {
    for (const concept of objective.concepts) for (const link of concept.evidences) directIds.add(link.evidence.provision.id);
    for (const question of objective.questions) for (const link of question.evidences) directIds.add(link.evidence.provision.id);
    for (const studyCase of objective.cases) for (const link of studyCase.evidences) directIds.add(link.evidence.provision.id);
  }
  const ids = [...directIds];
  const relations = ids.length ? await prisma.legalRelation.findMany({
    where: { OR: [{ sourceProvisionId: { in: ids } }, { targetProvisionId: { in: ids } }] },
    include: {
      sourceProvision: { include: { document: true } },
      targetProvision: { include: { document: true } },
    },
    orderBy: { createdAt: "asc" },
  }) : [];
  return buildTopicKnowledgeGraph(topic, relations);
}
