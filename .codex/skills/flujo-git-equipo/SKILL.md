---
name: flujo-git-equipo
description: Aplica el flujo de trabajo Git del equipo con main protegida y ramas de desarrollo por integrante.
---

# Flujo Git del equipo

Usa esta skill al crear ramas, preparar commits, sincronizar trabajo, resolver conflictos o abrir pull requests en este repositorio.

## Modelo de ramas

- `main` es la rama principal, estable y protegida. No trabajar directamente sobre ella ni hacerle push directo.
- Cada integrante trabaja en una rama propia basada en `main`, con nombres `feature/<descripcion>`, `fix/<descripcion>` o `chore/<descripcion>`.
- Mantener una rama enfocada por cambio. No mezclar refactors oportunistas con la funcionalidad solicitada.
- Antes de comenzar, actualizar referencias y crear la rama desde la `main` remota más reciente, sin sobrescribir cambios locales.

## Operación segura

- Comprobar `git status`, rama actual y cambios existentes antes de operar. Preservar cambios no relacionados.
- Antes de abrir un PR, sincronizar la rama con `main` usando la política acordada por el equipo; preferir una historia clara y no reescribir una rama compartida.
- Resolver conflictos conservando la intención de ambos cambios y ejecutar las pruebas relevantes después.
- Usar commits pequeños y descriptivos. No incluir secretos, `.env`, dependencias instaladas ni archivos generados.
- El PR debe describir problema, solución, decisiones de dominio/arquitectura y pruebas ejecutadas. Solicitar revisión antes de integrar.
- Solo integrar a `main` mediante PR aprobado y con CI verde. No hacer merge, push o publicar cambios sin autorización explícita para esa operación.

## Verificación del proyecto

Antes del PR, ejecutar según el alcance: `pnpm test`, `pnpm lint` y `pnpm build`. Si cambia contenido jurídico, confirmar revisión humana y fuentes oficiales; si cambia arquitectura, comprobar si corresponde actualizar un ADR.

## Resultado esperado

Dejar el trabajo en una rama de desarrollo limpia y trazable, o entregar un diagnóstico preciso si el estado local impide continuar. Nunca usar comandos destructivos para “limpiar” el repositorio.
