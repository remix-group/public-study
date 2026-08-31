# ADR-005: Versioned Legal Knowledge Core

## Status
Accepted

## Date
2026-08-30

## Context
El documento de arquitectura exige separar archivos fuente, versiones temporales, unidades jurídicas y conocimiento derivado. El modelo inicial `LegalDocument → LegalProvision → Evidence` no conserva suficiente trazabilidad para detectar cambios normativos ni reprocesar una fuente.

## Decision
Se amplía `LegalDocument` como registro de fuente y estado del pipeline; se introduce `LegalVersion`; y `LegalProvision` implementa por ahora el concepto arquitectónico `LegalUnit`, con jerarquía, tipo, anchor, orden, validación y publicación. PostgreSQL representa las relaciones explícitas durante el MVP. Los nombres físicos actuales se mantienen para evitar una migración destructiva.

## Consequences
- Una fuente puede tener múltiples versiones y unidades jerárquicas.
- Las evidencias continúan apuntando a unidades jurídicas concretas.
- Solo unidades aprobadas pueden publicarse y utilizarse como nueva evidencia editorial.
- Object storage, parsing automático, jobs y embeddings se incorporarán sobre estos contratos sin reemplazarlos.
