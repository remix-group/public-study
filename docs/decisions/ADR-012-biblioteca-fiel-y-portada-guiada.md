# ADR-012: Biblioteca fiel y portada guiada

- Estado: aceptada
- Fecha: 2026-09-18

## Contexto

El corpus importado debe poder auditarse sin confundir la transcripción fuente con material pedagógico, mientras la portada necesita orientar al estudiante sin mostrar simultáneamente toda la ruta y sus objetivos.

## Decisión

1. La biblioteca continúa siendo una vista de `LegalDocument`, `LegalVersion` y `LegalProvision`; no se crea un dominio paralelo.
2. `LegalDocument.originalFileName` conserva el nombre exacto recibido, separado de `originalFileKey`.
3. `LegalProvision.content` se presenta sin correcciones como transcripción original. `extractionIssues` registra alertas sin modificar el texto.
4. Las unidades `study_guide`, `study_topic` y `visual_extraction` se rotulan como contenido derivado.
5. No se incorpora todavía una versión editorial corregida. Cuando se implemente deberá conservar autor, fecha, motivo, comparación y aprobación.
6. El orden de lectura es estable: una ruta materializada de jerarquía y orden documental (`documentPath`), seguida por `order`, `anchor` e `id`; la relación padre-hijo se conserva mediante `parentProvisionId`.
7. La portada conserva el contrato pedagógico y reorganiza su presentación: una acción principal, progreso compacto y bloques/temas desplegables.
8. El bloque y tema activos viven como estado de interfaz para conservar el contexto al volver de una actividad.

## Consecuencias

- La procedencia y las incidencias son verificables sin alterar el corpus.
- La búsqueda puede cubrir texto, número y título con filtros de versión y estado.
- Los cambios requieren una migración compatible y resembrado idempotente.
- La corrección editorial trazable queda como una capacidad futura explícita, no como una transformación implícita.
