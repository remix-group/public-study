# MVP Architecture

La arquitectura inicial está diseñada para ser sencilla, operable y orientada a validar el modelo de dominio. Se evita deliberadamente la sobre-ingeniería temprana.

## Diseño General

Para el primer MVP se utilizará una arquitectura basada en un **monolito modular + workers** (tareas en segundo plano). No se utilizarán arquitecturas distribuidas complejas (microservicios) en esta fase.

```text
                    Web App
                       │
                       ↓
                   API/BFF
                       │
          ┌────────────┼─────────────┐
          ↓            ↓             ↓
       Domain       Learning      AI Gateway
          │            │             │
          └──────┬─────┴─────────────┘
                 ↓
             PostgreSQL
                 │
        ┌────────┼─────────┐
        ↓        ↓         ↓
      Vector   Documents  Progress
```

## Componentes Principales
- **Web App:** Interfaz de usuario para el estudiante.
- **API / BFF (Backend for Frontend):** Puerta de entrada para las peticiones de la Web App.
- **Domain Module:** Lógica de negocio core (Gestión de la OPEC y normativa).
- **Learning Module:** Motor de evaluación, mastery y repetición espaciada.
- **AI Gateway:** Abstracción para interactuar con proveedores LLM (generación de preguntas, evaluación de respuestas, etc.).
- **Workers (Fuera del diagrama síncrono):** Procesos asíncronos para ingestión de documentos jurídicos, cálculo periódico de *spaced repetition* o embedding de textos.

## Persistencia
- **PostgreSQL:** Actuará como base de datos central (esquemas relacionales para dominio/progreso, almacenamiento JSONB para documentos en bruto, y soporte para vectores mediante `pgvector`).
- **Knowledge Graph:** Por ahora, las relaciones jurídicas (`MODIFIES`, `REPEALS`) se modelarán relacionalmente. La introducción de una base de datos de grafos nativa (ej. Neo4j) queda como una decisión diferida (ADR futuro) dependiendo de la necesidad real durante la fase de ingestión jurídica.
