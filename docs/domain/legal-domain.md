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
