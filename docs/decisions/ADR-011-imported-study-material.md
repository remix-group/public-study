# ADR-011: Integración del corpus y la ruta de estudio de la OPEC 236828

## Estado

Aceptado — 2026-09-14.

## Contexto

Se recibió un volcado PostgreSQL de 37 documentos procesados, dos PDF que describen el
manual y la ruta de aprendizaje, y contenido derivado del pipeline: 14.368 unidades,
14.368 evidencias, tres cartillas y siete extracciones visuales. El esquema del volcado no
coincide con el esquema Prisma de la aplicación y contiene una tabla `topics` incompatible
con la tabla curricular existente.

La fuente jurídica debe permanecer diferenciada de material pedagógico y de contenido
pendiente de revisión. Además, el volcado no registra una fecha jurídica de vigencia fiable
para todos los documentos.

## Decisión

- Conservar el volcado original comprimido y sus hashes como artefacto reproducible.
- Mapear `documents`, `document_versions`, `legal_units` y `evidence` a
  `LegalDocument`, `LegalVersion`, `LegalProvision` y `Evidence`.
- Conservar cartillas y payloads visuales como unidades `study_guide` y
  `visual_extraction` asociadas a su documento y versión, sin introducir entidades nuevas.
- Mantener todo el corpus importado en `REVIEW_REQUIRED`, `pending` y `draft`. La
  importación no equivale a revisión jurídica ni autoriza publicación como fuente primaria.
- Permitir `effectiveFrom = NULL` cuando el origen no contiene una fecha verificada.
- Representar la ruta aportada mediante la jerarquía existente
  `OPEC → Competency → Block → Topic → LearningObjective`, con seis bloques y
  veinticinco temas.
- Exponer el corpus mediante una biblioteca paginada. El catálogo editorial no debe
  convertirse en una respuesta monolítica con todas las unidades.

## Consecuencias

- La aplicación conserva la trazabilidad del corpus sin restaurar un segundo esquema ni
  duplicar el modelo de dominio.
- El estudiante puede consultar material pendiente de revisión, claramente rotulado, pero
  las preguntas y el grafo jurídico solo tratan como publicadas las unidades aprobadas.
- La ausencia de fechas verificadas queda explícita y requiere trabajo editorial posterior.
- El seed tarda más en una base vacía por la importación inicial; las ejecuciones siguientes
  son idempotentes mediante identificadores estables y `skipDuplicates`.

## Fuentes incorporadas

- `legal_pipeline_combinada_2026-09-14.sql`, SHA-256
  `472ac8a2ebec49f60b7d0fcc69b41d313918368f75aba448de8052f7747022d2`.
- `DIAN - Técnico - Analista I - 236828.pdf`, SHA-256
  `49ac8b402f7b1741d79ca38790b9889329cbd61936357cf750781b02c2e6181b`.
- `Ruta - Hoja 1.pdf`, SHA-256
  `33099ed3832ca3febb9bd134d64c35d18417abc363534abde4b4819b11a40c2b`.
