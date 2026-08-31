# ADR-007: Generación automatizada de material mediante proveedor de IA

- Estado: aceptada
- Fecha: 2026-08-30

## Contexto

El único usuario del MVP prepara el examen en un plazo corto. La revisión manual de cada unidad y la creación individual de preguntas consumen tiempo que debe dedicarse al estudio.

## Decisión

La aplicación define `AiProvider` como contrato independiente del proveedor. La primera implementación usa OpenAI Responses API con salida estricta mediante JSON Schema. La clave y el modelo se configuran por entorno.

El proveedor recibe exclusivamente objetivos activos y texto jurídico extraído. La aplicación vuelve a validar identificadores, cuatro opciones diferentes, respuesta existente, evidencia vinculada y confianza mínima de 0.8. Solo los resultados que superan estas reglas se publican. El documento original, hash y evidencia permanecen como fuente de verdad.

Cuando no existe una API key, el mismo contrato admite un adaptador manual: la plataforma exporta el prompt para ChatGPT Plus y reingresa su JSON como resultado de proveedor. Las validaciones y persistencia posteriores son idénticas.

## Consecuencias

- El usuario puede generar material después de aportar una fuente oficial.
- Cambiar de proveedor no modifica el servicio de aplicación ni las rutas.
- Una fuente auténtica reduce el riesgo de procedencia, pero no elimina errores de interpretación; por eso se conservan validaciones deterministas y trazabilidad.
- Las llamadas reales requieren credenciales y pueden generar costes del proveedor.
