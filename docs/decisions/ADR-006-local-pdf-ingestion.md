# ADR-006: Ingesta determinista de fuentes jurídicas en PDF

- Estado: aceptada
- Fecha: 2026-08-30

## Contexto

El núcleo jurídico requiere incorporar documentos oficiales sin convertir la salida de un modelo generativo en fuente de verdad. El MVP también debe ejecutarse localmente sin depender todavía de almacenamiento de objetos ni de una cola distribuida.

## Decisión

La API recibe PDF de hasta 25 MB, valida su firma, calcula SHA-256 y conserva el binario con una clave derivada del documento y el hash. La extracción utiliza `pdftotext`; un parser determinista reconoce encabezados de artículos y crea unidades en estado `pending/draft`. Ninguna unidad extraída genera evidencia hasta superar revisión editorial.

El almacenamiento local se ubica en `LEGAL_STORAGE_PATH` o `data/legal-sources`. Esta decisión es un adaptador de MVP: en despliegues compartidos se sustituirá por almacenamiento de objetos y ejecución asíncrona manteniendo el servicio de aplicación.

## Consecuencias

- La procedencia de cada ingesta puede verificarse con su hash.
- Reingestar una versión reemplaza exclusivamente sus unidades aún pendientes; no elimina contenido aprobado.
- Los PDF escaneados sin capa de texto y estructuras diferentes a encabezados de artículos requerirán OCR o revisión manual en un incremento posterior.
