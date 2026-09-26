# Legal Domain

## Alcance del MVP
Para el primer vertical (Cobro Coactivo) trabajaremos con un **conjunto controlado de fuentes**. No intentaremos modelar todo el universo jurídico colombiano de entrada.

Fuentes objetivo del MVP:
- Estatuto Tributario
- Código General del Proceso
- Ley 1066 de 2006
- Contenidos relacionados con embargo, secuestro, remate y facilidades de pago.

## Entidades
- `LegalDocument`: Representa el cuerpo normativo (ej. Estatuto Tributario, Ley 1066).
- `LegalProvision`: Disposición legal específica y atómica (ej. un Artículo, un inciso).
- `LegalReference`: Referencia implícita o explícita entre provisiones o documentos.
- `LegalRelation`: Relación tipificada y direccional entre disposiciones.
- `LegalVersion`: Versión en el tiempo de un documento o disposición.
- `Evidence`: Fragmento jurídico extraído que fundamenta una evaluación, pregunta o caso.
- `InstitutionalEntity`: Entidad, órgano, dependencia o autoridad mencionada por el corpus, con nombre oficial y alias separados.
- `InstitutionalClaim`: Función, competencia, propósito o descripción institucional sustentada por una disposición.
- `InstitutionalRelation`: Relación tipificada entre dos entidades institucionales, con evidencia y distinción explícita entre jerárquica y funcional.

## Relaciones (Tipos de LegalRelation)
- `MODIFIES`
- `ADDS`
- `REPEALS`
- `REPLACES`
- `REFERENCES`
- `REGULATES`

## Propiedades Clave de la Normativa
- `source`: Origen oficial del documento.
- `effective_from`: Fecha de inicio de vigencia de la disposición.
- `effective_until`: Fecha de fin de vigencia (si aplica).
- `status`: Estado actual (vigente, derogado, modificado, etc.).
- `citation`: Formato estándar de citación.

## Knowledge Core

`LegalDocument` registra la fuente lógica y el estado de su pipeline. `LegalVersion` representa una edición temporal inmutable. Durante el MVP, `LegalProvision` implementa el concepto arquitectónico `LegalUnit` y puede representar títulos, capítulos, artículos, parágrafos, incisos, numerales o anexos mediante una jerarquía y un `anchor` estable.

Las fechas de vigencia pueden ser desconocidas durante una importación masiva. En ese caso
`effectiveFrom` permanece nulo y el documento, versión o unidad conserva estado
`pending_review`; nunca se inventa una fecha para satisfacer el almacenamiento. El material
pedagógico, las cartillas y las extracciones visuales se conservan como tipos de unidad dentro
de la misma cadena documental, pero no se presentan como autoridad jurídica hasta superar
revisión editorial.

## Conocimiento institucional

El mapa institucional no se construye a partir de menciones aisladas. Cada afirmación y
relación conserva `sourceProvisionId`, estado editorial y nivel de confianza; puede además
enlazarse a un `LearningObjective`. Una relación funcional nunca implica jerarquía. Los tipos
iniciales son `dependency`, `coordination`, `regulation`, `control`, `cooperation`,
`participation` y `reporting`. Solo `dependency` puede marcarse como jerárquica cuando la
fuente lo expresa de forma suficiente.

El estado `pending_review` indica que el dato fue extraído de una unidad jurídica del corpus
que aún requiere revisión editorial. `no_confirmado` se reserva para información incompleta y
no debe presentarse como hecho. La interfaz siempre permite regresar a la disposición y al
documento que sustentan el dato.
