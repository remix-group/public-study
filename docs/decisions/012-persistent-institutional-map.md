# ADR-012: Mapa institucional persistente y trazable

## Estado

Aceptada — 2026-09-16

## Contexto

La ruta OPEC incluye documentos que mencionan entidades, dependencias, funciones y formas
de coordinación. Una extracción automática por palabras produce falsos positivos, confunde
menciones con competencias y puede convertir una relación funcional en jerarquía.

El mapa jurídico de temas (ADR-009) sí es una proyección porque sus enlaces ya existen en el
modelo. Las relaciones institucionales, en cambio, requieren una decisión editorial y deben
conservar la evidencia exacta que la justifica.

## Decisión

Persistir tres conceptos: `InstitutionalEntity`, `InstitutionalClaim` e
`InstitutionalRelation`. Toda afirmación o relación exige `sourceProvisionId`, estado de
revisión y confianza. El vínculo con `LearningObjective` es opcional. Los alias no sustituyen
el nombre oficial.

Las relaciones distinguen `dependency`, `coordination`, `regulation`, `control`,
`cooperation`, `participation` y `reporting`. El indicador `hierarchical` solo puede activarse
cuando la disposición demuestra dependencia; el resto se visualiza exclusivamente como
relación funcional.

La API expone una lectura para estudiantes y devuelve también la fuente, el documento, la
citación, el objetivo OPEC y el estado editorial. La interfaz ofrece árbol, grafo, ficha y
explorador jurídico conectados.

## Consecuencias

- El mapa es auditable y puede mejorar mediante revisión sin alterar el corpus.
- Importar un documento no publica relaciones automáticamente.
- Los datos iniciales provenientes de unidades `pending/draft` se muestran como pendientes
  de revisión, no como afirmaciones confirmadas.
- Se requiere migración y siembra explícita para incorporar nuevas entidades o relaciones.
