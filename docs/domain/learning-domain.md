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
- `AuthSession`: Sesión de autenticación revocable; almacena únicamente el hash del token entregado al navegador.

`QuestionAttempt` conserva la dificultad y un snapshot de las evidencias jurídicas utilizadas en la evaluación. Estos snapshots son valores inmutables del intento, no nuevas entidades, y permiten auditar resultados históricos.

`Question` tiene un ciclo editorial (`draft`, `published`, `archived`). Solo el contenido publicado puede utilizarse en sesiones. La publicación registra responsable y fecha de revisión.

## Conceptos Core del Algoritmo (Atributos)
- `mastery`: Nivel de dominio adquirido por el estudiante (ej. 0.0 a 1.0).
- `difficulty`: Nivel de dificultad calculada o inherente del ítem evaluativo.
- `confidence`: Nivel de certeza reportado por el estudiante (opcional) o estimado.
- `retention`: Estimación de la probabilidad de recuerdo (útil para el *spaced repetition*).

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
