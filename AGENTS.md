# DIAN Study Platform

## Purpose

Plataforma de aprendizaje adaptativo para preparar una OPEC específica del concurso de méritos de la DIAN.

## Repository map

- Product requirements: docs/product/
- Domain model: docs/domain/
- Architecture: docs/architecture/
- OPEC specification: specs/opec/
- Learning specifications: specs/learning/
- Legal specifications: specs/legal/
- Architecture decisions: docs/decisions/
- Active execution plans: docs/execution/active/

## Important rules

1. Follow the domain model.
2. Do not introduce domain entities without updating the domain model.
3. Legal source data is authoritative over LLM output.
4. LLM providers must use the provider abstraction.
5. Business logic must not live in API handlers.
6. Every significant architectural decision requires an ADR.
7. Run the relevant tests before declaring work complete.

## Development

See README.md and docs/architecture/.
