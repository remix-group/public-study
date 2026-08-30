# ADR-004: Human-reviewed Editorial Workflow

## Status
Accepted

## Date
2026-08-30

## Context
El contenido jurídico es autoritativo y una pregunta incompleta, sin evidencia o no revisada no debe llegar a estudiantes. La generación automática futura necesita el mismo control editorial.

## Decision
Las preguntas atraviesan los estados `draft`, `published` y `archived`. Solo un estudiante con rol `editor` puede administrar contenido. Publicar exige objetivo, opciones válidas, respuesta incluida en las opciones y al menos una evidencia jurídica. Se registra editor y fecha de aprobación. El motor de estudio solo selecciona preguntas publicadas.

## Consequences
- Crear contenido no lo hace visible inmediatamente.
- La publicación deja trazabilidad humana.
- La ingestión y generación por LLM deberán producir borradores.
- El MVP utiliza un rol simple; permisos más granulares pueden añadirse cuando existan varios equipos editoriales.
