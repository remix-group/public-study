# Domain Model

Este documento integra los diferentes subdominios (OPEC, Jurídico y de Aprendizaje) para mostrar cómo interactúan conceptualmente en la plataforma. Es una de las referencias principales para los agentes al implementar lógica de negocio.

## Modelo Conceptual Integrado (OPEC + Legal + Learning)

La jerarquía desciende desde la definición de la vacante hasta las disposiciones legales atómicas que el estudiante debe conocer.

`OPEC` es el nombre técnico existente de la entidad que representa el `JobProfile`
de la especificación funcional. No se crea una segunda entidad para el mismo concepto.

```text
OPEC / JobProfile
 │
 └── Competency
       │
       └── Block
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
   ├── recall / comprehension / application
   ├── sourceAwareness / stability
   ├── TopicProgress (ruta y acceso persistente)
   ├── Recommendation (derivada)
   └── ReviewSchedule (mantenimiento)
```

## Flujo pedagógico operativo

```text
Ruta recomendada -> Recuperación inicial -> Actividad -> Respuesta
        -> Feedback basado en evidencia -> Diagnóstico de error
        -> Mastery multidimensional -> Progresión / Refuerzo / Repaso
```

La ruta es secuencial, pero el acceso es acumulativo: un tema desbloqueado nunca se
vuelve a bloquear. El umbral inicial de progresión es 70 %, configurable por bloque.

**Nota:** Cualquier nueva entidad introducida en el desarrollo debe reflejarse en este modelo antes o durante su implementación (Regla #2 de AGENTS.md).
