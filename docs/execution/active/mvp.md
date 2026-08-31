# MVP Execution Plan

## Objective
Construir automáticamente un core de preparación para la **OPEC 236828 — Analista I**, usando el vertical funcional de Cobro Coactivo como base técnica validada.

## Phase 8: OPEC 236828 Content Factory
- [x] Incorporar ficha oficial CT-CR-2013 y separar fuentes oficiales de guía orientativa.
- [x] Inventariar siete competencias funcionales y competencias básicas.
- [ ] Resolver y verificar URLs de autoridades emisoras.
- [ ] Descargar, versionar y segmentar automáticamente el corpus prioritario.
- [ ] Generar mapa completo de competencias, temas y objetivos.
- [ ] Crear lecturas, preguntas y casos situacionales con evidencia.
- [ ] Medir cobertura y rellenar automáticamente vacíos de contenido.
- [ ] Construir plan adaptativo de ocho semanas.

## Phase 1: Domain Model
- [x] Implementar entidades base (OPEC, Competency, Topic, LearningObjective).
- [x] Implementar entidades legales (LegalDocument, LegalProvision, LegalReference).
- [x] Implementar entidades de evaluación (Question, Attempt, Mistake).
- [x] Pruebas unitarias del modelo en memoria.

## Phase 2: Persistence
- [x] Configurar base de datos (PostgreSQL).
- [x] Crear migraciones iniciales para el esquema de dominio.
- [x] Implementar repositorios básicos.

## Phase 3: Learning Engine
- [x] Implementar cálculo inicial de *mastery*.
- [x] Implementar registro de progreso (`MasteryState`).
- [x] Implementar algoritmo base de repetición espaciada (`ReviewSchedule`).

## Phase 4: Questions & Cases
- [ ] Crear generador/extractor de preguntas estructuradas.
- [x] Conectar validación de respuestas contra la evidencia jurídica.

## Phase 5: Study Session
- [x] Orquestar el flujo API: Iniciar sesión -> Mostrar objetivo -> Presentar pregunta -> Registrar resultado.
- [x] Verificar el AC-001, AC-002 y AC-003 mediante prueba de integración.

## Phase 5.1: Validation Interface
- [x] Implementar interfaz React responsive para el vertical de Cobro Coactivo.
- [x] Mostrar feedback, evidencia jurídica, dominio y próxima revisión.

## Phase 5.2: Repeatable Study Cycle
- [x] Ampliar el banco controlado a 10 preguntas respaldadas por cuatro artículos.
- [x] Seleccionar preguntas no respondidas dentro de la sesión.
- [x] Finalizar sesiones y mostrar resumen de resultados.
- [x] Exponer dashboard de dominio, revisiones y sesiones recientes.
- [x] Mostrar una ruta completa para estudiantes nuevos y con progreso.
- [x] Recomendar la práctica diaria según repaso vencido o dominio más bajo.
- [x] Permitir práctica mixta o enfocada por objetivo de aprendizaje.
- [x] Incorporar lectura guiada con conceptos clave y evidencia jurídica validada antes de practicar.

## Phase 5.3: Multi-user Authentication
- [x] Implementar registro, ingreso, sesión persistente y cierre de sesión.
- [x] Derivar contraseñas con `scrypt` y almacenar únicamente hashes de tokens.
- [x] Obtener la identidad desde cookie `HttpOnly` en todos los flujos protegidos.
- [x] Verificar rechazo anónimo y aislamiento por propietario de sesión.

## Phase 5.4: Editorial Control
- [x] Añadir roles de estudiante y editor.
- [x] Implementar estados `draft`, `published` y `archived` para preguntas.
- [x] Crear panel de borradores con objetivo, opciones, explicación y evidencia.
- [x] Registrar editor y fecha de aprobación al publicar.
- [x] Impedir que preguntas no publicadas aparezcan en sesiones.

## Phase 5.5: Knowledge Core
- [x] Registrar documentos oficiales y estado explícito del pipeline.
- [x] Gestionar versiones temporales y versión actual.
- [x] Modelar unidades jurídicas jerárquicas con tipo, anchor y validación.
- [x] Aprobar o rechazar unidades antes de crear evidencia.
- [x] Registrar relaciones normativas explícitas entre unidades.
- [x] Integrar el panel de fuentes con el panel editorial de preguntas.

## Phase 6: AI Gateway / Tutor
- [x] Integrar proveedor LLM a través de una abstracción.
- [x] Generar preguntas estructuradas desde evidencia jurídica y publicarlas tras validación automática.
- [x] Exportar prompts e importar JSON de ChatGPT Plus sin requerir API key.
- [ ] Habilitar feedback automático para el estudiante basado en la evidencia jurídica.

## Phase 7: Legal Ingestion (MVP Scope)
- [x] Cargar PDF oficial con validación, hash SHA-256 y conservación del original.
- [x] Extraer texto y segmentar automáticamente artículos como unidades pendientes.
- [x] Proteger contenido aprobado durante una reingesta.
- [ ] Añadir OCR para fuentes escaneadas sin capa de texto.
- [ ] Migrar el procesamiento a una cola y almacenamiento de objetos para despliegue compartido.

## Definition of Done (DoD)
- [x] El estudiante puede iniciar una sesión y practicar preguntas de Cobro Coactivo.
- [x] Sus aciertos y errores actualizan su nivel de *mastery*.
- [x] Todos los tests de aceptación definidos en `docs/testing/mvp-acceptance.md` pasan en verde.
- [x] El código refleja y respeta la arquitectura y el dominio.
