# Saneamiento BD–fuentes jurídicas DIAN

## Estado

En ejecución. La plataforma debe permanecer en revisión jurídica para los
registros afectados hasta completar la nueva auditoría.

## Trabajo realizado

- Se confirmó el conflicto: el SHA-256
  `3e0b1b613ccfd17132bd11a1eeb824c12c27107c88f2b717b9cc6b9c06d7ba19`
  identifica simultáneamente `ABC Servicio al Ciudadano` y `Estatuto
  Tributario`.
- Se añadió la migración aditiva
  `20260917010000_source_traceability`.
- Se añadieron campos nullable para hash/ruta/versión OPEC y para
  `sourceReferenceId`, páginas, offsets, extractor y versión del extractor en
  versiones, disposiciones y evidencias.
- Se actualizó el importador para conservar esos campos en futuras cargas.
- Se creó y aplicó el registro canónico `source_references`.
- Se registraron 42 PDF físicos únicos por SHA-256.
- Se enlazaron por hash 37 versiones inicialmente; tras el backfill histórico
  quedaron 39 versiones, 14.405 disposiciones y 14.405 evidencias con referencia
  de fuente, incluyendo 14.368 unidades con páginas y offsets completos.
- Se ejecutó el backfill histórico: 37 versiones y 14.368 disposiciones/evidencias
  conservaron `sourceReferenceId`, páginas, offsets y metadatos del extractor.
- Las unidades pedagógicas suplementarias quedaron diferenciadas de las unidades
  extraídas directamente del PDF y no se presentan como evidencia normativa.
- Se confirmó que las diferencias de ruta 15 y 16 eran literales del PDF fuente;
  se sincronizaron los nombres de los temas con esa fuente, conservando la
  redacción original para no corregir silenciosamente el material aportado.
- La migración fue aplicada sin modificar ni eliminar contenido existente.
- Se aplicó una cuarentena reversible del hash incorrecto del Estatuto mediante
  `20260917012000_quarantine_et_identity_conflict`; se conservaron los valores
  anteriores en `legal_source_quarantine`, se retiró la fuente no demostrada y
  los artículos 823, 826, 828 y 837 quedaron en `pending/draft`.
- Se modelaron y registraron las diez funciones esenciales de la OPEC con
  `opec_functions`, hash, `sourceReferenceId`, página 1 y offsets del texto
  extraído de `get-document.pdf`.
- `pnpm --filter @dian-study/infrastructure lint` pasa.
- Se inspeccionó `data/legal-sources/incoming/DIAN.zip`: contiene 36 PDF y supera
  la prueba de integridad ZIP, pero no contiene el Estatuto Tributario ni los
  dos SHA-256 faltantes identificados por la auditoría.

## Bloqueador jurídico pendiente

No se debe reasignar ni borrar los artículos 823, 826, 828 y 837. Falta contar
con el PDF correcto del Estatuto Tributario que permita comprobar su identidad,
hash, versión y páginas. El archivo `DIAN.zip` no resuelve este punto. Hasta
recibirlo, esos artículos y sus relaciones deben permanecer en `pending_review`
y no presentarse como fuente aprobada. Los dos PDF faltantes tampoco existen
físicamente en el repositorio ni en el ZIP.

## Próximos parches revisables

1. Incorporar físicamente los dos PDF faltantes y el PDF oficial correcto del
   Estatuto Tributario; emparejarlos únicamente por SHA-256.
2. Clasificar jurídicamente los PDF de `incoming` que tienen registro de fuente
   pero aún no tienen documento/versionado curricular asociado.
3. Crear un parche separado para vincular los cuatro artículos a la fuente
   correcta, con revisión humana de texto, páginas y offsets.
4. Revisar las 2.399 diferencias textuales, tablas, listas, OCR y localizadores;
   corregir solo mediante parches revisables.
5. Revisar las filas 15 y 16 de la ruta y las relaciones institucionales antes
   de cambiar estados editoriales.
6. Ejecutar la auditoría nuevamente y cerrar solo con evidencia de 100% de
   fuentes/páginas y sin hallazgos críticos o altos no justificados.

## Cola de revisión pendiente

| Alcance | Estado | Responsable | Plan de resolución |
|---|---|---|---|
| SHA-256 `aff64bd7…` y `b0424891…` | `no_verificable` | Responsable de fuentes jurídicas | Incorporar los PDF físicos y comprobar SHA-256, páginas y OCR antes de enlazar registros. |
| Estatuto Tributario y artículos 823, 826, 828 y 837 | `pending_review` | Revisor jurídico | Aportar el PDF oficial, crear la versión correcta y aprobar texto, páginas y offsets; no reutilizar el hash del ABC. |
| 2.399 diferencias textuales | `alta` | Equipo de ingestión + revisor jurídico | Revisar cada disposición contra la página fuente; generar parches por lote solo con evidencia y revisión humana. |
| Tablas, listas, notas al pie y continuaciones | `alta/media` | Equipo de extracción documental | Revisar visualmente las páginas señaladas y corregir estructura conservando los identificadores. |
| 6 relaciones no verificadas | `pending_review` | Revisor del mapa institucional | Confirmar `provisionId`, `objectiveId`, extremos y fuente antes de cambiar a `confirmed`. |
| PDF de `incoming` registrados pero sin clasificación curricular | `pending_review` | Curador del corpus | Clasificar como normativo, pedagógico, duplicado o fuera de alcance; después crear versión solo si pertenece al corpus. |
