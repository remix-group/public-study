# Contribuir a DIAN Study Platform

## Preparación

1. Instala Node.js 20+, pnpm y Docker.
2. Ejecuta `cp .env.example .env`.
3. Ejecuta `pnpm install`.
4. Levanta PostgreSQL con `docker compose up -d postgres`.
5. Aplica migraciones y datos demo:

```bash
pnpm --filter @dian-study/infrastructure db:generate
pnpm --filter @dian-study/infrastructure db:migrate:deploy
pnpm --filter @dian-study/infrastructure db:seed
```

6. Inicia el proyecto con `pnpm dev`.

## Flujo de trabajo

- Crea una rama desde `main`: `feature/<descripcion>` o `fix/<descripcion>`.
- Mantén cada cambio enfocado y acompáñalo con pruebas relevantes.
- No confirmes `.env`, credenciales, tokens, bases de datos ni artefactos generados.
- Actualiza el modelo de dominio si introduces o modificas entidades.
- Añade un ADR para decisiones arquitectónicas significativas.
- Las fuentes jurídicas oficiales prevalecen sobre contenido generado o interpretado.
- Todo contenido jurídico nuevo debe entrar como borrador y recibir revisión humana antes de publicarse.

## Verificación antes de abrir un pull request

```bash
pnpm test
pnpm lint
pnpm build
```

Para ejecutar las pruebas de integración de API, configura `DATABASE_URL` y aplica primero migraciones y seed.

## Pull requests

Describe:

- Problema y resultado esperado.
- Cambios de dominio o arquitectura.
- Pruebas ejecutadas.
- Fuentes oficiales utilizadas si cambia contenido jurídico.
- Capturas si cambia la experiencia visual.
