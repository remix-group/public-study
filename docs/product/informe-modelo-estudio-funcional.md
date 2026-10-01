# Informe de propuesta: Modelo de estudio funcional por tema

## 1. Propósito

Este informe define cómo debe funcionar la experiencia de estudio cuando el usuario entra a un tema de public-study.

El problema observado es que la pantalla explica qué debería hacer el estudiante, pero no siempre le entrega material suficiente para hacerlo. La recuperación inicial aparece, pero después puede no existir una lectura, una explicación guiada o una fuente visible antes de las preguntas.

La solución propuesta no reemplaza el modelo ya definido. Lo completa. La ruta, el desbloqueo secuencial, el dominio multidimensional, las recomendaciones, la práctica y los repasos permanecen vigentes. La actualización consiste en convertir cada tema en una experiencia de aprendizaje completa y verificable.

## 2. Diagnóstico del flujo actual

El flujo actual contiene buenas decisiones pedagógicas:

- comienza con recuperación inicial;
- muestra el objetivo de aprendizaje;
- separa lectura y práctica;
- utiliza evidencia jurídica;
- enlaza las preguntas con fuentes;
- conserva los modos `LEARN`, `PRACTICE`, `ASSESS`, `REVIEW` y `CASE`.

Sin embargo, presenta una limitación estructural:

1. `GuidedStudy` obtiene conceptos y evidencias vinculados al `LearningObjective`.
2. La lectura visible se construye principalmente con `keyConcepts` y `evidences`.
3. El material importado como unidades `study_manual`, `study_topic` o `study_guide` no se convierte automáticamente en una lectura didáctica completa del objetivo.
4. Muchas unidades importadas permanecen en `pending/draft` o `REVIEW_REQUIRED`, por lo que no pueden tratarse como fuente jurídica publicada.
5. Si un objetivo no tiene suficientes conceptos, evidencias o preguntas publicadas, la interfaz conserva la estructura de la pantalla, pero no tiene contenido que mostrar.

El resultado es un “cascarón” correcto desde el punto de vista de navegación, pero insuficiente desde el punto de vista de aprendizaje.

## 3. Modelo de estudio seleccionado

Se recomienda un modelo compuesto de aprendizaje activo y guiado:

```text
Orientación
    ↓
Recuperación inicial
    ↓
Lectura breve y estructurada
    ↓
Ejemplo trabajado o caso guiado
    ↓
Recuperación con retroalimentación
    ↓
Práctica graduada
    ↓
Aplicación a un caso
    ↓
Repaso espaciado e intercalado
```

No se propone una sola técnica aislada. La evidencia disponible favorece combinar recuperación activa, distribución temporal, retroalimentación específica y ejemplos guiados, especialmente cuando el estudiante todavía no domina un procedimiento.

### 3.1 Recuperación activa

La recuperación inicial ya existe y debe conservarse. No debe convertirse en un examen que bloquee al usuario. Su función es activar conocimientos previos, revelar vacíos y preparar la comparación con la lectura.

La investigación sobre el efecto de prueba muestra que intentar recuperar información mejora la retención posterior más que releerla repetidamente, especialmente cuando la evaluación se realiza después de un intervalo. [Roediger y Karpicke, 2006](https://pubmed.ncbi.nlm.nih.gov/16507066/)

### 3.2 Práctica distribuida

Un tema no debe considerarse estudiado por una única visita. La plataforma debe recuperar partes del tema en sesiones posteriores y mezclarlas gradualmente con otros temas relacionados. La síntesis cuantitativa de Cepeda y colaboradores revisó 317 experimentos y encontró que la distribución temporal influye en la retención final. [Cepeda et al., 2006](https://pubmed.ncbi.nlm.nih.gov/16719566/)

Esto encaja directamente con `ReviewSchedule`, `retention` y `stability`, ya presentes en el dominio.

### 3.3 Ejemplos trabajados y casos guiados

Antes de pedir al principiante que resuelva un caso complejo, debe ver cómo se aplica una regla a una situación. El ejemplo debe mostrar la secuencia de decisión, la regla utilizada, la excepción y la fuente.

La evidencia sobre ejemplos trabajados indica que pueden mejorar la retención y la transferencia y reducir la carga cognitiva frente a resolver problemas sin guía, especialmente en aprendices novatos. [Chen et al., 2023](https://doi.org/10.1080/01443410.2023.2273762)

Para public-study, el ejemplo trabajado debe ser jurídico y trazable: nunca debe inventar hechos o reglas no presentes en las fuentes aprobadas.

### 3.4 Retroalimentación específica

La respuesta a una pregunta no debe limitarse a “correcto” o “incorrecto”. Debe explicar:

- qué regla estaba siendo evaluada;
- qué parte de la respuesta era correcta o incorrecta;
- qué evidencia lo demuestra;
- qué error tipificado pudo ocurrir;
- qué debe intentar recuperar después.

Una meta-análisis de 435 estudios encontró un efecto medio de la retroalimentación sobre el aprendizaje, pero también mostró que la calidad depende del contenido informativo de la retroalimentación. [Wisniewski, Zierer y Hattie, 2020](https://pmc.ncbi.nlm.nih.gov/articles/PMC6987456/)

### 3.5 Control de carga cognitiva

La lectura debe ser breve, segmentada y progresiva. No debe presentar un documento completo sin orientación ni una pantalla con demasiadas tarjetas simultáneas.

El tema debe comenzar con lo indispensable, permitir revelar el texto literal y llevar después a un ejemplo y a la práctica. La fuente original siempre debe estar disponible, pero no debe sustituir la explicación de cómo estudiarla.

## 4. La unidad funcional: paquete de estudio del objetivo

Cada `LearningObjective` debe tener un paquete de estudio listo para abrirse. El paquete no es una nueva entidad de dominio obligatoria; puede ser una proyección derivada de objetivos, conceptos, unidades documentales, evidencias, preguntas y casos.

El paquete debe contener:

1. propósito del objetivo;
2. resultado observable;
3. activación de conocimientos previos;
4. lectura estructurada;
5. conceptos esenciales;
6. fuente primaria o material documental asociado;
7. ejemplo trabajado o caso guiado;
8. comprobaciones breves de comprensión;
9. práctica formal con preguntas publicadas;
10. aplicación situacional;
11. resumen para recuperar sin mirar;
12. próxima revisión recomendada.

La información debe estar separada por capas:

- **Fuente:** texto literal proveniente de la unidad documental.
- **Explicación pedagógica:** organización y lenguaje de apoyo, siempre respaldados por la fuente.
- **Actividad:** tarea que el estudiante debe realizar.
- **Evaluación:** pregunta publicada con evidencia.

Nunca debe mezclarse una explicación generada con una transcripción que se presenta como texto original.

## 5. Flujo de estudio por tema

### Paso 0 — Orientación

Antes de pedir una respuesta, la pantalla debe indicar:

- nombre del tema;
- objetivo concreto;
- tiempo estimado;
- qué podrá hacer el estudiante al terminar;
- fuente o fuentes que se utilizarán;
- estado del material: revisado, pendiente o en preparación.

Ejemplo de texto:

> Al terminar podrás identificar qué obligaciones pueden cobrarse mediante el procedimiento administrativo coactivo y distinguirlas de otras obligaciones.

### Paso 1 — Recuperación inicial

Se conserva la pantalla actual:

- pregunta abierta o breve;
- posibilidad de continuar sin responder;
- explicación de que no es una calificación;
- registro opcional de la respuesta para comparar después.

No debe aparecer todavía la solución completa.

### Paso 2 — Lectura guiada

Después de la recuperación, el usuario debe ver una lectura real, no solo una instrucción.

La lectura debe tener esta estructura:

1. **Idea central:** una frase que delimita el objetivo.
2. **Regla o procedimiento:** explicación breve y ordenada.
3. **Términos clave:** definiciones mínimas necesarias.
4. **Condiciones y excepciones:** qué cambia la aplicación de la regla.
5. **Fuente primaria:** fragmento literal, citación, documento y estado editorial.
6. **Comprobación:** una pregunta corta antes de continuar.

La lectura debe poder existir aunque todavía no haya preguntas formales publicadas. La ausencia de preguntas no puede dejar vacío el aprendizaje.

### Paso 3 — Ejemplo trabajado

El estudiante debe ver una situación sencilla con el razonamiento visible:

```text
Situación → Regla aplicable → Condición o excepción → Conclusión → Fuente
```

El ejemplo no debe pedir primero una solución completa. Puede revelar cada paso de forma progresiva.

Para un tema de procedimiento, el ejemplo debe mostrar el orden de actuación. Para un tema normativo, debe mostrar cómo se identifica el supuesto, la regla, la excepción y la consecuencia.

### Paso 4 — Recuperación con retroalimentación

Antes de iniciar la batería de preguntas, el usuario debe responder una o dos comprobaciones breves:

- explicar la regla con sus propias palabras;
- ordenar pasos;
- elegir qué condición aplica;
- identificar la fuente correcta;
- distinguir una excepción.

Después de cada respuesta debe aparecer retroalimentación con referencia al fragmento estudiado.

### Paso 5 — Práctica graduada

Las preguntas deben organizarse de menor a mayor dificultad:

1. reconocimiento de la regla;
2. comprensión de condiciones;
3. discriminación entre opciones cercanas;
4. aplicación a un caso;
5. transferencia a una situación no idéntica.

La sesión de práctica solo debe utilizar preguntas `published` con evidencia válida, como ya exige el sistema. Si no hay preguntas suficientes, la interfaz debe indicarlo claramente y continuar ofreciendo lectura, ejemplo y comprobación, en lugar de presentar una pantalla vacía.

### Paso 6 — Aplicación

Cada tema debe incluir, cuando el contenido lo permita, un caso situacional breve. El caso debe usar hechos explícitos, pedir una decisión concreta y permitir identificar el tipo de error:

- concepto desconocido;
- confusión entre conceptos;
- olvido de regla;
- excepción omitida;
- versión normativa incorrecta;
- orden procesal incorrecto;
- interpretación del caso;
- descuido.

La aplicación alimenta la dimensión `application` de `MasteryState` y no debe reducirse a otra pregunta idéntica de selección múltiple.

### Paso 7 — Cierre y recuperación futura

El cierre debe pedir al usuario que recupere sin mirar:

- la regla principal;
- dos condiciones o excepciones;
- un ejemplo de aplicación;
- la fuente que respalda la regla.

Luego debe mostrar:

- qué completó;
- qué debe reforzar;
- qué error se detectó, si aplica;
- cuándo se recomienda volver a estudiar;
- qué acción sigue en la ruta.

## 6. Modelo de contenido para cada uno de los 25 temas

Cada tema debe pasar una lista de preparación antes de considerarse funcional:

| Componente | Requisito mínimo |
|---|---|
| Objetivo | Una capacidad observable y concreta |
| Lectura | Una explicación organizada en bloques cortos |
| Fuente | Al menos una unidad documental vinculada y trazable |
| Conceptos | Entre 3 y 6 ideas esenciales, según complejidad |
| Ejemplo | Un ejemplo trabajado o procedimiento guiado |
| Comprobación | Una actividad breve con retroalimentación |
| Práctica | Preguntas publicadas si existen contenidos evaluativos validados |
| Aplicación | Un caso o decisión contextual cuando corresponda |
| Cierre | Resumen recuperable y próxima revisión |

No todos los temas tienen que usar exactamente la misma cantidad de preguntas o casos. Sí deben cumplir la misma estructura mínima de aprendizaje.

## 7. Cómo usar el material que ya existe

La plataforma ya dispone de material importado, unidades documentales, evidencias, manuales, ruta de aprendizaje y documentos jurídicos. La prioridad debe ser conectar ese material con los objetivos, no inventar un segundo corpus.

### 7.1 Fuentes primarias

Las normas y documentos oficiales aprobados alimentan la sección de fuente primaria y las evidencias de las preguntas.

### 7.2 Manual y ruta de aprendizaje

El manual y la ruta pueden aportar orientación pedagógica, descripciones de temas y secuencia curricular. Deben mostrarse como material pedagógico aportado, no como autoridad jurídica, de acuerdo con el modelo legal existente.

### 7.3 Unidades pendientes

Una unidad `pending`, `draft` o `REVIEW_REQUIRED` puede aparecer como material en revisión, pero no debe presentarse como fuente jurídica validada. El paquete de estudio debe distinguir:

- “Fuente oficial revisada”;
- “Material pedagógico incorporado”;
- “Material pendiente de revisión”.

### 7.4 Ausencia de material suficiente

Si un tema todavía no tiene lectura validada, la pantalla debe mostrar un estado honesto:

> Este tema está incorporado a la ruta, pero la lectura revisada aún está en preparación. Puedes consultar el material documental disponible y volver cuando se habilite la práctica.

No se debe rellenar el espacio con contenido inventado ni activar preguntas sin evidencia.

## 8. Contrato funcional recomendado

La lectura guiada debería devolver, además de los datos actuales, una estructura semejante a:

```ts
type StudyPackage = {
  objective: ObjectiveSummary;
  readiness: "READY" | "PARTIAL" | "IN_REVIEW";
  estimatedMinutes: number;
  outcome: string;
  retrievalPrompt: string;
  lesson: Array<{
    id: string;
    kind: "central_idea" | "rule" | "term" | "condition" | "source";
    title: string;
    content: string;
    sourceEvidenceIds: string[];
    status: "reviewed" | "pending";
  }>;
  workedExample: WorkedExample | null;
  checks: CheckQuestion[];
  practice: { available: boolean; questionCount: number };
  applicationCase: CaseSummary | null;
  closure: ClosurePrompt;
  nextReview: string | null;
};
```

Este contrato puede ser una proyección de lectura y no exige crear una entidad nueva. Si se decide persistir ejemplos, comprobaciones o paquetes editoriales, esa decisión debe reflejarse en el modelo de dominio y en un ADR.

## 9. Estados de disponibilidad

La interfaz debe comunicar la disponibilidad de forma explícita:

### `READY`

Existe lectura, fuente trazable, actividad y al menos una ruta de práctica o aplicación.

### `PARTIAL`

Existe lectura y fuente, pero faltan preguntas, ejemplo o caso. El estudiante aún puede estudiar; lo faltante se rotula.

### `IN_REVIEW`

El material existe, pero todavía no puede presentarse como fuente validada. Se permite consultar el material solo con una advertencia clara y no se habilita como evidencia jurídica publicada.

Estos estados evitan que el sistema confunda “tema existente” con “tema listo para estudiar”.

## 10. Ajustes técnicos sugeridos

### Primera prioridad: evitar la pantalla vacía

1. ampliar `getObjectiveStudyGuide` para buscar las unidades documentales asociadas al tema y al objetivo;
2. devolver una lectura estructurada, aunque sea parcial;
3. mostrar una pantalla de estado cuando no existan fuentes o preguntas;
4. diferenciar material revisado y pendiente;
5. mantener la entrada de recuperación inicial antes de revelar la lectura.

### Segunda prioridad: completar el ciclo

1. agregar comprobaciones breves con retroalimentación;
2. incorporar ejemplos trabajados respaldados por evidencia;
3. conectar casos con la dimensión `application`;
4. cerrar cada sesión con recuperación y próxima revisión;
5. reutilizar `ReviewSchedule` para distribuir el contenido en el tiempo.

### Tercera prioridad: editor de paquetes

Para los 25 temas, el rol editor debe poder revisar:

- resultado de aprendizaje;
- lectura;
- fuentes asociadas;
- ejemplo;
- comprobaciones;
- preguntas;
- caso;
- estado de publicación.

La publicación debe exigir procedencia y revisión humana, igual que ocurre con las preguntas y las unidades jurídicas.

## 11. Qué no debe hacerse

- No mostrar únicamente una consigna del tipo “estudia este tema”.
- No lanzar preguntas antes de garantizar acceso a la lectura o a una fuente.
- No convertir una explicación generada en texto jurídico original.
- No publicar automáticamente contenido pendiente de revisión.
- No usar el número de preguntas como sustituto de una lectura.
- No considerar que leer completa el tema.
- No marcar un objetivo como dominado por abrir la pantalla.
- No crear 25 páginas distintas con lógicas incompatibles; debe existir una plantilla común con contenido específico por tema.
- No bloquear la lectura porque todavía no haya preguntas, siempre que exista material trazable y correctamente rotulado.

## 12. Criterios de aceptación

- Cada tema accesible abre una experiencia con objetivo, propósito y material visible.
- Después de la recuperación inicial el estudiante puede leer una explicación estructurada.
- La lectura muestra al menos una fuente o indica honestamente que aún está en revisión.
- Las preguntas no aparecen como sustituto de la lectura.
- Si no hay preguntas publicadas, la pantalla ofrece lectura, comprobación o material pendiente claramente rotulado.
- Cada afirmación presentada como jurídica tiene una evidencia asociada.
- Cada tema puede incluir un ejemplo trabajado y una aplicación contextual cuando corresponda.
- La retroalimentación explica la regla y enlaza la evidencia utilizada.
- El cierre solicita recuperación sin consultar el texto y programa la revisión futura.
- La actividad no modifica las reglas de desbloqueo, el umbral del 70 %, el dominio multidimensional ni la ruta existente.
- Los 25 temas utilizan el mismo modelo funcional y solo cambian sus contenidos, fuentes, ejemplos y preguntas.
- El estudiante nunca queda frente a un contenedor vacío sin explicación del estado del material.

## 13. Plan de implementación

### Fase 1 — Lectura mínima funcional

Conectar cada objetivo con sus unidades documentales y construir una lectura visible con propósito, regla, conceptos y fuente. Resolver el estado vacío.

### Fase 2 — Plantilla común para los 25 temas

Aplicar el mismo paquete de estudio a todos los temas y registrar qué componentes están listos, parciales o en revisión.

### Fase 3 — Ejemplos y comprobaciones

Agregar un ejemplo trabajado y una o dos comprobaciones con retroalimentación por tema.

### Fase 4 — Casos y aplicación

Crear casos situacionales para los temas que impliquen procedimiento, decisión o interpretación.

### Fase 5 — Repaso adaptativo

Distribuir comprobaciones, preguntas y recuperaciones mediante `ReviewSchedule`, `retention` y `stability`.

### Fase 6 — Revisión editorial y métricas

Permitir publicar paquetes de estudio después de revisión y medir: finalización de lectura, recuperación posterior, desempeño diferido, errores por tipo y retorno a los repasos.

## Conclusión

El problema no se resuelve agregando más preguntas ni más instrucciones. Se resuelve garantizando que cada objetivo tenga una secuencia completa: recuperar, leer, observar una aplicación, comprobar, practicar, aplicar y volver a recuperar después.

La recomendación es implementar primero una plantilla común de paquete de estudio para los 25 temas, alimentada por el contenido documental ya incorporado. De esa manera public-study conserva su método de aprendizaje activo y adaptativo, pero deja de mostrar un cascarón vacío y empieza a entregar una experiencia real de estudio, con fuentes, guía y siguiente paso.

## Referencias de investigación

- [Roediger y Karpicke (2006), Test-enhanced learning](https://pubmed.ncbi.nlm.nih.gov/16507066/).
- [Roediger y Karpicke (2006), The power of testing memory](https://pubmed.ncbi.nlm.nih.gov/26151629/).
- [Cepeda et al. (2006), Distributed practice in verbal recall tasks](https://pubmed.ncbi.nlm.nih.gov/16719566/).
- [Chen et al. (2023), The effect of worked examples on learning solution steps and knowledge transfer](https://doi.org/10.1080/01443410.2023.2273762).
- [Wisniewski, Zierer y Hattie (2020), The power of feedback revisited](https://pmc.ncbi.nlm.nih.gov/articles/PMC6987456/).
