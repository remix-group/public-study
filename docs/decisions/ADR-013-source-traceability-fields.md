# ADR-013: Persistencia de trazabilidad de fuentes

## Estado

Propuesto para revisión del equipo.

## Contexto

La auditoría BD–fuentes detectó que el esquema activo no conserva `page_start`,
`page_end`, offsets, `source_reference_id`, extractor ni versión del extractor.
Sin esos datos no es posible reproducir de forma confiable la relación entre una
disposición procesada y su PDF original.

## Decisión propuesta

Agregar campos nullable y aditivos en OPEC, versiones legales, disposiciones y
evidencias. Los campos no corrigen contenido existente ni declaran una fuente
como verificada; solo permiten persistir la evidencia después de revisión.

La migración conserva identificadores y registros actuales. La reasignación de
hashes, artículos o fuentes debe hacerse en un parche separado, revisable y con
aprobación jurídica.

## Consecuencias

- Las importaciones futuras pueden conservar páginas, offsets y extractor.
- Los registros históricos permanecerán incompletos hasta ser backfilled desde
  el volcado y los PDF verificados.
- La auditoría podrá distinguir trazabilidad persistida de trazabilidad
  reconstruida.
- Se requiere actualizar el importador, validadores y pruebas antes de aprobar
  contenido jurídico.
