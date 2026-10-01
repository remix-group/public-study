# ADR-014 — Ciclo editorial para ejemplos y casos

## Estado

Aceptada — 2026-09-30.

## Contexto

Los casos situacionales ya exigían evidencia jurídica publicable para aparecer en el paquete de estudio, pero no registraban por sí mismos su estado, clase ni revisión. Esto impedía diferenciar de forma explícita un ejemplo trabajado de un ejercicio de aplicación y dejaba menos trazabilidad que la disponible para las preguntas.

## Decisión

1. `Case` incorpora `kind`, `editorialStatus`, `reviewedBy` y `reviewedAt`.
2. Solo los casos en estado `published` y cuyas evidencias completas sean publicables pueden mostrarse o utilizarse en una sesión.
3. `kind=worked_example` identifica la demostración razonada; `kind=application` identifica el caso que resuelve el estudiante.
4. La carga curada registra la revisión como asistencia editorial basada en fuentes oficiales, sin presentarla como revisión jurídica humana independiente.

## Consecuencias

- Los casos tienen el mismo umbral mínimo de trazabilidad que las preguntas.
- La interfaz deja de depender del orden de creación para distinguir ejemplo y aplicación.
- La revisión jurídica humana final continúa siendo un control de publicación recomendado antes de uso institucional.
