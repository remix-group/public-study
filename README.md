# DIAN Study Platform

MVP de aprendizaje adaptativo para practicar una OPEC de la DIAN. El vertical actual cubre una sesión de **Cobro Coactivo**, una pregunta respaldada por evidencia jurídica, evaluación, registro de errores, actualización de dominio y programación de revisión.

## Requisitos

- Docker Engine
- Docker Compose v2

Node.js y pnpm no son necesarios en la máquina para ejecutar la plataforma. Las versiones estándar están fijadas en el contenedor (`Node.js 24.20.0` y `pnpm 11.23.0`).

## Ejecución con Docker

```bash
docker compose up --build
```

Compose inicia PostgreSQL, aplica las migraciones, carga el seed, inicia la API y sirve la interfaz. La aplicación queda disponible en `http://localhost:5173`; las solicitudes `/api` se resuelven internamente mediante Nginx. El seed carga 10 preguntas controladas sobre los artículos 823, 826, 828 y 837 del Estatuto Tributario.

Para ejecutar en segundo plano o consultar el estado:

```bash
docker compose up --build -d
docker compose ps
docker compose logs -f api web
```

Para detener el entorno conservando la base de datos y las fuentes cargadas:

```bash
docker compose down
```

La generación automática con OpenAI es opcional. Si se utiliza, define `OPENAI_API_KEY` en un archivo `.env` local; ese archivo está excluido de Git.

## Herramientas locales opcionales

Quienes necesiten ejecutar comandos fuera de Docker deben usar las versiones declaradas en `.node-version` y `packageManager`, e instalar siempre desde el lockfile:

```bash
pnpm install --frozen-lockfile
```

Cuenta de demostración:

```text
Correo: demo@dian-study.local
Contraseña: EstudioDIAN2026!
```

También se pueden crear cuentas desde la interfaz. El progreso se vincula a la sesión autenticada y los endpoints de estudio no aceptan identificadores de estudiante enviados por el cliente.

La cuenta demo tiene rol `editor` y muestra dos accesos en la barra superior:

- `Fuentes`: documentos, versiones, unidades jurídicas, evidencias y relaciones normativas.
- Dentro de `Fuentes`, la carga de un PDF oficial automatiza el hash, la extracción y la creación de artículos pendientes de revisión.

La pantalla principal es el espacio del estudiante: presenta el plan recomendado del día, dominio, repasos pendientes y práctica enfocada por objetivo.
Cada objetivo abre una lectura guiada con propósito, conceptos esenciales y texto normativo oficial antes de iniciar sus preguntas.

El panel `Fuentes` puede preparar un prompt para ChatGPT Plus e importar su JSON. Esta ruta no requiere API key y aplica las mismas validaciones automáticas que el proveedor directo.
- `Preguntas`: borradores, asociación con evidencia y publicación después de revisión.

## API del vertical

```http
POST /api/sessions
Content-Type: application/json

{"studentId":"student-demo","competencyId":"competency-cobro-coactivo"}
```

```http
POST /api/sessions/attempt
Content-Type: application/json

{"studentId":"student-demo","sessionId":"<session-id>","questionId":"question-et-823-1","answer":"A","timeSpentMs":5000,"confidence":0.8}
```

## Verificación

```bash
pnpm test
pnpm lint
pnpm build
```

La compilación de producción también se ejecuta durante la construcción reproducible de la imagen. Para validar exclusivamente la construcción de contenedores:

```bash
docker compose build
```

Con `DATABASE_URL` configurada, la suite de API ejecuta además la prueba de integración AC-001/002/003 contra PostgreSQL. Sin esa variable, esa prueba se omite.

## Colaboración

Las convenciones de ramas, pull requests, pruebas y manejo de contenido jurídico están en [CONTRIBUTING.md](CONTRIBUTING.md). GitHub Actions ejecuta migraciones, seed, tests, lint y build para cada pull request hacia `main`.
