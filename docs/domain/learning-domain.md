# Learning Domain

Este dominio define qué significa "aprender" dentro de la plataforma y cómo se evalúa el progreso del estudiante frente a los objetivos trazados.

## Entidades Iniciales
- `LearningObjective`: Meta específica de aprendizaje o habilidad que el estudiante debe dominar.
- `Concept`: Concepto jurídico o procedimental atómico.
- `Question`: Elemento de evaluación directa (opción múltiple, etc.).
- `QuestionAttempt`: Registro del intento de respuesta del usuario a una pregunta.
- `Case`: Escenario o caso situacional complejo.
- `CaseAttempt`: Registro del intento de resolución del caso situacional.
- `Mistake`: Error específico o patrón de error tipificado cometido en un intento.
- `MasteryState`: Estado actual y persistente del dominio del estudiante sobre un objetivo o concepto.
- `ReviewSchedule`: Programación de revisiones basada en algoritmos de repetición espaciada.
- `StudySession`: Agrupación lógica del tiempo y actividades de estudio de un usuario.
- `Block`: Etapa curricular ordenada dentro de una competencia.
- `TopicProgress`: estado derivado y persistente de acceso a un tema (`LOCKED`,
  `AVAILABLE`, `IN_PROGRESS`, `COMPLETED`, `MASTERED`).
- `AuthSession`: Sesión de autenticación revocable; almacena únicamente el hash del token entregado al navegador.

`QuestionAttempt` conserva la dificultad y un snapshot de las evidencias jurídicas utilizadas en la evaluación. Estos snapshots son valores inmutables del intento, no nuevas entidades, y permiten auditar resultados históricos.

`Question` tiene un ciclo editorial (`draft`, `published`, `archived`). Solo el contenido publicado puede utilizarse en sesiones. La publicación registra responsable y fecha de revisión.

## Conceptos Core del Algoritmo (Atributos)
- `mastery`: Nivel de dominio adquirido por el estudiante (ej. 0.0 a 1.0).
- `difficulty`: Nivel de dificultad calculada o inherente del ítem evaluativo.
- `confidence`: Nivel de certeza reportado por el estudiante (opcional) o estimado.
- `retention`: Estimación de la probabilidad de recuerdo (útil para el *spaced repetition*).
- `recall`, `comprehension`, `application`, `sourceAwareness`, `stability`:
  dimensiones de dominio. `mastery` es el agregado y no equivale a precisión.
- `mode`: intención de una sesión (`LEARN`, `PRACTICE`, `ASSESS`, `REVIEW`, `CASE`).

## Progresión

- La ruta curricular es `OPEC/JobProfile -> Competency -> Block -> Topic -> LearningObjective`.
- El primer tema está disponible; los siguientes se desbloquean secuencialmente.
- Un tema desbloqueado conserva el acceso aunque su dominio decaiga.
- Un tema se completa con evidencia acumulada, no por lectura ni por un único intento.
- El umbral inicial es 0.70 y puede configurarse por bloque.
- Las debilidades no bloqueantes generan recomendaciones; las críticas pueden impedir
  el desbloqueo del siguiente tema.

## Diagnóstico de errores

Los errores permitidos son `UNKNOWN_CONCEPT`, `CONCEPT_CONFUSION`, `FORGOT_RULE`,
`MISSED_EXCEPTION`, `NORM_VERSION_ERROR`, `PROCEDURE_ORDER_ERROR`,
`CASE_INTERPRETATION_ERROR` y `CARELESS_ERROR`. El tipo alimenta el feedback y la
siguiente intervención recomendada.

## Flujo Conceptual de Aprendizaje

```text
LearningObjective
    ↓
Question
    ↓
Attempt
    ↓
Evaluation
    ↓
Mistake
    ↓
MasteryState
    ↓
ReviewSchedule
```

## Mapa jurídico del tema

`TopicKnowledgeGraph` es un modelo de lectura derivado que permite explorar el contexto jurídico de un tema. No es una nueva entidad persistente: se construye desde `Topic`, `LearningObjective`, `Concept`, `Evidence`, `LegalProvision`, `LegalDocument` y `LegalRelation`.

Solo expone disposiciones aprobadas y publicadas. Incluye las normas que respaldan directamente el aprendizaje y, como máximo, un salto de relaciones jurídicas tipificadas para mantener el mapa comprensible.
