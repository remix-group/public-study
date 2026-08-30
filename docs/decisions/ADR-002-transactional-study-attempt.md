# ADR-002: Transactional Study Attempt

## Status
Accepted

## Date
2026-08-30

## Context
Registrar una respuesta modifica el intento, los errores, el dominio, la revisión y las estadísticas de sesión. Una escritura parcial dejaría el progreso inconsistente. Además, AC-002 requiere conservar la evidencia jurídica y dificultad usadas al evaluar.

## Decision
El flujo se coordina en un servicio de aplicación y se persiste en una única transacción Prisma. `QuestionAttempt` conserva snapshots inmutables de dificultad y evidencia. Los handlers HTTP solo validan, delegan y traducen errores a respuestas HTTP.

## Consequences
- Un fallo revierte todo el intento.
- Las evaluaciones históricas siguen siendo auditables si cambia una pregunta.
- El snapshot duplica una pequeña cantidad de texto jurídico de forma intencional.
- La autenticación sustituirá los identificadores enviados por el cliente en una fase posterior.
