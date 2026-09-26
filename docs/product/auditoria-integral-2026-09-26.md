# Auditoría integral de la plataforma DIAN Estudio

**Fecha:** 26 de septiembre de 2026

**Alcance:** aplicación web, API, datos de estudio, corpus jurídico, seguridad, pruebas, integración continua y operación local.

**Método:** recorrido autenticado de la aplicación, inspección de código y configuración, consulta de la base local y ejecución de la suite automatizada.
**Límite:** esta es una auditoría de producto y de ingeniería; no sustituye la revisión jurídica de fondo por un abogado o revisor normativo competente, ni una prueba de penetración externa.

## Resultado ejecutivo

La plataforma funciona como un **MVP demostrable**: permite autenticarse, recorrer la ruta, abrir lecturas, consultar transcripciones, resolver preguntas, registrar progreso y navegar hacia la fuente vinculada. La suite actual pasó (**52 pruebas en 10 archivos**), y la compilación de producción fue satisfactoria.

No está lista para presentarse como plataforma jurídica completa ni para una publicación abierta. El principal problema no es visual: el sistema permite practicar **29 de 42 preguntas publicadas (69%)** con evidencia que sigue pendiente de revisión editorial. Además, el usuario demo público posee rol editor, capaz de modificar fuentes, aprobar unidades y publicar material. La ruta exhibe 25 temas, pero 11 no tienen preguntas y no generan práctica ni progreso verificable.

### Semáforo de salida

| Dimensión | Estado | Veredicto |
|---|---|---|
| Flujo básico de estudio | Amarillo | Funciona, pero la cobertura es desigual. |
| Calidad jurídica y trazabilidad | Rojo | No debe afirmarse que el contenido completo esté validado. |
| Seguridad para uso público | Rojo | Requiere endurecimiento antes de exponerla fuera del entorno local. |
| Pruebas automatizadas | Amarillo | La base unitaria/integración pasa, pero falta validar la experiencia real. |
| Operación y despliegue | Rojo | Configuración adecuada para desarrollo local, insuficiente para producción. |
| Accesibilidad y UX | Amarillo | Hay bases correctas, pero faltan validación y varios recorridos. |

## Evidencia cuantitativa observada

| Indicador | Valor observado | Consecuencia |
|---|---:|---|
| Documentos jurídicos | 40 | Corpus amplio, pero sin madurez editorial homogénea. |
| Documentos publicados | 1 | Solo el 2,5% está marcado como publicado. |
| Unidades jurídicas | 14.409 | Volumen suficiente para requerir proceso de revisión y rendimiento escalable. |
| Unidades aprobadas/publicadas | 4 | La mayor parte del corpus no debe considerarse fuente validada. |
| Preguntas publicadas | 42 | Hay práctica disponible en parte de la ruta. |
| Preguntas con fuente pendiente | 29 | La publicación de la pregunta no es una garantía de revisión jurídica. |
| Casos almacenados | 28 | Se muestran, pero no hay flujo de intento/evaluación de caso. |
| Temas activos | 25 | La ruta está completa visualmente, no pedagógicamente. |
| Temas sin preguntas | 11 | Temas 1–10 y 25: solo material, sin práctica. |
| URLs oficiales cargadas | 1 de 40 | La trazabilidad externa es insuficiente. |
| Documentos con vigencia inicial informada | 1 de 40 | No hay control operativo de vigencia normativa. |
| Relaciones normativas registradas | 1 | El mapa normativo no representa aún cambios, derogaciones o remisiones relevantes. |

## Hallazgos priorizados

La prioridad **P0** bloquea una publicación abierta o una afirmación de calidad jurídica. **P1** debe resolverse antes de ampliar usuarios. **P2** mejora la confiabilidad, escala o experiencia. **P3** es deuda de producto planificable.

### P0 — Bloqueadores de calidad jurídica y seguridad

#### A-01. Se publican preguntas apoyadas en fuentes pendientes de revisión

**Evidencia.** De las 42 preguntas publicadas, 29 están asociadas a unidades con `validationStatus=pending` y `editorialStatus=draft`. Ocurre en los temas 11, 12 y 14–24. En la interfaz se pueden iniciar estas preguntas aunque la lectura advierte “Material en revisión”.

**Impacto.** El estudiante recibe una respuesta como correcta o incorrecta, se modifica su dominio y se programa un repaso con base en material cuya validez editorial no está aprobada. Es incompatible con la promesa de evidencia jurídica confiable.

**Causa.** El seed publica preguntas curadas sin exigir que la evidencia esté aprobada. La consulta de práctica filtra por estado de la pregunta y existencia de evidencia, no por estado de la unidad fuente. Véanse [material-seed.ts](../../packages/infrastructure/prisma/material-seed.ts) y [study-session-progress.ts](../../apps/api/src/application/study-session-progress.ts).

**Corrección requerida.** Introducir una regla única de publicación: una pregunta o caso solo puede estar disponible si **todas** sus evidencias están aprobadas, publicadas y vigentes. Migrar las 29 preguntas a borrador o rotularlas como práctica no calificada hasta la aprobación humana. Añadir una prueba de integración que impida la regresión.

#### A-02. La generación automática aprueba fuentes y publica preguntas sin revisión humana

**Evidencia.** `generateDocumentStudyMaterial` cambia unidades pendientes a `approved/published`, crea evidencia, guarda preguntas con `editorialStatus: "published"` y deja el documento `PUBLISHED` en la misma operación. Véase [automated-content.ts](../../apps/api/src/application/automated-content.ts).

**Impacto.** Una salida de IA o una importación manual puede convertir automáticamente una fuente pendiente en fuente jurídica publicada. El control de confianza del modelo (`>=0.8`) no reemplaza una revisión jurídica; además, la confianza es autodeclarada por el modelo.

**Corrección requerida.** Separar estrictamente: extracción → borrador de unidad → revisión humana de fuente → evidencia aprobada → borrador de pregunta → revisión editorial → publicación. La IA debe crear borradores, nunca aprobar ni publicar. Registrar autor, revisor, fecha, motivo y versión revisada en cada transición.

#### A-03. Corpus sin trazabilidad externa ni control de vigencia suficiente

**Evidencia.** Solo 1 de 40 documentos tiene URL oficial; 39 carecen de `effectiveFrom`, 39 tienen estado de vigencia pendiente y solo existe una relación normativa. El catálogo también muestra metadatos degradados o inconsistentes, como títulos truncados o genéricos.

**Impacto.** No se puede demostrar al estudiante qué versión oficial respalda la explicación, detectar normas modificadas ni asegurar que una respuesta continúa vigente.

**Corrección requerida.** Crear un registro de procedencia obligatorio por documento: URL oficial verificable, entidad emisora, fecha de consulta, fecha de vigencia, versión, hash, responsable de revisión y estado. Crear relaciones de modificación/derogación/remisión para las disposiciones realmente usadas. Incorporar una revisión periódica de vigencia y bloquear práctica cuando una fuente caduque o quede en duda.

#### S-01. Credenciales de editor demostrativo son públicas y persistentes

**Evidencia.** La interfaz y el README muestran `demo@dian-study.local` y su contraseña; el seed asigna a esa cuenta el rol `editor`. Ese rol permite cargar PDFs, aprobar unidades, crear evidencia, generar/importar material y publicar preguntas.

**Impacto.** En cualquier despliegue accesible, una persona no autorizada podría alterar el corpus y el banco de preguntas. Repetir el seed restablece también la cuenta demo.

**Corrección requerida.** No desplegar esa cuenta fuera de desarrollo. Crear datos demo solo bajo un perfil de entorno explícito, sin permisos editoriales; obligar a configurar el primer administrador mediante secreto de despliegue; rotar las credenciales actuales; impedir que el seed de producción cree o restablezca contraseñas.

#### S-02. Configuración de despliegue no es segura para exposición pública

**Evidencia.** PostgreSQL publica el puerto 5432 con usuario/contraseña conocidos en [docker-compose.yml](../../docker-compose.yml); la aplicación usa HTTP local y `COOKIE_SECURE=false`; Express configura CORS abierto y no instala cabeceras de seguridad, rate limit ni protección CSRF explícita.

**Impacto.** Riesgo de acceso a base de datos, ataques de fuerza bruta, exposición de sesión en una configuración HTTPS incorrecta y superficie innecesaria para aplicaciones externas.

**Corrección requerida.** Separar configuración local y producción; no publicar PostgreSQL; usar secretos gestionados y credenciales únicas; terminar TLS en un proxy; activar cookies `Secure`, HSTS, CSP, `X-Frame-Options`, `Referrer-Policy` y `X-Content-Type-Options`; restringir CORS a dominios permitidos; limitar intentos de login y registrar alertas. Añadir protección CSRF si se conserva autenticación por cookie.

### P1 — Funcionalidad de aprendizaje y control editorial

#### L-01. La ruta completa no tiene cobertura práctica completa

**Evidencia.** Temas 1–10 y 25 tienen cero preguntas y cero casos. Los temas 12 y 15–24 tienen dos preguntas cada uno; el tema 13 concentra cuatro objetivos y nueve preguntas; el 11 tiene seis.

**Impacto.** El usuario ve 25 temas disponibles, pero no puede practicar ni generar dominio en 11 de ellos. La ruta no puede medir preparación integral para la OPEC.

**Corrección requerida.** Definir un mínimo de publicación por objetivo: fuente aprobada, lectura estructurada, al menos un ejemplo, un caso evaluable y un banco mínimo de preguntas con distribución de dificultad. Mostrar “en preparación” en la ruta hasta satisfacer el mínimo, o separar “biblioteca” de “ruta evaluable”.

#### L-02. La etiqueta “preguntas revisadas” es engañosa

**Evidencia.** En varios temas la cabecera muestra “2 preguntas revisadas”, aunque sus fuentes se presentan en la misma pantalla como “Material pendiente de revisión”. El contador se deriva del estado de publicación de la pregunta, no del estado de la fuente.

**Impacto.** Disminuye la confianza del estudiante y puede inducirlo a asumir una validación que no existe.

**Corrección requerida.** Renombrar temporalmente a “preguntas disponibles” y solo usar “revisadas” cuando pregunta, explicación y todas las fuentes estén aprobadas por un revisor identificado.

#### L-03. Los casos situacionales no son evaluables

**Evidencia.** Existen 28 casos y el dominio modela `CaseAttempt`, pero la interfaz solo expone “Ver análisis esperado”. No hay endpoint, interacción ni evaluación para guardar un intento de caso; el modo `CASE` termina solicitando preguntas de opción múltiple.

**Impacto.** Se promete aplicación situacional sin medir razonamiento ni producir diagnóstico de interpretación de caso.

**Corrección requerida.** Implementar una sesión de caso: presentación de hechos, respuesta abierta o selección razonada, rúbrica, comparación con criterios, registro de `CaseAttempt`, error diagnosticado y ajuste de dominio. No activar el modo `CASE` hasta que el flujo exista.

#### L-04. La selección de competencia exigida por el MVP no existe en la experiencia

**Evidencia.** El requisito FR-001 indica que el usuario puede seleccionar competencia. La base tiene una sola competencia activa y la interfaz fija `competency-cobro-coactivo`; no hay selector.

**Impacto.** La plataforma no puede escalar a varias OPEC, áreas o perfiles sin reescritura de navegación y sesión.

**Corrección requerida.** Modelar la matrícula o selección de OPEC/competencia por estudiante, exponer un selector y eliminar la constante de competencia del cliente.

#### L-05. El desbloqueo temporal quedó en código de producción

**Evidencia.** `OPEN_CURRICULUM = true` habilita todos los temas y transforma temas bloqueados en disponibles en cada carga de tablero. La razón está documentada como temporal.

**Impacto.** La progresión y sus umbrales dejan de operar como mecanismo real; también se oculta si la ruta puede desbloquearse correctamente.

**Corrección requerida.** Moverlo a una bandera de configuración solo de demo, con fecha de retiro y prueba para ambos modos. En producción, el estado debe depender de reglas de progresión y de la disponibilidad real de material aprobado.

#### L-06. La recomendación puede priorizar objetivos sin material validado

**Evidencia.** El tablero recomienda el objetivo disponible con menor dominio; si no hay preguntas, deriva a lectura. La fuente puede estar pendiente y la ruta sigue mostrando el tema como disponible.

**Impacto.** El primer contacto del estudiante puede ser con contenido no validado, aun cuando se usa la plataforma como preparación normativa.

**Corrección requerida.** Distinguir “explorable” de “apto para estudio evaluable”; el recomendador debe priorizar material aprobado y explicar cuando no exista contenido apto.

### P1 — Seguridad, roles y manejo de contenido

#### S-03. No hay separación de roles de autor, revisor y publicador

**Evidencia.** Todo usuario `editor` puede registrar documentos, aprobar unidades, crear evidencia, importar generación y publicar preguntas.

**Impacto.** No existe control de cuatro ojos para contenido jurídico. Una cuenta comprometida o un error editorial puede publicar material de inmediato.

**Corrección requerida.** Crear roles separados: autor de contenido, revisor jurídico, editor de preguntas y administrador. Requerir aprobación de otro usuario para publicar fuente o pregunta y conservar una bitácora inmutable de cambios.

#### S-04. Ingesta de PDF síncrona y con controles mínimos

**Evidencia.** El endpoint acepta hasta 25 MB y comprueba la cabecera `%PDF-`; luego ejecuta `pdftotext` síncronamente dentro del proceso API.

**Impacto.** PDFs complejos pueden bloquear capacidad de atención, y faltan controles de antivirus, cuota, tiempo máximo, aislamiento y reporte de extracción insegura.

**Corrección requerida.** Encolar la ingesta en un worker aislado, imponer cuota por usuario/documento, límite de tiempo y memoria, análisis de archivo, almacenamiento no ejecutable y estados recuperables. Presentar progreso y errores recuperables al editor.

#### S-05. Falta de controles de abuso y ciclo de cuenta

**Evidencia.** Registro abierto, sesiones de siete días, sin limitación de intentos, recuperación de contraseña, verificación de correo, cierre global de sesiones ni política de contraseña más allá de longitud 10.

**Impacto.** Riesgo de cuentas automatizadas, fuerza bruta y dificultad para responder ante una cuenta comprometida.

**Corrección requerida.** Añadir rate limiting, verificación de correo si se publica, recuperación y rotación de credenciales, revocación de todas las sesiones, bloqueo progresivo y métricas de autenticación.

### P2 — Experiencia, accesibilidad y datos

#### U-01. La administración documental no escala visualmente

**Evidencia.** La pantalla “Fuentes” carga una lista larga de 40 documentos de una vez y permite hasta 200 unidades en el panel administrativo; varios títulos importados son poco legibles o ambiguos.

**Impacto.** La revisión humana es lenta y aumenta el riesgo de aprobar la unidad equivocada. Con más documentos, el rendimiento y la navegabilidad empeorarán.

**Corrección requerida.** Paginar, filtrar por estado, autoridad, tipo y fecha; normalizar títulos; mostrar cola de revisión con prioridad; añadir búsqueda de unidad, vista previa de contexto, comparación de versiones y acciones masivas seguras.

#### U-02. Accesibilidad no está validada de extremo a extremo

**Evidencia.** Hay buenas bases (etiquetas, `aria-expanded`, roles en preguntas y modo de movimiento reducido), pero también tarjetas administrativas clicables que no son controles semánticos y no hay pruebas con lector de pantalla, teclado, contraste o herramientas automatizadas.

**Impacto.** Usuarios que navegan con teclado o tecnologías de apoyo pueden no acceder de forma equivalente a administración, mapa normativo y algunos controles complejos.

**Corrección requerida.** Sustituir tarjetas clicables por botones o enlaces, añadir foco visible, navegación de flechas para el grupo de opciones, nombres accesibles de todos los controles y pruebas automatizadas con axe. Hacer revisión manual con teclado y lector de pantalla antes de publicar.

#### U-03. Estado de navegación no es compartible ni recuperable

**Evidencia.** La aplicación mantiene pantalla, documento, tema y objetivo en estado React local; no hay rutas URL para guía, tema, extracto o biblioteca.

**Impacto.** Recargar vuelve a la portada, no se pueden compartir enlaces a una lectura o fuente, y el soporte no puede reproducir con precisión un problema enviado por un estudiante.

**Corrección requerida.** Implementar enrutamiento con URL para OPEC, tema, objetivo, biblioteca y unidad jurídica; preservar filtros y retorno a la guía.

#### D-01. Metadatos importados requieren normalización

**Evidencia.** En el catálogo aparecen títulos como `83-039-0089`, texto de atribución como título, variantes duplicadas de Ley 1755 y errores ortográficos heredados.

**Impacto.** Baja encontrabilidad, selección errónea de fuentes y presentación poco profesional.

**Corrección requerida.** Crear una cola de normalización: título canónico, nombre de archivo, tipo, autoridad, identificador normativo, fecha y URL oficial. Detectar duplicados por hash y por identidad normativa antes de publicar.

### P2 — Arquitectura, rendimiento y operación

#### O-01. Las tareas pesadas y la revisión de vigencia no tienen workers

**Evidencia.** La arquitectura menciona workers, pero la ingesta PDF ocurre en la API. No existe un proceso programado que consulte vigencia, reprocese extracción o notifique al revisor.

**Impacto.** Riesgo de lentitud, trabajo manual recurrente y pérdida de actualización normativa.

**Corrección requerida.** Implementar cola y worker para ingesta, OCR cuando corresponda, normalización, revisión de URLs oficiales y alertas de cambio. Definir reintentos, idempotencia y dashboard operativo.

#### O-02. Consultas que cargan colecciones completas limitarán el crecimiento

**Evidencia.** El tablero escribe progreso de todos los temas al consultarse. La biblioteca carga todos los documentos y todas las unidades del documento seleccionado para calcular posiciones; el catálogo administrativo recupera hasta 200 unidades sin paginación editorial.

**Impacto.** Con más OPEC, usuarios y corpus, aumentarán latencia, escrituras innecesarias y consumo de memoria.

**Corrección requerida.** Evitar escrituras durante lecturas de tablero, calcular progreso bajo demanda o por evento, usar paginación con cursor/posición persistida e índices de búsqueda. Medir p95 de API y tamaño de respuestas antes de ampliar el corpus.

#### O-03. Falta una estrategia de producción y recuperación

**Evidencia.** Compose local dispone de healthchecks, pero no hay configuración de secretos, backup/restore, retención, observabilidad, alertas, límites de recursos, política de despliegue ni entorno de staging.

**Impacto.** No hay garantía de recuperación ante pérdida de datos, ni diagnóstico oportuno de fallos o degradación.

**Corrección requerida.** Definir ambientes `dev/staging/prod`, gestor de secretos, base administrada o backups automáticos cifrados con restauración probada, logs estructurados, métricas, trazas, alertas, límites de CPU/memoria, imágenes no privilegiadas y runbook de incidentes.

#### O-04. No hay análisis de dependencias ni seguridad en CI

**Evidencia.** La CI ejecuta migración, seed, pruebas, lint y build, pero no SAST, auditoría de dependencias, escaneo de imagen, cobertura mínima, pruebas de accesibilidad ni prueba de restauración. Tampoco se ejecuta en `develop`.

**Impacto.** Los cambios que se integran o publican desde `develop` pueden no recibir la misma garantía automática que `main`; vulnerabilidades y regresiones de navegación pasan desapercibidas.

**Corrección requerida.** Ejecutar CI en `develop` y en cada pull request relevante; añadir `pnpm audit`/Dependabot, SAST, escaneo de contenedor, pruebas E2E, axe, cobertura y gates de migración/seed.

### P2 — Pruebas y consistencia de producto

#### Q-01. Las pruebas pasan, pero su alcance no cubre la experiencia crítica

**Evidencia.** Ejecutadas 52 pruebas exitosas en 10 archivos: dominio, motor, API e integración. Solo hay un archivo de pruebas web con dos pruebas de formato; no existen suites Playwright/Cypress/E2E.

**Impacto.** No se valida automáticamente inicio de sesión, ruta, lectura, enlace de fuente, práctica, feedback, caso, móvil, permisos editoriales ni accesibilidad.

**Corrección requerida.** Añadir E2E para los criterios AC-001/002/003, guías, biblioteca, flujo de fuente, roles y errores. Usar datos de prueba aislados y verificar que una fuente pendiente no habilita práctica.

#### Q-02. Criterios de aceptación y producto están desalineados con el alcance actual

**Evidencia.** Los requisitos del MVP son breves y describen selección de competencia, casos y progreso; el README aún describe un vertical de cobro coactivo y diez preguntas, mientras la aplicación ya expone 25 temas, biblioteca y generación asistida.

**Impacto.** No hay definición verificable de “completo”, ni regla de salida para cada tema, ni acuerdo sobre qué funciones deben estar listas para un lanzamiento.

**Corrección requerida.** Actualizar requisitos, criterios de aceptación y README. Definir por tema: fuentes oficiales, revisión, número de preguntas, casos, objetivos, estados de disponibilidad y responsable jurídico/editorial.

## Recomendación de plan de cierre

### Fase 0 — Contención inmediata (1–3 días)

1. Retirar o degradar la cuenta demo editor y cambiar credenciales.
2. Deshabilitar la práctica de preguntas con fuente pendiente; no llamarles revisadas.
3. Desactivar publicación automática de fuente/pregunta desde IA e importación manual.
4. Marcar la plataforma como entorno de demostración mientras existan fuentes pendientes.
5. No exponer PostgreSQL, ni el sitio, a Internet con el `docker-compose.yml` actual.

### Fase 1 — Base jurídica y editorial (1–3 semanas)

1. Normalizar las 40 fuentes y asignar URL oficial, vigencia, autoridad y responsable.
2. Establecer flujo de doble revisión con bitácora.
3. Revisar y aprobar por prioridad los temas que ya tienen preguntas; empezar por 11–24.
4. Completar o retirar temporalmente los temas 1–10 y 25 de la ruta evaluable.
5. Definir banco mínimo por objetivo y publicar casos realmente evaluables.

### Fase 2 — Seguridad y producto (2–5 semanas)

1. Implementar roles separados, controles de sesión y limitación de abuso.
2. Crear rutas URL, selector de competencia/OPEC y navegación recuperable.
3. Implementar flujo de `CaseAttempt` y retroalimentación basada en rúbrica.
4. Construir panel de revisión editorial, vigencia y calidad de preguntas.
5. Añadir pruebas E2E, accesibilidad y regresión de fuente jurídica.

### Fase 3 — Operación y escala (4–8 semanas)

1. Separar desarrollo, staging y producción; establecer CI también para `develop`.
2. Pasar ingesta y seguimiento normativo a workers con cola.
3. Implementar observabilidad, backup/restore probado, gestión de secretos y límites de recursos.
4. Medir rendimiento, calidad de distractores, tasa de error por pregunta, finalización y retención.

## Criterio objetivo para declarar la plataforma lista

No debe considerarse lista hasta que se cumplan, como mínimo, estas condiciones:

1. Cero preguntas o casos publicados con evidencia pendiente, rechazada o sin vigencia confirmada.
2. Cero credenciales administrativas públicas; roles y auditoría de cambios activos.
3. Toda fuente usada en estudio tiene URL oficial o justificación documentada, hash, versión, fecha y revisor.
4. Cada tema visible como “evaluable” cumple su mínimo pedagógico aprobado.
5. Los casos situacionales se registran y evalúan o se presentan claramente solo como lectura.
6. Pruebas E2E y de accesibilidad cubren el recorrido de estudiante y controles editoriales.
7. CI protege `develop` y `main`; producción tiene secretos, TLS, backups y monitoreo.

## Verificaciones realizadas

- Recorrido visual de portada, temas con y sin preguntas, lectura guiada, fuentes, biblioteca y panel editorial.
- Verificación del nuevo enlace de cada extracto hacia su unidad documental exacta.
- Consulta de estados de documentos, unidades, preguntas, casos, vigencia y relaciones en PostgreSQL.
- Revisión de autenticación, roles, ingesta, generación asistida, progreso, CI y configuración de contenedores.
- Ejecución de `pnpm test` dentro del contenedor: **52 pruebas aprobadas**.
- Compilación de producción de paquetes web, API, dominio, infraestructura y aprendizaje: aprobada durante la reconstrucción de contenedores.
