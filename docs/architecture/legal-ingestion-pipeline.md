# Pipeline de ingestión y conocimiento jurídico

## Propósito

Procesar grandes cantidades de PDF jurídicos de forma local, reproducible y paralela a la plataforma de estudio. El pipeline convierte documentos originales en unidades jurídicas consultables, pero nunca convierte automáticamente una extracción u OCR en fuente jurídica publicada.

## Principios

- El PDF original y la fuente oficial son la autoridad primaria.
- Cada resultado debe conservar documento, versión, hash y páginas de origen.
- El procesamiento debe ser idempotente: reintentar no crea duplicados.
- Las tareas independientes se ejecutan en paralelo por documento o página.
- La plataforma de estudio consume únicamente unidades aprobadas/publicadas.
- Un modelo de IA puede ayudar a clasificar, sugerir estructura o generar material, pero no aprobar contenido jurídico.
- Una falla de un documento no debe detener el procesamiento de los demás.

## Arquitectura general

```text
data/legal-sources/incoming/
        |
        v
  Scanner / Intake
        |
        v
  Document Registry -----> PostgreSQL
        |
        v
  PDF Inspector / Classifier
        |
        +--> PDF digital -----> Text Extractor
        |
        +--> PDF escaneado ---> OCR Worker
        |
        +--> PDF mixto -------> OCR solo en páginas necesarias
                                      |
                                      v
                           Normalizer / Page Mapper
                                      |
                                      v
                            Legal Structure Parser
                                      |
                                      v
                         Quality Gate / Confidence Report
                                      |
                         +------------+-------------+
                         |                          |
                         v                          v
                   Review queue                Search Index
                         |                    lexical + semantic
                         v                          |
                    Human review                 Query API
                         |                          |
                         v                          v
              APPROVED / PUBLISHED ------> Study Platform
```

## Componentes

### 1. Intake y registro

Escanea `data/legal-sources/incoming/` o recibe un archivo desde la API. Valida firma MIME, tamaño y extensión, calcula SHA-256 y registra una ejecución. El archivo original se copia de forma inmutable a `originals/` o al almacenamiento configurado por `LEGAL_STORAGE_PATH`.

Debe detectar un documento ya procesado por la combinación de hash, documento y versión. Nunca debe reemplazar una versión aprobada.

### 2. Clasificación del PDF

`pdf-inspector` inspecciona cada documento y determina si es `text_based`, `scanned`, `image_based` o `mixed`. También informa confianza y páginas que requieren OCR.

La ruta normal es:

- PDF digital confiable: extraer directamente.
- PDF escaneado: ejecutar OCR.
- PDF mixto: extraer texto y ejecutar OCR solo en páginas deficientes.
- Clasificación ambigua: enviar a revisión técnica.

### 3. Extracción y OCR

Para PDF digitales se utiliza extracción con posición y orden de lectura. Para páginas escaneadas se utiliza `OCRmyPDF + Tesseract` en español (`spa`) como adaptador local inicial. PaddleOCR queda como adaptador posterior para documentos con tablas o maquetación compleja.

Cada resultado debe registrar extractor, versión, idioma, páginas procesadas, tiempo, advertencias y confianza cuando esté disponible. El PDF original nunca se modifica; el PDF con capa OCR y el texto son derivados.

### 4. Normalización con procedencia

La normalización corrige saltos de línea, guiones de final de línea y espacios técnicos sin modificar el texto legal. Conserva el texto crudo y el texto normalizado por página.

Cada fragmento debe poder localizarse mediante:

```text
documentId
versionId
pageStart
pageEnd
charStart / charEnd (si están disponibles)
sourceHash
```

### 5. Parser jurídico

El parser determinista reconoce, cuando existan, título, libro, parte, capítulo, sección, artículo, parágrafo, numeral, literal y anexo. La jerarquía se conserva con `parentId` y el orden original con `order`.

El parser puede producir candidatos con ayuda de IA cuando la estructura sea ambigua, pero la salida se mantiene como pendiente y debe indicar qué parte fue inferida.

### 6. Control de calidad

Antes de crear evidencia, el pipeline calcula un reporte por documento y unidad:

- porcentaje de páginas con texto;
- páginas vacías o con extracción defectuosa;
- confianza OCR;
- caracteres anómalos;
- artículos no numerados o duplicados;
- estructura no reconocida;
- posibles cortes entre páginas;
- tablas o columnas problemáticas;
- inconsistencias con la versión anterior.

Los documentos que no superen los umbrales quedan en `REVIEW_REQUIRED` y no continúan a publicación.

### 7. Indexación

La indexación es posterior al control de calidad y no cambia la autoridad del contenido. Se mantienen dos índices:

- léxico: coincidencias exactas, artículos, números y citas;
- semántico: embeddings para localizar conceptos relacionados.

Solo se indexan para respuestas de la plataforma las unidades `APPROVED` o `PUBLISHED`. Los resultados de búsqueda deben devolver siempre la cita, versión y página.

## Persistencia

El pipeline reutiliza las entidades existentes y añade metadatos de ejecución cuando sea necesario:

```text
LegalDocument
  └── LegalVersion
        └── LegalProvision / LegalUnit
              └── Evidence

IngestionRun
  ├── versionId
  ├── status
  ├── extractor
  ├── extractorVersion
  ├── metrics
  ├── warnings
  ├── startedAt
  └── finishedAt
```

Estados de ejecución sugeridos:

```text
RECEIVED → VALIDATED → CLASSIFIED → EXTRACTED → PARSED
          → QUALITY_CHECKED → REVIEW_REQUIRED → APPROVED → PUBLISHED
```

Estados de error y salida:

```text
FAILED_RETRYABLE
FAILED_PERMANENT
SUPERSEDED
REJECTED
```

## Paralelismo

El nivel de paralelismo recomendado es:

1. Un job por PDF.
2. Dentro de un PDF mixto, un job por grupo de páginas OCR.
3. Parsing e indexación después de completar la extracción del documento.
4. Documentos distintos pueden procesarse simultáneamente.

La concurrencia debe ser configurable para no saturar CPU, memoria o disco. OCR requiere límites más bajos que la extracción de texto.

## Separación respecto a la plataforma

El pipeline no debe ejecutarse dentro de las peticiones normales de estudio. Debe exponerse mediante una interfaz de aplicación o comandos independientes:

```bash
pnpm legal:scan
pnpm legal:process <path>
pnpm legal:retry-failed
pnpm legal:quality-report
pnpm legal:index
```

La plataforma consulta el catálogo y las evidencias; no conoce los detalles internos del OCR ni del parser.

## Fases de implementación

### Fase 1: MVP local

- Scanner de carpeta.
- Hash e idempotencia.
- `pdf-inspector` para clasificación y extracción.
- `pdftotext` como fallback digital.
- `OCRmyPDF + Tesseract` para escaneados.
- Parser determinista actual.
- Unidades en revisión.

### Fase 2: procesamiento masivo

- Tabla `IngestionRun`.
- Cola local y workers.
- Reintentos con backoff.
- Reporte de calidad.
- Procesamiento por páginas en PDF mixto.

### Fase 3: búsqueda y operación compartida

- Índice léxico en PostgreSQL.
- Embeddings y `pgvector`.
- Almacenamiento de objetos compartido.
- Worker desplegable separado.
- Panel de revisión y auditoría.

## Criterio de terminado

Una ejecución está técnicamente completa cuando el original es recuperable, la extracción tiene reporte, cada unidad tiene procedencia y el proceso es repetible. Está jurídicamente publicable únicamente cuando las unidades han pasado revisión humana y las evidencias apuntan al texto aprobado de la versión correcta.
