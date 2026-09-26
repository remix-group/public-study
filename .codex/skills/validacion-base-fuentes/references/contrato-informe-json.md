# Contrato JSON del informe de validación

La salida predeterminada debe ser un único objeto JSON válido, codificado en
UTF-8, sin comentarios, texto introductorio ni cercas Markdown. Los nombres de
campos permanecen en `camelCase`; los valores controlados permanecen en español
tal como aparecen aquí.

## Estructura raíz

```json
{
  "schemaVersion": "1.0",
  "reportId": "string",
  "generatedAt": "ISO-8601",
  "validationStatus": "completa | parcial | bloqueada | no_verificable",
  "completenessClaimAllowed": false,
  "scope": {},
  "method": {},
  "metrics": {},
  "correctRecords": [],
  "findings": [],
  "unmatchedItems": [],
  "limitations": [],
  "recommendations": [],
  "artifacts": []
}
```

`completenessClaimAllowed` solo puede ser `true` cuando todos los archivos,
páginas, disposiciones y registros dentro del alcance fueron emparejados y
verificados. `validationStatus` debe ser `parcial` o `bloqueada` si existe algún
elemento no verificado que impida concluir sobre el alcance completo.

## Alcance y método

```json
{
  "scope": {
    "databases": [{ "name": "string", "engine": "string", "snapshot": "string|null", "readOnly": true }],
    "sourceRoots": ["ruta"],
    "includedTables": ["tabla"],
    "includedFiles": ["ruta"],
    "excludedItems": [{ "item": "string", "reason": "string" }]
  },
  "method": {
    "tools": [{ "name": "string", "version": "string|null", "purpose": "string" }],
    "queries": [{ "id": "string", "description": "string", "statement": "string|null" }],
    "matchingRules": ["string"],
    "normalizationRules": ["string"],
    "hashAlgorithm": "sha256|null",
    "ocrStrategy": "string|null"
  }
}
```

No incluyas secretos, contraseñas ni cadenas de conexión completas. Sustituye
los componentes sensibles por `"[REDACTED]"`.

## Métricas

Cada métrica proporcional utiliza el mismo formato:

```json
{
  "value": 0.95,
  "numerator": 95,
  "denominator": 100,
  "notVerifiable": 3,
  "unit": "files | pages | provisions | records | fields | relations",
  "notes": "string|null"
}
```

`value` se expresa entre `0` y `1`. Usa `null` para `value`, `numerator` o
`denominator` si no existe información suficiente. Como mínimo, `metrics`
incluye:

- `sourceFileCoverage`
- `pageCoverage`
- `provisionCoverage`
- `recordCoverage`
- `fieldCoverage`
- `relationCoverage`
- `exactTextFidelity`
- `normalizedTextFidelity`
- `traceabilityCoverage`

Agrega conteos separados para `exactMatch`, `normalizedEquivalent`,
`substantiveDifference`, `sourceUnmatched`, `recordUnmatched` y
`notVerifiable`.

## Registros correctos

Un registro correcto necesita evidencia positiva; no basta con que no haya
generado un error:

```json
{
  "record": {
    "table": "legal_provisions",
    "primaryKey": "string",
    "identifiers": { "provisionId": "string", "objectiveId": "string|null" }
  },
  "source": {
    "file": "ruta",
    "sha256": "string|null",
    "page": 12,
    "location": "Artículo 3, parágrafo 1",
    "documentVersion": "string|null"
  },
  "verifiedFields": ["number", "content", "citation"],
  "textMatch": "exacta | equivalente_normalizada",
  "certainty": "confirmada | probable | ambigua | no_verificable"
}
```

No clasifiques como correcto un registro con campos materiales no revisados.
En ese caso, registra los campos verificados y refleja la cobertura parcial en
las métricas.

## Hallazgos

Todos los campos siguientes son obligatorios; usa `null` cuando un localizador
no exista y explica la causa en `difference` o `limitations`:

```json
{
  "id": "VAL-000001",
  "category": "textual_content | legal_structure | metadata | record_relation | traceability | page_integrity | ocr_quality | duplicate_or_mixed_version",
  "source": {
    "file": "ruta",
    "sha256": "string|null",
    "page": 12,
    "location": "Artículo 3, literal b",
    "documentVersion": "string|null"
  },
  "databaseRecord": {
    "database": "string",
    "schema": "string|null",
    "table": "string",
    "primaryKey": "string",
    "identifiers": { "provisionId": "string|null", "objectiveId": "string|null" }
  },
  "affectedField": "content",
  "sourceEvidence": "fragmento mínimo suficiente",
  "storedValue": "valor almacenado",
  "difference": "descripción concreta y reproducible",
  "impact": "consecuencia documental, jurídica o técnica",
  "severity": "critica | alta | media | baja | informativa | no_verificable",
  "certainty": "confirmada | probable | ambigua | no_verificable",
  "recommendation": "acción revisable, sin ejecutarla",
  "reproduction": {
    "queryId": "string|null",
    "command": "string|null",
    "notes": "string|null"
  }
}
```

`sourceEvidence` debe ser el fragmento mínimo que demuestre el hallazgo. Para
tablas, diagramas o páginas escaneadas, describe además coordenadas, celda,
región o elemento visual en `source.location`.

## Elementos no emparejados y limitaciones

```json
{
  "unmatchedItems": [{
    "side": "source | database",
    "itemType": "file | page | provision | record | relation | version",
    "identifier": "string",
    "reason": "string",
    "certainty": "confirmada | probable | ambigua | no_verificable"
  }],
  "limitations": [{
    "id": "LIM-001",
    "description": "string",
    "affectedScope": ["string"],
    "impactOnConclusion": "string"
  }]
}
```

Archivos corruptos, páginas ilegibles, permisos insuficientes, tablas no
consultables y versiones indeterminadas deben aparecer aquí y reducir la
cobertura correspondiente.

## Recomendaciones y artefactos

Las recomendaciones no son reparaciones ejecutadas. Ordénalas por severidad y
dependencia. Cada artefacto generado debe incluir propósito, ruta, formato,
hash y conteo de elementos. Si el informe se fragmenta, el objeto raíz funciona
como índice y declara si los fragmentos contienen la población completa.

```json
{
  "recommendations": [{
    "priority": 1,
    "relatedFindingIds": ["VAL-000001"],
    "action": "string",
    "requiresHumanReview": true
  }],
  "artifacts": [{
    "path": "ruta",
    "format": "json | csv | sql | patch | text",
    "purpose": "string",
    "sha256": "string|null",
    "itemCount": 1,
    "containsFullPopulation": true
  }]
}
```

Antes de entregar, parsea el JSON con una herramienta disponible y verifica
que todos los valores de severidad y certeza pertenezcan a los catálogos
permitidos.
