# Auditoría de completitud de contenidos y experiencia de estudio

**Fecha:** 30 de septiembre de 2026

**Rama revisada:** `Olger`

**Alcance:** los 25 temas de la OPEC 236828, sus fuentes, lecturas, cuestionarios, ejemplos trabajados, casos situacionales, progreso y condiciones mínimas para que la plataforma sea utilizable como producto de estudio.

## 1. Conclusión ejecutiva

La plataforma es técnicamente ejecutable y cuenta con una estructura pedagógica útil, pero la ruta completa todavía no está lista para utilizarse como preparación integral de la OPEC.

El problema principal ya no es que falten pantallas. El sistema tiene ruta, lectura guiada, biblioteca, preguntas, casos, progreso, repasos y controles editoriales. El problema es la **completitud y validación del contenido**:

- Hay 25 temas activos y 29 objetivos de aprendizaje.
- Solo el tema 13 tiene un paquete de práctica ampliamente utilizable.
- El tema 14 tiene práctica parcial.
- Los otros 23 temas tienen cero preguntas utilizables bajo las reglas de publicación, aunque en varios casos las preguntas ya existen en la base.
- Hay 42 preguntas marcadas como publicadas, pero solo 13 pueden presentarse al estudiante porque las demás dependen de fuentes pendientes.
- Hay 28 casos, pero solo 2 pueden utilizarse.
- Los temas 1 a 10 y 25 no tienen preguntas ni casos creados.
- Los temas 11, 12 y 15 a 24 sí tienen preguntas y casos creados, pero no están habilitados porque sus fuentes no han sido verificadas y publicadas.
- De 40 documentos cargados, solo 1 cumple actualmente las condiciones completas de fuente oficial publicada.
- De 14.409 unidades documentales, solo 4 están aprobadas y publicadas.

Con un criterio completo de salida —fuente oficial revisada, lectura estructurada, conceptos suficientes, preguntas variadas, ejemplo, caso, trazabilidad y pruebas del recorrido— **ninguno de los 25 temas puede considerarse totalmente terminado**. El tema 13 es el más avanzado, pero todavía necesita respaldar de forma expresa el componente persuasivo y corregir una asociación pregunta-evidencia.

## 2. Qué funciona correctamente

La base técnica y funcional es sólida para continuar el trabajo:

- autenticación y separación básica entre estudiante y editor;
- ruta visible de 25 temas, organizada en seis bloques;
- lectura guiada con orientación, recuperación inicial, fuente, ejemplo, comprobación, aplicación y cierre;
- separación visual entre fuente literal y explicación pedagógica;
- acceso interno al material completo desde cada extracto;
- práctica únicamente con preguntas cuya evidencia cumple el filtro jurídico;
- casos abiertos con registro y contraste contra un análisis editorial;
- registro de intentos, errores, dominio y revisión espaciada;
- biblioteca con documentos, versiones y unidades;
- panel editorial de preguntas y fuentes;
- ejecución local saludable en `http://localhost:5173`;
- 54 pruebas automatizadas exitosas;
- validación estática y compilación de producción exitosas.

El control que impide mostrar actividades con fuentes pendientes está funcionando. Por ejemplo, el tema 12 muestra lectura y extractos en revisión, pero no permite iniciar sus dos preguntas ni sus dos casos. El tema 13, respaldado por cuatro artículos aprobados del Estatuto Tributario, sí permite estudiar y practicar.

## 3. Inventario real

| Elemento | Total | Listo o utilizable | Observación |
|---|---:|---:|---|
| Temas activos | 25 | 1 completo para práctica amplia; 1 parcial | 23 sin práctica utilizable |
| Objetivos activos | 29 | Concentrados principalmente en temas 13 y 14 | Los demás temas tienen un único objetivo demasiado amplio |
| Conceptos | 29 | 1 por objetivo | Insuficiente para desarrollar temas complejos |
| Documentos | 40 | 1 publicado | 39 sin URL oficial, fecha de vigencia y revisión completa |
| Unidades documentales | 14.409 | 4 aprobadas/publicadas | 14.405 pendientes o en borrador |
| Preguntas | 42 | 13 utilizables | 29 dependen de evidencia pendiente |
| Casos | 28 | 2 utilizables | 26 dependen de evidencia pendiente |
| Documentos con URL oficial | 1 | 1 | Faltan 39 enlaces oficiales |
| Unidades con alerta automática de extracción | 60 | Pendientes | No incluye todos los defectos semánticos detectados |
| Títulos de unidad con más de 180 caracteres | 7.969 | Requieren depuración | En numerosos casos el texto fue absorbido por el título |
| Unidades identificadas solo con letra, como `a)` o `b)` | 1.453 | Requieren clasificación | Algunas son literales válidos, otras quedaron mal segmentadas |

También existe un documento duplicado con el título `Ley-1755-de-2015-Gestor-Normativo`.

## 4. Bloqueos principales

### 4.1. El corpus está cargado, pero casi no está validado

La base contiene material abundante, pero 39 de 40 documentos siguen en `REVIEW_REQUIRED`, sin URL oficial, sin fecha de vigencia y con sus unidades en `pending/draft`. El sistema hace bien en no tratarlos como fuente confiable.

Para cerrar este punto se necesita, por documento:

1. identificar la autoridad y el tipo documental correctos;
2. registrar la URL oficial directa;
3. confirmar versión, vigencia, fecha efectiva y posibles modificaciones o derogatorias;
4. corregir la segmentación de artículos, numerales, literales, títulos y contenidos;
5. revisar las unidades realmente usadas por cada tema;
6. aprobar y publicar únicamente las unidades verificadas;
7. conservar revisor, fecha, hash y versión auditables.

No es necesario aprobar inmediatamente las 14.409 unidades. Debe priorizarse el subconjunto que alimenta los 25 paquetes de estudio.

### 4.2. “Pregunta publicada” no equivale a “pregunta utilizable”

Las 42 preguntas tienen `editorialStatus=published` y figuran como revisadas por `student-demo`, pero solo 13 superan el filtro completo de evidencia oficial. Este registro no representa una revisión humana jurídicamente identificada: fue creado por el proceso de carga inicial.

Las 29 preguntas bloqueadas deben permanecer como borrador o adoptar un estado explícito `pending_source_review`. No deberían figurar internamente como publicadas hasta que pregunta, explicación y evidencia hayan sido revisadas.

### 4.3. Hay asociaciones semánticas incorrectas entre preguntas y evidencia

La carga curada asigna evidencias por posición, no por correspondencia semántica. Esto produce enlaces formalmente existentes pero conceptualmente débiles o equivocados.

Ejemplos comprobados:

- En el tema 12, la pregunta sobre el RUT está enlazada al literal sobre garantía, mientras la unidad siguiente contiene el texto del RUT.
- En el mismo tema, la pregunta sobre la garantía del artículo 860 queda enlazada a la unidad del recibo de prima y el RUT.
- En el tema 13, la pregunta sobre la verificación previa del expediente se respalda con el artículo 826 sobre mandamiento de pago, que no contiene por sí solo toda la regla preguntada.

Se necesita una revisión pregunta por pregunta. La evidencia debe demostrar directamente la respuesta, no limitarse a pertenecer al mismo documento o tema.

### 4.4. El banco de preguntas tiene un sesgo evidente

De las 42 preguntas:

- 36 tienen la opción `A` como respuesta correcta;
- 2 tienen `B`;
- 2 tienen `C`;
- 2 tienen `D`.

Todas las preguntas curadas de los temas 12 a 24 tienen actualmente `A` como respuesta correcta. Un estudiante puede reconocer el patrón sin dominar el contenido.

Debe balancearse la clave correcta o, preferiblemente, barajar las opciones al presentar cada intento y conservar en el intento la correspondencia usada.

### 4.5. Los tipos de error no respetan el dominio documentado

El dominio admite tipos como `UNKNOWN_CONCEPT`, `FORGOT_RULE`, `NORM_VERSION_ERROR`, `CASE_INTERPRETATION_ERROR` y `CARELESS_ERROR`. Sin embargo, el banco usa valores adicionales no definidos, por ejemplo:

- `SOURCE_AWARENESS`;
- `MISSED_CONTROL`;
- `ETHICAL_JUDGMENT`;
- `SERVICE_JUDGMENT`;
- `ACCESSIBILITY_GAP`;
- `DATA_HANDLING`;
- `MISSED_REQUIREMENT`;
- `MISSED_RULE`;
- `REMISSION_ERROR`;
- `TOOL_SELECTION`.

Debe decidirse si esos valores pasan a formar parte del dominio —actualizando modelo, documentación, motor y reportes— o si se normalizan a la taxonomía vigente.

### 4.6. El contenido pedagógico es demasiado delgado

Hay 29 conceptos para 29 objetivos: exactamente uno por objetivo. En la mayoría de los temas ese único concepto es una descripción general, no un desglose de lo que el estudiante debe aprender.

La lectura deriva además sus “reglas” de las explicaciones de las preguntas. Si un tema no tiene preguntas utilizables, la lectura pierde parte de su desarrollo. El modelo admite condiciones y excepciones, pero la proyección actual no genera bloques de ese tipo.

Cada objetivo necesita como mínimo:

- 3 a 6 conceptos o reglas esenciales;
- condiciones y excepciones separadas;
- secuencia o procedimiento, cuando aplique;
- errores frecuentes;
- una o dos comprobaciones específicas;
- un ejemplo trabajado respaldado;
- un cierre que pueda relacionarse con el progreso.

### 4.7. Los casos no tienen ciclo editorial propio

El modelo `Case` no contiene estado editorial, revisor ni fecha de revisión. La disponibilidad se decide únicamente por la evidencia. Además, el sistema interpreta el primer caso por dificultad como ejemplo trabajado y el segundo como caso de aplicación, sin un campo que identifique su función.

Se necesita:

- estado `draft/published/archived` para casos;
- revisor y fecha;
- tipo explícito `worked_example` o `application_case`;
- rúbrica o criterios de autoevaluación;
- control de que hechos, análisis y evidencias correspondan entre sí.

### 4.8. La ruta confunde acceso con preparación del contenido

Por decisión temporal, los 25 temas están visibles y accesibles. La tarjeta dice “Disponible” aunque el paquete esté en revisión y no tenga práctica. El estado de acceso curricular y el estado de preparación editorial son conceptos diferentes.

La ruta debería mostrar ambos:

- acceso: bloqueado, disponible, en progreso, completado o dominado;
- contenido: listo, parcial o en revisión.

Mientras `OPEN_CURRICULUM=true`, no puede validarse realmente el desbloqueo secuencial como experiencia final. Debe mantenerse así mientras el propietario lo solicite, pero antes del lanzamiento se necesita decidir si la progresión vuelve a activarse.

## 5. Estado y faltantes por tema

La notación `preguntas utilizables/creadas` y `casos utilizables/creados` distingue entre contenido almacenado y contenido que el estudiante puede usar.

| # | Tema | Preguntas | Casos | Fuente vinculada actual | Faltantes principales |
|---:|---|---:|---:|---|---|
| 1 | Constitución Política, títulos I y II | 0/0 | 0/0 | Solo manual en revisión | Vincular Constitución oficial; desarrollar principios fundamentales, grupos de derechos, garantías de protección y deberes; crear conceptos, ejemplo, caso y cuestionario. |
| 2 | CPACA, Ley 1437 de 2011 | 0/0 | 0/0 | Solo manual; la ley importada no está vinculada ni aprobada | Cubrir principios, derechos/deberes, actuación, términos, medios electrónicos, notificación, recursos, silencio y revocatoria; dividir el objetivo por subprocesos. |
| 3 | Ley de Transparencia | 0/0 | 0/0 | Solo manual | Vincular Ley 1712 oficial; cubrir sujetos obligados, transparencia activa, solicitud de acceso, información clasificada/reservada, excepciones y garantías. |
| 4 | Derecho de petición | 0/0 | 0/0 | Solo manual; existen dos documentos duplicados de Ley 1755 | Eliminar duplicado; validar Ley 1755; cubrir modalidades, términos, traslado, petición incompleta, atención prioritaria y reglas ante privados. |
| 5 | Sistema tributario y teoría de la imposición | 0/0 | 0/0 | Solo manual | Vincular las cartillas; cubrir tributos, elementos, principios, clasificación, incidencia, equidad, eficiencia, progresividad y efectos económicos. |
| 6 | Procedimiento tributario | 0/0 | 0/0 | Solo manual | Vincular Estatuto Tributario oficial completo; separar declaración/corrección, fiscalización, determinación, sanción, notificación, recursos, firmeza y cobro. Es demasiado amplio para un solo objetivo. |
| 7 | Sistema aduanero y cambiario | 0/0 | 0/0 | Solo manual | Validar Decreto 1165, Resolución Externa 1 y régimen cambiario; cubrir importación, exportación, tránsito, obligaciones, autoridades, canalización e informes. |
| 8 | Evasión, elusión y contrabando | 0/0 | 0/0 | Solo manual | Vincular Estatuto, Código Penal y Ley 1762; diferenciar conductas, abuso, consecuencias tributarias/administrativas/penales y casos de clasificación. |
| 9 | Recibo de declaraciones y recaudo | 0/0 | 0/0 | Solo manual | Cubrir presentación, lugares/canales, fecha de pago, recibos, errores, correcciones, conciliación y trazabilidad del recaudo; crear práctica procedimental. |
| 10 | Entidades autorizadas para recaudar | 0/0 | 0/0 | Solo manual | Validar Orden Administrativa; desarrollar autorización, recepción, transmisión, traslado de recursos, controles, responsabilidades y novedades. |
| 11 | Dinámica de la cuenta corriente | 0/6 | 0/2 | Artículos 800, 803 y 804 importados, pendientes | Corregir extracción: el artículo 800 absorbió el 800-1 y el 803 absorbió el 804; publicar fuentes oficiales; ampliar a débitos, créditos, saldos, ajustes, reimputación, conciliación y trazabilidad. Las preguntas y casos ya existen, pero están bloqueados. |
| 12 | Devoluciones y compensaciones | 0/2 | 0/2 | Decreto 2277 pendiente | Corregir literales/títulos y asociaciones pregunta-evidencia; cubrir requisitos generales y especiales, garantía, términos, inadmisión, rechazo, compensación previa, control y decisión. Ampliar banco. |
| 13 | Cobro coactivo y persuasivo | 9/9 | 2/2 | Artículos 823, 826 y 828 aprobados | Es el tema más funcional. Falta una fuente oficial específica para cobro persuasivo, revisar la pregunta de verificación del expediente, cubrir excepciones, facilidades, notificaciones adicionales, terminación y equilibrar subobjetivos. |
| 14 | Medidas cautelares | 4/5 | 0/2 | Artículo 837 aprobado + Orden Administrativa pendiente | Aprobar el procedimiento interno pertinente; corregir evidencia del quinto ítem; habilitar casos; ampliar inembargabilidad, límites, registro, secuestro, avalúo, reducción/levantamiento y concurrencia. |
| 15 | Procesos concursales | 0/2 | 0/2 | Cartilla de insolvencia pendiente | Validar fuentes primarias además de la cartilla; cubrir sujetos, apertura, acreencias, prelación, acuerdos, efectos sobre cobro y papel de la DIAN. |
| 16 | Régimen de insolvencia | 0/2 | 0/2 | Cartilla de insolvencia pendiente | Delimitarlo frente al tema 15; diferenciar régimen empresarial y persona natural no comerciante, reorganización, negociación, liquidación y efectos jurídicos. |
| 17 | Depuración y normalización de cartera | 0/2 | 0/2 | PR-COT-0372 pendiente | Desarrollar diagnóstico de saldo, exigibilidad, prescripción, remisión, ajustes, soportes, aprobaciones y trazabilidad; vincular normas que soporten cada causal. |
| 18 | Control extensivo de obligaciones | 0/2 | 0/2 | PR-COT-0382 pendiente | Cubrir planeación, calidad de datos, segmentación, comunicaciones, respuestas, escalamiento, informe, indicadores y protección de información. |
| 19 | Integridad DIAN y ética | 0/2 | 0/2 | Solo extracción visual pendiente | Conseguir texto oficial legible y verificable; desarrollar valores, conductas de hacer/no hacer, conflictos, uso de recursos, reporte y dilemas situacionales. |
| 20 | MIPG | 0/2 | 0/2 | Manual Operativo MIPG pendiente | Validar versión vigente; cubrir dimensiones, políticas, responsables, ciclo de gestión, indicadores, control, información y mejora. |
| 21 | Gestión documental | 0/2 | 0/2 | Ley 594 pendiente; Acuerdo 001/2024 está cargado pero no vinculado al concepto | Vincular y validar ambas fuentes; cubrir ciclo documental, expediente, principios, TRD, inventarios, transferencias, conservación, disposición y documentos electrónicos. |
| 22 | Políticas de servicio al ciudadano | 0/2 | 0/2 | Manual de servicio pendiente | Vincular lineamientos de política; cubrir acceso, canales, información, trámites, lenguaje, medición, participación y PQRSD. |
| 23 | Orientación al usuario y ciudadano | 0/2 | 0/2 | ABC y Manual de servicio pendientes | Diferenciar este tema del 22; cubrir escucha, caracterización, empatía, lenguaje claro, accesibilidad, datos personales, remisión y situaciones difíciles. |
| 24 | Herramientas informáticas | 0/2 | 0/2 | Solo manual en revisión | Definir fuentes pedagógicas válidas y un criterio de publicación que no dependa de que todo sea una norma jurídica; cubrir texto, hojas de cálculo, presentaciones, correo, colaboración, seguridad, versiones y casos prácticos. |
| 25 | Competencias comportamentales | 0/0 | 0/0 | Solo manual; el diccionario/resolución está cargado pero no vinculado | Vincular Resolución 065 de 2024 y diccionario; desarrollar competencias del nivel técnico, conductas observables, niveles y preguntas situacionales. |

## 6. Qué temas necesitan cuestionario

### Necesitan cuestionario desde cero

Temas 1 al 10 y 25. Son 11 temas sin una sola pregunta o caso creado.

### Tienen cuestionario creado, pero no se puede usar

Temas 11, 12 y 15 al 24. Sus 28 preguntas y 24 casos están bloqueados por fuentes pendientes.

### Tienen cuestionario parcial

Tema 14. Hay cinco preguntas creadas, cuatro utilizables, y dos casos creados pero ninguno utilizable.

### Tiene cuestionario utilizable, pero requiere revisión de cobertura

Tema 13. Tiene nueve preguntas y dos casos utilizables, pero no cubre adecuadamente toda la parte persuasiva del nombre del tema y conserva una pregunta cuyo respaldo no demuestra de forma directa toda la regla.

### Mínimo recomendado para considerar un tema practicable

Como criterio de producto —no como regla legal— se recomienda:

- mínimo 6 preguntas utilizables por tema;
- al menos 2 de reconocimiento/recuerdo;
- al menos 2 de comprensión de condiciones o excepciones;
- al menos 2 de aplicación o transferencia;
- mínimo 1 ejemplo trabajado;
- mínimo 1 caso situacional;
- todas con evidencia directa, explicación específica y revisión humana.

Para temas críticos o muy amplios, el mínimo debería subir a 10–12 preguntas o dividir el tema en varios objetivos.

Si las 29 preguntas hoy bloqueadas fueran correctamente revisadas y habilitadas, todavía sería necesario crear al menos 111 preguntas nuevas para que cada tema alcance seis, sin contar ampliaciones de temas críticos. Con el estado utilizable actual, faltan 140 preguntas distribuidas por tema para alcanzar ese umbral.

## 7. Mejoras necesarias en las preguntas

Además de aumentar la cantidad, debe corregirse la calidad del banco:

1. balancear o barajar las opciones correctas;
2. comprobar que cada evidencia demuestre literalmente la respuesta;
3. evitar distractores obviamente absurdos;
4. crear distractores a partir de errores reales: término, excepción, orden, versión, competencia o interpretación;
5. distribuir dificultad con criterios editoriales, no solo con valores fijos 0,4 y 0,6;
6. incluir preguntas con más de una fuente cuando la respuesta realmente exija relacionarlas;
7. distinguir preguntas de recuerdo, comprensión y aplicación;
8. retirar la marca de revisión automática del usuario demo;
9. normalizar los tipos de error;
10. añadir métricas de desempeño por pregunta: tasa de acierto, discriminación, tiempo y distractores elegidos.

## 8. Mejoras necesarias en ejemplos y casos

Los temas 11 a 24 contienen dos casos cada uno en la base, pero su disponibilidad depende de la fuente. Los temas 1 a 10 y 25 no tienen ninguno.

Para completar esta parte:

- crear al menos un ejemplo trabajado y un caso situacional por tema cuando exista una decisión aplicable;
- separar explícitamente el ejemplo resuelto del caso que responde el estudiante;
- añadir estado editorial y responsable de revisión;
- enlazar únicamente las evidencias necesarias para cada afirmación;
- añadir una rúbrica breve: identificación del problema, regla, condiciones/excepciones, conclusión y fuente;
- guardar las respuestas de recuperación y cierre si van a formar parte del diagnóstico;
- diferenciar autoevaluación de calificación automática.

## 9. Mejoras de experiencia y funcionamiento

### Prioridad alta

1. Mostrar el estado editorial del tema desde la ruta, no solo después de abrirlo.
2. Separar “tema accesible” de “tema listo para estudiar”.
3. Corregir textos como “1 preguntas revisadas”.
4. Permitir una URL recuperable por tema, objetivo y fuente; actualmente la navegación depende principalmente del estado interno de la aplicación.
5. Conservar el punto de lectura y permitir continuar una sesión interrumpida.
6. Mostrar la fecha/versión de vigencia junto a la fuente.
7. Incluir enlace oficial externo en cada extracto; hoy 39 documentos carecen de él.
8. Indicar claramente qué componente falta: fuente, revisión, preguntas, ejemplo o caso.

### Prioridad media

1. Búsqueda transversal por tema, artículo, concepto y pregunta.
2. Filtros de ruta por listo, parcial, en revisión, pendiente y dominado.
3. Panel de cobertura editorial por tema.
4. Historial de cambios y segunda aprobación para contenido jurídico.
5. Exportación o impresión de lecturas revisadas.
6. Estadísticas por objetivo y por tipo de error.
7. Recomendaciones que no envíen al estudiante a un tema sin actividad utilizable salvo que la acción se rotule claramente como lectura.

## 10. Calidad de datos que debe corregirse

Antes de aprobar masivamente el corpus se necesita una campaña de depuración:

- separar artículos que quedaron unidos, como 803 y 804;
- impedir que el cuerpo completo aparezca como título;
- conservar literales `a)`, `b)`, `c)` como jerarquía de la norma, no como título pedagógico aislado;
- detectar encabezados, tablas de contenido, bibliografías y pies de página;
- corregir títulos truncados o con comillas rotas;
- normalizar nombres de documentos y tipos documentales;
- resolver el duplicado de Ley 1755;
- revisar las 60 alertas automáticas de extracción;
- ampliar las reglas automáticas, porque los 7.969 títulos sobredimensionados demuestran que las alertas actuales no cubren el defecto más frecuente;
- añadir pruebas de segmentación para artículos, parágrafos, numerales y literales.

## 11. Pruebas que todavía faltan

Las 54 pruebas actuales pasan, pero la cobertura del navegador es mínima: el frontend solo tiene dos pruebas de formato y no hay una suite E2E.

Se necesitan recorridos automatizados para:

1. iniciar sesión;
2. abrir cada uno de los estados `READY`, `PARTIAL` e `IN_REVIEW`;
3. navegar de tema a fuente y regresar al mismo punto;
4. impedir práctica con evidencia pendiente;
5. contestar una pregunta y verificar feedback, error, dominio y repaso;
6. responder un caso y verificar que la respuesta quede registrada;
7. validar reanudación de sesión;
8. validar todos los temas con una prueba de contrato de contenido;
9. comprobar teclado, lector de pantalla, contraste y diseño móvil;
10. comprobar que una actualización normativa retire o actualice actividades afectadas.

Cada tema debería tener una prueba automática de preparación que falle si no cumple su contrato mínimo.

## 12. Plan recomendado para terminar la plataforma

### Fase 1 — Saneamiento editorial y fuentes

1. Definir el contrato de “tema listo”.
2. Priorizar las unidades exactas usadas por los 25 temas.
3. Corregir segmentación y metadatos.
4. registrar URLs oficiales y vigencia;
5. revisar y publicar las fuentes prioritarias;
6. corregir pregunta-evidencia y estados editoriales.

Orden sugerido: 11, 12, 14, 15–18, 19–23, 1–10, 24 y 25. El tema 13 se usa como modelo, pero debe corregirse antes de declararlo terminado.

### Fase 2 — Completar paquetes de estudio

Para cada tema:

1. dividir el objetivo en subobjetivos cuando sea demasiado amplio;
2. crear 3–6 conceptos por objetivo;
3. escribir lectura, reglas, condiciones y excepciones;
4. vincular evidencias directas;
5. crear ejemplo trabajado y comprobaciones;
6. crear o revisar caso situacional;
7. pasar revisión jurídica y pedagógica.

### Fase 3 — Completar cuestionarios

1. habilitar las 29 preguntas existentes solo después de corregir sus fuentes;
2. crear cuestionarios para temas 1–10 y 25;
3. ampliar los temas que solo tienen dos preguntas;
4. balancear respuestas y dificultad;
5. hacer revisión cruzada y prueba piloto;
6. medir el comportamiento real de cada ítem.

### Fase 4 — Cierre funcional

1. añadir estado editorial de casos;
2. mostrar preparación del contenido en la ruta;
3. añadir enlaces profundos y reanudación;
4. crear panel de cobertura;
5. implementar E2E y accesibilidad;
6. decidir cuándo reactivar el bloqueo progresivo;
7. realizar una prueba completa con usuarios.

## 13. Criterio objetivo para declarar un tema terminado

Un tema solo debería marcarse como terminado cuando cumpla todo lo siguiente:

- objetivo observable y alcance delimitado;
- fuente primaria o material pedagógico apropiado, revisado y versionado;
- URL oficial cuando corresponda;
- vigencia confirmada;
- 3–6 conceptos o reglas esenciales por objetivo;
- lectura clara con condiciones, excepciones y procedimiento;
- extractos correctamente segmentados;
- al menos una comprobación breve;
- ejemplo trabajado revisado;
- mínimo seis preguntas utilizables y variadas;
- caso situacional, cuando el tema permita aplicación;
- correspondencia directa entre cada actividad y su evidencia;
- revisor jurídico/pedagógico identificable;
- prueba automática del contrato del tema;
- recorrido manual satisfactorio en escritorio y móvil.

## 14. Criterio para declarar la plataforma utilizable

La plataforma puede considerarse funcional para uso integral cuando:

1. los 25 temas cumplen el contrato mínimo o los incompletos se excluyen claramente de la ruta evaluable;
2. no existe contenido marcado como revisado por un proceso automático o una cuenta demo;
3. todas las preguntas y casos visibles tienen evidencia válida;
4. la práctica cubre toda la ruta y no solo cobro coactivo;
5. las fuentes tienen procedencia, versión, vigencia y enlace;
6. el progreso puede avanzar en todos los temas;
7. los casos registran respuestas y muestran una referencia editorial revisada;
8. no existe sesgo predecible en las respuestas;
9. las pruebas E2E cubren el recorrido principal;
10. se realiza una revisión humana final del contenido jurídico.

## 15. Verificaciones realizadas

- inspección del currículo, semillas, modelo de datos y generación del paquete de estudio;
- consulta directa de documentos, unidades, evidencias, preguntas y casos en PostgreSQL;
- comprobación visual de la portada, tema 12 en revisión y tema 13 listo;
- revisión de la asociación exacta entre preguntas y disposiciones para los temas 11–14;
- ejecución de 56 pruebas: todas exitosas;
- validación estática: exitosa;
- compilación de producción: exitosa;
- estado de contenedores: web, API y PostgreSQL saludables.

## 16. Remediación aplicada en la rama `Olger`

Actualización del 1 de octubre de 2026. El diagnóstico de las secciones anteriores describe el estado inicial de la plataforma; después de esa medición se aplicaron las siguientes correcciones:

- se completaron los temas 1–10 y 25 con lectura estructurada, reglas, ejemplo trabajado, caso situacional y fuentes oficiales;
- se revisaron los temas 12–24 y se conservaron sus paquetes pedagógicos, corrigiendo referencias desactualizadas o demasiado amplias;
- se reemplazó en devoluciones la referencia inadecuada al Decreto 2277 por los artículos 850, 855, 857 y 860 del Estatuto Tributario;
- se incorporó en insolvencia la Ley 1116 de 2006 y la reforma de la Ley 2445 de 2025;
- se separaron con precisión las fuentes de abuso tributario y contrabando en el tema 8;
- se incorporaron fuentes oficiales específicas para integridad, MIPG, gestión documental, servicio al ciudadano, seguridad digital y competencias comportamentales;
- se normalizaron los títulos de los extractos para que el encabezado sea breve y el desarrollo quede en el cuerpo de lectura;
- se publicaron únicamente preguntas y casos con evidencia trazable hacia una disposición aprobada y un enlace oficial;
- se añadió ciclo editorial a los casos: borrador, publicado o archivado, con tipo de actividad, revisor y fecha de revisión;
- se hizo dinámico el número de preguntas de cada sesión, eliminando la indicación fija y errónea de diez preguntas;
- se añadió una validación de semilla que detiene la carga si cualquier tema incumple el contrato mínimo de contenido.

### 16.1 Cobertura final comprobada

| Control | Resultado |
|---|---:|
| Temas activos | 25 de 25 |
| Conceptos por tema | mínimo 3 |
| Preguntas publicadas por tema | mínimo 6 |
| Ejemplos trabajados | 25 |
| Casos situacionales | 25 |
| Preguntas sin evidencia oficial publicable | 0 |
| Casos sin evidencia oficial publicable | 0 |
| Distribución de respuestas correctas | A: 41, B: 41, C: 40, D: 38 |
| Pruebas automatizadas | 56 de 56 exitosas |
| Validación estática | exitosa |
| Compilación de producción | exitosa |

Los temas 13 y 14 conservan actividades adicionales que ya existían y que cumplen los controles editoriales; por eso superan el mínimo de seis preguntas. Todos los demás temas tienen seis preguntas publicadas.

### 16.2 Alcance de la revisión

La plataforma queda funcional para estudio individual y todos los temas pueden recorrerse sin bloqueo. Las referencias se contrastaron con fuentes primarias de DIAN, Función Pública, Banco de la República, Archivo General de la Nación y Superintendencia de Sociedades, según el tema.

La etiqueta técnica `official-source-curation-2026-09-30` identifica una curaduría asistida y no debe interpretarse como concepto jurídico emitido por una autoridad. Antes de usar la plataforma como material institucional, banco oficial de evaluación o asesoría jurídica, sigue siendo recomendable una revisión independiente por una persona experta en derecho tributario, aduanero, administrativo y gestión pública.
