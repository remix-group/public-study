# Modelo de datos para el mapa institucional DIAN

Esta referencia orienta el modelado del mapa sin imponer entidades que el corpus
no demuestre. Antes de agregar tablas o campos, compara este modelo con
`packages/infrastructure/prisma/schema.prisma` y el modelo de dominio vigente.

## Principios

- Mantén identificadores estables y no reemplaces registros existentes.
- Separa identidad institucional, afirmaciones funcionales y evidencia.
- Toda afirmación visible debe seguirse hasta una disposición o unidad documental.
- Usa estados explícitos: `confirmed`, `probable`, `pending_review` y `no_confirmado`.
- Separa relaciones jerárquicas de relaciones funcionales, aunque compartan aristas.
- Conserva alias y nombre oficial por separado para búsqueda y auditoría.

## Entidades conceptuales

```ts
type InstitutionalEntity = {
  id: string;
  officialName: string;
  entityType: "institution" | "department" | "authority" | "committee" | "other";
  level?: string;
  aliases: string[];
  description?: string;
  confidence: "confirmed" | "probable" | "no_confirmado";
  status: "active" | "pending_review" | "historical";
};

type InstitutionalClaim = {
  id: string;
  entityId: string;
  claimType: "function" | "competence" | "responsibility" | "scope";
  statement: string;
  status: "confirmed" | "pending_review" | "no_confirmado";
  sourceProvisionId?: string;
  objectiveId?: string;
};

type InstitutionalRelation = {
  id: string;
  sourceEntityId: string;
  targetEntityId: string;
  relationType:
    | "hierarchical_dependency" | "adscription" | "coordination"
    | "regulation" | "supervision" | "control" | "cooperation"
    | "participation" | "reference" | "other";
  description: string;
  status: "confirmed" | "pending_review" | "no_confirmado";
  sourceProvisionId?: string;
  objectiveId?: string;
};
```

`hierarchical_dependency` solo procede cuando la fuente prueba subordinación o
dependencia. Coordinación, regulación, control y cooperación no deben dibujarse
como niveles del árbol.

## Trazabilidad en el proyecto

Reutiliza las entidades existentes siempre que sean suficientes:

- `LegalDocument` y `LegalVersion`: documento y versión.
- `LegalProvision`: artículo, disposición, unidad o fragmento.
- `Evidence`: texto y cita que sustentan la afirmación.
- `LearningObjective`: objetivo OPEC relacionado.

Si se propone una entidad nueva, justifica por qué estas entidades no bastan y
actualiza primero el modelo de dominio y el ADR correspondiente.

## JSON de lectura

```json
{
  "id": "entity-dian",
  "officialName": "Dirección de Impuestos y Aduanas Nacionales",
  "entityType": "institution",
  "aliases": ["DIAN"],
  "confidence": "confirmed",
  "claims": [{
    "id": "claim-1",
    "type": "function",
    "statement": "Texto sustentado por la fuente",
    "status": "pending_review",
    "source": {
      "documentId": "document-1",
      "provisionId": "provision-1",
      "evidenceId": "evidence-1",
      "citation": "Documento, artículo o página"
    },
    "objectiveId": "objective-route-01"
  }],
  "relations": []
}
```

Nunca devuelvas una relación sin fuente o estado visible. Si solo existe una
hipótesis, usa `no_confirmado` y no la presentes como hecho.

## Consultas y auditoría

Indexa tipo, estado, confianza, alias, origen, destino, tipo de relación,
`sourceProvisionId` y `objectiveId`. Filtra por corpus y OPEC antes de cargar el
grafo y limita profundidad y vecinos.

La auditoría debe detectar entidades duplicadas, relaciones sin evidencia,
direcciones ambiguas, ciclos jerárquicos, fuentes obsoletas, afirmaciones sin
revisión y objetivos OPEC sin entidad o evidencia. No corrijas estos hallazgos
silenciosamente: registra fuente, decisión y necesidad de revisión humana.
