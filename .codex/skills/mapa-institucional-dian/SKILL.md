---
name: mapa-institucional-dian
description: "Diseña, implementa y mantiene mapas institucionales para plataformas de estudio DIAN, extrayendo entidades, jerarquías, funciones, competencias y relaciones desde una base documental jurídica. No aplica para consultas institucionales generales sin relación con el desarrollo o los materiales de la plataforma."
---

# Mapa institucional DIAN

Ayuda a desarrollar una vista institucional de una plataforma de estudio para el concurso de méritos de la DIAN. El resultado debe permitir comprender qué entidades aparecen en el corpus de estudio, qué funciones cumplen, cómo se relacionan y qué normas sustentan cada dato.

## Alcance y fuente de verdad

- Usa como fuente principal los archivos, registros, leyes, normas, cartillas y metadatos OPEC que el usuario proporcione o que ya existan en el proyecto.
- No inventes entidades, jerarquías, funciones, competencias, vigencias ni relaciones. Si un dato no está demostrado por el corpus, márcalo como `no_confirmado` o solicita la fuente.
- No conviertas una relación funcional en una relación jerárquica. Distingue dependencia, adscripción, coordinación, regulación, vigilancia, control, cooperación y participación.
- Conserva la trazabilidad hasta la fuente: documento, disposición, artículo, página o identificador disponible.
- No mezcles nombres parecidos sin comprobar que representan la misma entidad. Mantén alias y nombre oficial por separado.
- La consulta web o conocimiento externo solo puede incorporarse si el usuario lo solicita expresamente; debe quedar identificado como fuente externa y separado del corpus de estudio.

## Modos de trabajo

Identifica el modo solicitado y entrega solo lo necesario:

1. **Descubrimiento del corpus:** inventaría documentos y detecta entidades, dependencias, funciones, relaciones y objetivos OPEC mencionados.
2. **Modelado:** propone o adapta tablas, tipos, índices, API y JSON siguiendo `references/modelo-datos.md`.
3. **Implementación:** inspecciona primero el stack y las convenciones existentes; después construye la vista, componentes, consultas y estados de carga, vacío y error.
4. **Integración jurídica:** enlaza cada entidad, función y relación con `provisionId`, `objectiveId` y la fuente documental disponible.
5. **Auditoría:** busca duplicados, relaciones sin evidencia, nombres inconsistentes, fuentes faltantes, ciclos jerárquicos y datos obsoletos.
6. **Experiencia de estudio:** diseña filtros, búsqueda, comparación, fichas, navegación desde la norma y preguntas de práctica sin sacrificar la fuente jurídica.

## Modelo funcional recomendado

Cuando el usuario no indique otra prioridad, diseña cuatro vistas conectadas:

- **Árbol jerárquico:** muestra niveles y entidad superior.
- **Grafo de relaciones:** muestra relaciones no jerárquicas con etiquetas y leyenda.
- **Ficha de entidad:** nombre, tipo, nivel, funciones, competencias, relaciones, fuentes, documentos y objetivos OPEC.
- **Explorador jurídico:** desde una disposición permite ver las entidades y funciones extraídas, y desde una entidad permite volver a la evidencia.

Incluye búsqueda por nombre y alias, filtros por tipo de entidad, función, documento, objetivo OPEC y nivel de confianza. En dispositivos pequeños, prioriza la ficha y una lista de relaciones sobre un grafo ilegible.

## Flujo de implementación

1. Inspecciona la estructura real del proyecto, esquema de datos, componentes reutilizables y estrategia de pruebas.
2. Describe brevemente el modelo actual y cualquier incompatibilidad antes de modificarlo.
3. Extrae o transforma los datos sin destruir registros existentes; conserva identificadores estables.
4. Implementa la vista con estados de carga, vacío, error, entidad no encontrada y evidencia incompleta.
5. Verifica que cada afirmación visible pueda abrir su fuente y que los filtros no oculten silenciosamente datos.
6. Ejecuta las pruebas y validaciones disponibles; reporta archivos modificados, comandos ejecutados y pendientes.

## Contrato de salida

Para tareas de análisis, devuelve primero hallazgos y luego una propuesta accionable. Para tareas de código, modifica únicamente lo solicitado y entrega un resumen breve con validación. Si el usuario pide JSON, devuelve JSON válido y respeta exactamente su esquema.

Cuando falte información crítica —por ejemplo, el esquema de la base de datos, el framework o la ubicación del corpus— pide únicamente esa información. Si es posible avanzar sin ella, presenta una propuesta adaptable y señala los supuestos.

Lee `references/modelo-datos.md` cuando debas diseñar o revisar el esquema, una API, una importación o la trazabilidad jurídica.
