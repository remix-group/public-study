# ADR-013: Paquete de estudio derivado por objetivo

- Estado: aceptada
- Fecha: 2026-09-18

## Contexto

La ruta curricular y la recuperación inicial ya existían, pero un objetivo podía abrir una pantalla sin lectura suficiente, ejemplo, comprobación o explicación honesta del estado editorial. El corpus contiene fuentes jurídicas, manuales y material pendiente que no puede tratarse de la misma manera.

## Decisión

1. `StudyPackage` será una proyección de lectura y no una entidad persistente nueva.
2. La proyección se construye desde `LearningObjective`, `Concept`, `Evidence`, `LegalProvision`, `LegalDocument`, `Question`, `Case` y `ReviewSchedule`.
3. El contrato separa fuente literal, explicación pedagógica, actividad y evaluación.
4. Los estados `READY`, `PARTIAL` e `IN_REVIEW` comunican qué puede estudiar el usuario sin elevar material pendiente a autoridad jurídica.
5. Las preguntas de práctica siguen limitadas a contenido publicado con evidencia; la falta de preguntas no impide consultar lectura o material trazable.
6. Ejemplos y casos solo se muestran cuando existe un `Case` respaldado por evidencia aprobada y publicada. La ausencia se comunica en lugar de completar contenido artificialmente.
7. La próxima revisión se obtiene de `ReviewSchedule`; abrir o leer el paquete no altera dominio, progreso ni reglas de desbloqueo.
8. Todos los objetivos usan una sola plantilla de interfaz con contenido específico derivado de sus relaciones.

## Consecuencias

- Los 25 temas pueden abrir una experiencia consistente, incluso cuando su material está en revisión.
- No se requiere migración ni se duplica el corpus jurídico.
- La calidad del paquete aumenta a medida que editores aprueban fuentes, publican preguntas y crean casos respaldados.
- Las respuestas libres de recuperación y cierre permanecen locales por ahora; no cuentan como intento ni modifican `MasteryState`.
