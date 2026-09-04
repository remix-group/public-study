# ADR-010 — Entorno de ejecución completamente contenerizado

## Estado

Aceptado.

## Contexto

El proyecto ejecutaba PostgreSQL con Docker, pero requería Node.js y pnpm instalados en cada máquina para iniciar API y web. Esto permitía diferencias entre integrantes y hacía que el resultado dependiera de versiones globales no controladas.

## Decisión

El entorno estándar del equipo se ejecuta con Docker Compose:

- PostgreSQL usa una versión exacta de la imagen oficial.
- La API se construye con una versión exacta de Node.js y pnpm, respetando `pnpm-lock.yaml` mediante `pnpm install --frozen-lockfile`.
- Un contenedor efímero aplica migraciones y ejecuta el seed antes de iniciar la API.
- La web se compila en la misma etapa reproducible y se sirve con Nginx, que también redirige `/api` hacia la API.
- Los documentos jurídicos cargados y la base de datos usan volúmenes persistentes separados.
- `packageManager`, `engines` y `.node-version` reflejan las mismas versiones usadas por la imagen.

El acceso local se realiza por `http://localhost:5173`; solo PostgreSQL y la web publican puertos al host. La API queda accesible para el navegador mediante el proxy interno de Nginx.

## Consecuencias

- Docker y Docker Compose son los únicos requisitos para ejecutar la plataforma completa.
- Las instalaciones del host dejan de influir en el runtime estándar.
- Un cambio de dependencias debe actualizar deliberadamente `package.json` y `pnpm-lock.yaml`.
- Cambiar versiones base requiere modificar de forma coordinada Dockerfile, Compose y metadatos del proyecto.
- El primer build descarga imágenes y dependencias; los siguientes reutilizan la caché de Docker.
