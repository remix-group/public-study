# Informe de propuesta: Biblioteca documental fiel y ordenada

## 1. Propósito

Este informe define la actualización de la biblioteca de información de public-study. La biblioteca debe permitir consultar el corpus incorporado a la base de datos de forma lineal, legible, verificable e intuitiva, sin inventar, completar ni alterar silenciosamente el contenido de las fuentes.

La propuesta se apoya en el modelo ya adoptado por el proyecto: `LegalDocument`, `LegalVersion`, `LegalProvision` y `Evidence`. No se propone crear una segunda biblioteca ni una entidad paralela.

## 2. Resultado esperado

Una persona debe poder:

1. identificar el documento original por su nombre exacto;
2. saber qué versión está consultando, de dónde proviene y cuál es su hash;
3. recorrer el contenido en el mismo orden documental en que fue incorporado;
4. distinguir texto original, texto pendiente de revisión y contenido aprobado;
5. buscar una unidad por número, título o texto sin perder el contexto;
6. verificar que la aplicación no añadió información que no estaba en la fuente;
7. entender rápidamente si está leyendo una norma, un manual, una ruta de aprendizaje o una extracción pedagógica.

## 3. Principios no negociables

### 3.1 Fidelidad a la fuente

La base de datos debe conservar el contenido extraído sin modificaciones silenciosas. El texto que se presenta como “texto original” debe ser exactamente el texto almacenado para esa unidad y versión.

No se deben generar frases de transición, resúmenes, definiciones, correcciones automáticas ni explicaciones dentro del bloque de transcripción.

El contenido generado por un modelo de lenguaje nunca debe mezclarse con el texto fuente. Si se produce una explicación o resumen, debe aparecer en una sección separada y rotulada como contenido derivado.

### 3.2 Corrección de escritura con trazabilidad

“Texto exacto” y “texto sin errores de escritura” son objetivos distintos. Una corrección ortográfica cambia el contenido original, aunque sea una corrección válida. Por ello se deben mantener dos posibles representaciones:

- `content`: transcripción fiel, inmutable para esa versión.
- `editorialContent`: versión corregida o normalizada, siempre opcional, con registro de quién la revisó, cuándo y qué cambió.

La vista principal debe mostrar por defecto la transcripción fiel. La versión editorial solo debe mostrarse si existe y debe estar marcada como “Texto revisado”, con acceso al texto original y al historial de cambios.

Si el alcance inicial no permite incorporar `editorialContent`, la aplicación debe conservar únicamente el texto original y señalar los errores detectados como incidencias de revisión, sin corregirlos directamente.

### 3.3 Procedencia verificable

Cada documento debe mostrar, como mínimo:

- nombre original del archivo;
- título lógico del documento;
- autoridad o entidad emisora;
- tipo de documento;
- URL oficial, cuando exista;
- versión consultada;
- estado del pipeline y estado editorial;
- hash SHA-256;
- fecha de incorporación y, si está verificada, fecha de vigencia.

El nombre original no debe inferirse a partir de una ruta interna como `originalFileKey`. Debe almacenarse en un campo propio, por ejemplo `originalFileName`, conservando el valor recibido del archivo fuente.

### 3.4 No publicar lo no validado

Una unidad extraída puede ser visible en la biblioteca para permitir su revisión, pero debe aparecer claramente rotulada como “Pendiente de revisión”. Solo una unidad aprobada puede alimentar evidencias jurídicas, preguntas publicadas o explicaciones presentadas como confiables.

### 3.5 No duplicar el dominio

La biblioteca es una vista de lectura sobre el conocimiento existente. No debe crear una entidad `LibraryDocument`, `LibraryItem` o equivalente que duplique documentos y unidades jurídicas.

## 4. Estructura funcional propuesta

### 4.1 Nivel 1: catálogo de documentos

La pantalla inicial muestra una lista paginada o filtrable de documentos. Cada tarjeta debe incluir:

- nombre original;
- título del documento;
- tipo;
- autoridad;
- número de versiones;
- número de unidades;
- estado de revisión;
- fecha de última actualización.

El nombre original debe ser el elemento más visible, porque permite reconocer el archivo que dio origen al contenido.

### 4.2 Nivel 2: ficha del documento

Al seleccionar un documento se muestra una cabecera fija con los datos de procedencia y un resumen breve de su estado. La cabecera debe incluir acciones claras: “Abrir fuente oficial”, “Ver hash”, “Cambiar versión” y “Mostrar incidencias”, según permisos y disponibilidad.

### 4.3 Nivel 3: lectura lineal

El contenido se presenta como una secuencia ordenada de unidades. El orden debe depender de `LegalProvision.order` y, cuando exista, de la jerarquía `parentProvisionId`; nunca del orden de llegada de una consulta ni de la fecha de creación.

Cada unidad debe mostrar:

- posición o número documental;
- tipo de unidad;
- título;
- contenido literal;
- citación;
- estado de revisión;
- versión de origen;
- incidencias de extracción o escritura, si existen.

La navegación debe permitir “Anterior”, “Siguiente” y “Ir a unidad”. La paginación puede mantenerse para rendimiento, pero debe sentirse como una lectura continua y no como una colección desordenada de registros.

### 4.4 Búsqueda y filtros

La búsqueda debe cubrir número, título y contenido. Los filtros mínimos son:

- documento;
- versión;
- tipo de unidad;
- estado de revisión;
- estado de vigencia;
- unidades con incidencias.

Cuando una búsqueda devuelva una unidad, la interfaz debe mostrar su posición dentro del documento y permitir volver a la lectura lineal desde ese punto.

## 5. Flujo de calidad recomendado

```text
Archivo original
    ↓
Hash y metadatos de procedencia
    ↓
Extracción determinista
    ↓
Normalización técnica no semántica
    ↓
Separación en unidades ordenadas
    ↓
Validaciones automáticas
    ↓
Revisión humana
    ↓
Publicación editorial
```

La normalización técnica puede eliminar problemas que no cambian el contenido, como saltos de línea artificiales, espacios repetidos o caracteres de control. No debe corregir palabras, números, fechas, citas ni signos de puntuación sin dejar una representación original y una trazabilidad del cambio.

## 6. Validaciones automáticas

Antes de que una unidad pase a revisión, el sistema debería verificar:

- que el archivo tiene una firma y un formato permitidos;
- que el hash coincide con el archivo conservado;
- que el nombre original no está vacío;
- que existe un documento y una versión de origen;
- que cada unidad tiene un `anchor` estable y un `order` único dentro de su versión;
- que no hay unidades duplicadas por documento, versión y anchor;
- que el contenido no está vacío;
- que la citación está presente;
- que no se perdieron números de artículo o encabezados durante la extracción;
- que los caracteres extraños, palabras partidas, páginas truncadas y cambios sospechosos de longitud quedan señalados;
- que las unidades conservan la relación con su documento y versión.

Estas validaciones deben marcar incidencias, no “arreglar” el contenido automáticamente.

## 7. Revisión humana y corrección de escritura

La revisión debe tener dos resultados separados:

1. **Validación de fidelidad:** confirma que el texto coincide con el archivo original.
2. **Revisión editorial:** identifica errores de escritura, formato o legibilidad.

Una unidad puede ser fiel y, a la vez, contener un error que ya estaba en el documento de origen. En ese caso no debe corregirse la transcripción original. La corrección, si se autoriza, debe quedar en una capa editorial separada con:

- texto anterior;
- texto nuevo;
- motivo del cambio;
- usuario revisor;
- fecha;
- estado de aprobación.

Para el MVP se recomienda no bloquear la consulta por incidencias ortográficas: mostrar el texto fiel, marcar la incidencia y reservar la corrección editorial para usuarios con rol `editor`.

## 8. Ajustes necesarios sobre la implementación actual

La biblioteca existente ya tiene una base adecuada: endpoint paginado, selección de documentos, búsqueda, orden por `order`, hash, estado de pipeline y rotulado de unidades pendientes. Para cumplir completamente esta propuesta se requieren estos ajustes:

1. agregar y exponer `originalFileName`; no usar únicamente `originalFileKey`;
2. incluir versión, hash completo y fuente oficial en la vista de lectura;
3. ampliar la búsqueda al contenido de la unidad;
4. preservar y mostrar la jerarquía documental cuando existan títulos, capítulos, artículos, parágrafos o numerales;
5. definir una regla explícita para unidades con el mismo `order` y usar un segundo criterio estable;
6. incorporar un estado o registro de incidencias de extracción y escritura;
7. distinguir visualmente “transcripción original”, “texto revisado” y “contenido generado”;
8. añadir pruebas que demuestren que la respuesta de la biblioteca conserva el texto y el nombre del documento sin alteraciones;
9. revisar el contrato de dominio si se agrega `originalFileName` o una capa editorial, y actualizar el modelo de dominio antes de migrar la base de datos.

## 9. Criterios de aceptación

- Al abrir una unidad, el usuario puede identificar el nombre exacto del archivo original.
- El texto marcado como transcripción original coincide byte a byte o, como mínimo, carácter a carácter con el texto almacenado para esa unidad.
- La biblioteca no muestra texto generado dentro de la transcripción.
- Las unidades aparecen en orden documental estable, incluso después de recargar o cambiar de página.
- Una unidad pendiente no aparece como aprobada ni alimenta preguntas o evidencias publicadas.
- El usuario puede distinguir la versión vigente, la versión histórica y la ausencia de fecha verificada.
- Una búsqueda encuentra coincidencias en número, título y contenido, conservando la posición documental.
- Toda corrección editorial tiene autor, fecha, motivo y comparación con el original.
- El sistema conserva el PDF original y su hash para permitir una auditoría posterior.
- Las pruebas cubren ingestión, orden, procedencia, fidelidad, estados y paginación.

## 10. Plan de implementación por fases

### Fase 1 — Fidelidad y procedencia

Agregar `originalFileName`, exponer metadatos completos, mejorar la vista de documento y ampliar las pruebas de igualdad del contenido.

### Fase 2 — Lectura lineal

Implementar navegación anterior/siguiente, índice jerárquico, posición de unidad, búsqueda por contenido y filtros de estado.

### Fase 3 — Control de calidad

Crear incidencias de extracción y escritura, reglas automáticas de detección y una bandeja de revisión editorial.

### Fase 4 — Corrección editorial trazable

Incorporar una capa separada para texto revisado, historial de cambios, comparación lado a lado y aprobación por editor.

### Fase 5 — Auditoría y rendimiento

Agregar exportación de un informe de procedencia, pruebas de corpus completo, índices de búsqueda y paginación optimizada para las 14.368 unidades importadas.

## 11. Decisiones que deben cerrarse antes de programar

1. Si la primera versión mostrará únicamente el texto original o también una versión editorial corregida.
2. Si la biblioteca será solo para consulta de estudiantes o si incluirá una bandeja de revisión para editores.
3. Qué transformaciones técnicas se consideran seguras sin revisión humana.
4. Qué documentos pueden mostrarse aunque estén pendientes y qué aviso debe ver el estudiante.
5. Si el nombre original se conserva por cada documento lógico, por cada versión o en ambos niveles.

## Conclusión

La actualización debe tratar la biblioteca como un registro documental verificable, no como un lector de resúmenes. La prioridad es separar con claridad tres capas: fuente original, revisión editorial y contenido derivado. Con esa separación, la plataforma puede ofrecer una lectura ordenada y agradable sin sacrificar exactitud, trazabilidad ni confianza jurídica.

La recomendación es comenzar por la Fase 1 y documentar la decisión mediante un ADR, porque la incorporación del nombre original, las reglas de fidelidad y cualquier futura capa editorial afectan el dominio, la persistencia, la API y la interfaz.
