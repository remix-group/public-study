# ADR-014: Subagente validador antes de la generación de contenido

- Estado: aceptada
- Fecha: 2026-09-25

## Contexto

El corpus jurídico puede contener errores de extracción, OCR, estructura o
trazabilidad. Exigir que toda la base sea corregida y aprobada antes de generar
contenido bloquea el uso del material útil; aprobarla automáticamente sería
peor, porque convertiría la base en la autoridad.

## Decisión

Se incorpora el subagente `contenido-validador-fuentes` entre la consulta y el
generador. En cada solicitud valida todas las unidades del documento solicitado
y consulta el inventario completo de disposiciones para hallar duplicados y
versiones mezcladas. No filtra por `validationStatus` ni `editorialStatus`.

El agente recupera primero el archivo fuente local registrado y, cuando se
solicita, una URL oficial HTTPS. Contrasta el texto normalizado y reglas de
estructura; emite un reporte por unidad. Solo las unidades verificadas se
entregan al proveedor de IA. Las unidades excluidas no se modifican ni se
ocultan del reporte. Los lotes de generación son únicamente un límite técnico y
se procesan hasta cubrir todas las unidades verificadas.

## Consecuencias

- No se ejecuta ninguna aprobación o publicación automática de fuentes.
- Una fuente inaccesible o un texto que no coincide bloquea esa unidad, no el
  resto verificable del documento.
- La evidencia creada por el flujo conserva referencias de fuente, páginas,
  offsets y extractor cuando existen.
- La comparación web no reemplaza la procedencia local recuperable y una
  verificación remota fallida queda explícita en el resultado.
