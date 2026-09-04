# ADR-009 — Grafo jurídico derivado por tema

## Estado

Aceptado.

## Contexto

La ruta curricular organiza el contenido como OPEC, competencia, bloque, tema y objetivo. Esa jerarquía es apropiada para progresar, pero no permite comprender visualmente cómo se conectan conceptos, artículos, documentos, modificaciones, derogaciones y referencias.

El dominio ya conserva relaciones trazables entre objetivos, conceptos, evidencias, disposiciones y documentos, además de relaciones jurídicas tipificadas entre disposiciones. Crear una segunda copia persistente de esas conexiones introduciría divergencia frente a la fuente jurídica autoritativa.

## Decisión

Se incorpora `TopicKnowledgeGraph` como modelo de lectura derivado, no como entidad persistente. Para un tema activo, la aplicación proyecta:

- el tema y sus objetivos activos;
- los conceptos asociados;
- las disposiciones aprobadas y publicadas que respaldan conceptos, preguntas o casos;
- los documentos oficiales que contienen esas disposiciones;
- las relaciones jurídicas tipificadas conectadas a las disposiciones directas, con una expansión máxima de un salto.

La API expone la proyección en `GET /api/learning/topics/:topicId/graph`. Cada nodo conserva los datos necesarios para inspección y navegación a la fuente oficial. El cliente decide la disposición visual.

## Consecuencias

- El mapa siempre refleja el contenido jurídico y editorial vigente en la base de datos.
- No se requiere una migración ni una base de datos especializada en grafos para el primer incremento.
- Las disposiciones pendientes o en borrador no se muestran al estudiante.
- La expansión de un salto limita ruido visual y costo de consulta.
- Si el volumen o los recorridos crecen, se podrá materializar o indexar la proyección sin cambiar el contrato conceptual.
