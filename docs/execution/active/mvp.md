# MVP Execution Plan

## Objective
Crear un vertical funcional de **Cobro Coactivo** que valide el modelo de dominio completo: desde la ingestión jurídica controlada hasta el motor de aprendizaje y la actualización de dominio (*mastery*) del estudiante.

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

## Phase 6: AI Gateway / Tutor
- [ ] Integrar proveedor LLM a través de una abstracción.
- [ ] Habilitar feedback automático para el estudiante basado en la evidencia jurídica.

## Phase 7: Legal Ingestion (MVP Scope)
- [ ] Parsear fragmentos controlados (Estatuto Tributario, CGP, Ley 1066).
- [ ] Extraer artículos relacionados a Cobro Coactivo y persistirlos.

## Definition of Done (DoD)
- [x] El estudiante puede iniciar una sesión y practicar preguntas de Cobro Coactivo.
- [x] Sus aciertos y errores actualizan su nivel de *mastery*.
- [x] Todos los tests de aceptación definidos en `docs/testing/mvp-acceptance.md` pasan en verde.
- [x] El código refleja y respeta la arquitectura y el dominio.
