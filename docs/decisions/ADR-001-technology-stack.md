# ADR-001: MVP Technology Stack

## Status
Accepted

## Date
2026-08-24

## Context
Necesitamos seleccionar un stack tecnológico para el MVP de la plataforma DIAN Study.
Los criterios de selección son:
- Tecnología común en la web con amplia documentación.
- TypeScript como lenguaje principal.
- React como framework de frontend.
- Ligero y de desarrollo rápido.
- Alineado con la arquitectura de monolito modular definida en `docs/architecture/mvp-architecture.md`.

## Decision

| Componente | Tecnología |
|---|---|
| Lenguaje | TypeScript |
| Frontend | React + Vite |
| Backend | Express |
| ORM | Prisma |
| Base de datos | PostgreSQL |
| Monorepo | pnpm workspaces |

### Justificación
- **Vite + React** ofrece el DX más rápido para desarrollo frontend sin la complejidad de SSR que no necesitamos en el MVP.
- **Express** es el framework de backend más documentado del ecosistema Node.js, minimizando fricción.
- **Prisma** proporciona schema declarativo, migraciones automáticas y type-safety completa con TypeScript.
- **pnpm workspaces** permite la estructura de monorepo sin herramientas adicionales.

## Consequences
- El frontend y el backend son procesos separados (no fullstack integrado como Next.js).
- Se necesitará configurar CORS y un proxy en desarrollo.
- Prisma genera el cliente tipado automáticamente, lo cual simplifica la persistencia.
- La estructura de pnpm workspaces permite separar `packages/domain`, `apps/web`, `apps/api`, etc. de forma limpia.
