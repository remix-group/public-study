---
name: entorno-dependencias
description: Estandariza el entorno y las dependencias del proyecto para que el equipo trabaje con las mismas versiones.
---

# Entorno y dependencias

Usa esta skill al instalar dependencias, preparar una máquina nueva, diagnosticar diferencias entre sistemas operativos o investigar por qué Codex propone cambiar versiones.

## Reglas

- Tratar `package.json` y `pnpm-lock.yaml` como la fuente de verdad para las dependencias JavaScript. Ejecuta `pnpm install` respetando el lockfile; no lo regeneres sin una razón concreta.
- Comprobar primero Node.js, pnpm y Docker antes de modificar archivos. Respeta la versión Node indicada en el proyecto y usa Corepack cuando corresponda.
- Preferir `pnpm install --frozen-lockfile` en CI y verificaciones reproducibles. Si falla, diagnostica la causa y no borres el lockfile ni cambies versiones automáticamente.
- No actualizar dependencias para resolver diferencias de sistema si el problema puede corregirse con la herramienta de versiones, Docker o la configuración local.
- Si hace falta cambiar una dependencia, explicar el motivo, impacto y compatibilidad; actualizar el lockfile de forma intencional y ejecutar las verificaciones del proyecto (`pnpm test`, `pnpm lint`, `pnpm build`).
- No confirmar `.env`, secretos, cachés, `node_modules` ni artefactos generados.
- Cuando una instrucción dependa del sistema operativo, documentar la variante concreta y mantener igual la versión lógica de las dependencias para todo el equipo.

## Resultado esperado

Dejar el entorno reproducible con el menor cambio posible. Informar qué se verificó, qué se modificó y qué paso manual queda para el integrante.
