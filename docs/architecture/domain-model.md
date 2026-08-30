# Domain Model

Este documento integra los diferentes subdominios (OPEC, Jurídico y de Aprendizaje) para mostrar cómo interactúan conceptualmente en la plataforma. Es una de las referencias principales para los agentes al implementar lógica de negocio.

## Modelo Conceptual Integrado (OPEC + Legal + Learning)

La jerarquía desciende desde la definición de la vacante hasta las disposiciones legales atómicas que el estudiante debe conocer.

```text
OPEC
 │
 └── Competency
       │
       └── Topic
             │
             └── LearningObjective
                    │
        ┌───────────┼────────────┐
        ↓           ↓            ↓
     Concept      Question      Case
        │           │            │
        └───────┬───┴────────────┘
                ↓
          LegalProvision
                │
                ↓
          LegalDocument
```

## Modelo de Interacción del Estudiante

El ciclo de vida de la práctica y la evaluación del dominio se modela de la siguiente manera:

```text
Student
   ↓
AuthSession
   ↓
Authenticated Study Flow
   ↓
StudySession
   ↓
Attempt
   ↓
Evaluation
   ↓
Mistake
   ↓
MasteryState
```

**Nota:** Cualquier nueva entidad introducida en el desarrollo debe reflejarse en este modelo antes o durante su implementación (Regla #2 de AGENTS.md).
