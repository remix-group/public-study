# Informe de propuesta: Página principal como ruta guiada

## 1. Propósito

Este informe propone reorganizar la página principal de public-study para reducir la carga visual y hacer más intuitiva la navegación, sin alterar el método de estudio, el modelo de dominio ni las reglas de progresión ya definidas.

La página principal debe funcionar como un punto de orientación: indicar al estudiante qué puede hacer ahora, mostrar dónde se encuentra dentro de la ruta y permitir explorar el resto del contenido sin presentar todos los bloques y objetivos al mismo tiempo.

## 2. Diagnóstico de la pantalla actual

La implementación actual contiene información valiosa, pero la presenta en una sola secuencia extensa:

- saludo y dominio global;
- explicación completa del ciclo de aprendizaje;
- siguiente acción recomendada;
- métricas de progreso;
- seis bloques de la ruta;
- veinticinco temas visibles;
- tarjetas independientes para todos los objetivos;
- mensaje de respaldo normativo.

El problema principal no es la cantidad de información del sistema, sino que toda aparece simultáneamente y con un peso visual parecido. El estudiante debe decidir entre muchas acciones antes de entender cuál es el siguiente paso recomendado.

Esto puede producir:

- sensación de lista extensa en lugar de sensación de avance;
- dificultad para distinguir la acción prioritaria;
- repetición de información entre bloques, temas y objetivos;
- desplazamiento excesivo en la página;
- sobrecarga para estudiantes nuevos;
- menor comprensión del estado real de la ruta.

## 3. Principio de diseño

La página debe mostrar primero lo necesario para actuar y revelar progresivamente el resto.

```text
Qué hago ahora
    ↓
Dónde estoy
    ↓
Qué sigue
    ↓
Qué puedo explorar
```

La interfaz no debe ocultar información importante de forma permanente. Debe organizarla mediante desplegables, paneles secundarios, navegación contextual y estados resumidos.

## 4. Objetivos de la nueva página principal

La nueva portada debe permitir que el estudiante responda en pocos segundos:

1. ¿Cuál es mi siguiente acción recomendada?
2. ¿En qué tema estoy?
3. ¿Qué avance tengo?
4. ¿Qué tema se desbloquea después?
5. ¿Dónde puedo consultar el resto de la ruta?
6. ¿Cómo funciona el método de estudio?

La respuesta a la primera pregunta debe ocupar la mayor jerarquía visual. Las demás deben estar disponibles sin competir con ella.

## 5. Estructura propuesta de la página

### 5.1 Cabecera compacta

La cabecera debe conservar:

- saludo personalizado;
- identificación de la OPEC o ruta activa;
- acceso a Biblioteca, Fuentes y Preguntas según el rol;
- menú de cuenta.

Debe evitar repetir en la cabecera el porcentaje de dominio si este ya aparece en el resumen principal. El dominio global puede mostrarse como un indicador secundario junto al estado de la ruta.

### 5.2 Panel principal: “Siguiente paso”

Este debe ser el primer bloque de contenido y la acción dominante de la pantalla.

Debe mostrar:

- nombre del objetivo recomendado;
- tema y bloque al que pertenece;
- razón de la recomendación;
- tipo de acción: aprender, practicar o repasar;
- duración estimada;
- número de preguntas revisadas disponibles;
- progreso del objetivo;
- botones de acción.

La acción primaria debe cambiar según el estado:

- `LEARN`: “Aprender tema”;
- `PRACTICE`: “Practicar”;
- `REVIEW`: “Repasar”.

No se debe añadir una segunda acción equivalente que compita con la principal. Si existe una alternativa, debe quedar como acción secundaria y contextual.

### 5.3 Resumen de progreso

En lugar de cuatro tarjetas grandes, se recomienda un resumen compacto con tres indicadores:

- dominio global;
- objetivos con actividad;
- repasos pendientes.

Las sesiones completadas pueden aparecer en el historial o dentro de un panel desplegable de actividad reciente. No es necesario darle el mismo peso visual que a la siguiente acción.

### 5.4 Estado de la ruta

Después de la acción recomendada debe aparecer una representación breve de la ruta:

- bloque actual;
- tema actual;
- próximo tema, si está desbloqueado o cerca de desbloquearse;
- porcentaje de avance de la ruta;
- estado de los temas anteriores.

La ruta debe comunicar secuencia y continuidad, no mostrar todo como un tablero de tarjetas independientes.

### 5.5 Bloques desplegables

Los seis bloques deben presentarse como un acordeón o lista vertical compacta. Cada bloque cerrado debe mostrar:

- número y nombre;
- descripción corta;
- cantidad de temas;
- progreso agregado;
- estado: bloqueado, disponible, en progreso, completado o dominado;
- indicador visual de expansión.

Por defecto:

- el bloque actual aparece abierto;
- el bloque siguiente puede aparecer parcialmente resumido;
- los demás permanecen cerrados.

Al abrir un bloque, se muestran sus temas en orden. No deben abrirse todos los bloques automáticamente.

### 5.6 Temas dentro del bloque

Cada tema desplegado debe mostrar únicamente la información necesaria para decidir:

- número de orden;
- nombre;
- descripción breve;
- estado curricular;
- porcentaje de dominio;
- acción disponible;
- indicador de objetivos internos.

Los objetivos no deben aparecer como una segunda cuadrícula completa debajo de todos los temas. Deben aparecer al expandir un tema o al entrar en su detalle.

### 5.7 Detalle del tema

Al expandir un tema, o al seleccionar “Ver objetivos”, se muestran sus objetivos en una sección secundaria o panel lateral. Cada objetivo debe incluir:

- nombre;
- descripción;
- estado de acceso;
- progreso;
- número de preguntas revisadas;
- acción “Aprender”, “Practicar” o “Consultar material”.

El mapa jurídico debe mantenerse como una acción contextual del tema. No debe ocupar espacio principal en todas las filas si el estudiante todavía no lo ha solicitado.

### 5.8 Método de estudio

La explicación “Así vas a aprender” debe mantenerse, pero en formato resumido y desplegable para no competir con la recomendación del día.

Estado cerrado recomendado:

> Recupera, comprende, practica, aplica y repasa.

Estado abierto:

1. recuperación inicial;
2. lectura y contraste con la fuente;
3. práctica con preguntas;
4. aplicación a situaciones;
5. revisión programada.

Este cambio es únicamente de presentación. No modifica el flujo de `GuidedStudy` ni los modos `LEARN`, `PRACTICE`, `ASSESS`, `REVIEW` y `CASE`.

### 5.9 Confianza y fuentes

El mensaje de respaldo normativo debe permanecer, pero puede convertirse en una franja breve al final de la portada:

> Tu progreso se ajusta con tus respuestas y cada explicación se vincula con evidencia jurídica revisada.

Desde allí se puede enlazar a la Biblioteca o al mapa jurídico. La portada no debe insertar el contenido completo de las fuentes; debe orientar hacia ellas.

## 6. Jerarquía visual recomendada

La pantalla debe tener tres niveles de atención:

### Nivel primario

- siguiente acción recomendada;
- botón principal;
- estado del objetivo actual.

### Nivel secundario

- progreso global;
- bloque y tema actuales;
- repasos pendientes;
- próximo paso de la ruta.

### Nivel terciario

- bloques no activos;
- objetivos detallados;
- método de estudio ampliado;
- historial de sesiones;
- mapa jurídico y biblioteca.

La reducción de carga visual no debe lograrse ocultando acciones importantes con texto diminuto. Debe lograrse mostrando menos elementos a la vez y permitiendo que el usuario los revele cuando los necesite.

## 7. Comportamiento esperado de la ruta

La interfaz debe reflejar fielmente las reglas existentes:

- el primer tema disponible aparece como punto de entrada;
- los temas siguientes se desbloquean secuencialmente;
- un tema desbloqueado conserva el acceso aunque el dominio disminuya;
- el progreso no se completa solo por leer;
- el umbral inicial de progresión continúa siendo 70 %, configurable por bloque;
- una debilidad no bloqueante genera una recomendación;
- una debilidad crítica puede impedir el desbloqueo del siguiente tema;
- el dominio agregado no se presenta como una calificación definitiva;
- el sistema continúa recomendando aprender, practicar o repasar según el estado real.

La página principal no debe permitir que el usuario interprete un tema bloqueado como disponible. Los temas bloqueados deben ser visibles como parte de la ruta, pero con acciones deshabilitadas o una explicación breve del requisito pendiente.

## 8. Flujo de interacción propuesto

```text
Inicio
  ↓
Panel “Siguiente paso”
  ├── Aprender → Recuperación inicial → Lectura guiada
  ├── Practicar → Preguntas del objetivo
  └── Repasar → Sesión de revisión
  ↓
Regreso a la ruta con progreso actualizado
  ↓
Bloque actual abierto
  ↓
Tema y objetivos desplegables
```

Al volver de una sesión, la página debe conservar o recalcular el bloque y tema activos, mostrar el cambio de dominio y actualizar la recomendación. El usuario no debería regresar a una lista extensa sin contexto.

## 9. Qué se conserva sin cambios

Esta propuesta no modifica:

- la jerarquía `OPEC → Competency → Block → Topic → LearningObjective`;
- el cálculo de `MasteryState`;
- las cinco dimensiones de dominio;
- las recomendaciones derivadas;
- el desbloqueo secuencial;
- el umbral de progresión;
- el acceso acumulativo a temas desbloqueados;
- el ciclo de recuperación, lectura, práctica, aplicación y revisión;
- la evidencia jurídica y sus estados editoriales;
- la separación entre contenido aprobado y contenido pendiente;
- la Biblioteca documental y su principio de fidelidad a las fuentes.

El cambio propuesto es de arquitectura de información, jerarquía visual y navegación progresiva.

## 10. Recomendaciones de contenido y lenguaje

La interfaz debe usar frases cortas y acciones concretas:

- “Siguiente paso” en lugar de “Plan de estudio del día” cuando no existe una agenda temporal;
- “Aprender tema” en lugar de “Consultar material” cuando inicia la lectura guiada;
- “Ver objetivos” en lugar de mostrar todos los objetivos automáticamente;
- “Desbloqueado al alcanzar 70 %” para explicar un bloqueo;
- “Pendiente de revisión” para contenido no aprobado;
- “Tu dominio estimado” para evitar que el porcentaje se interprete como una nota definitiva.

Debe evitarse repetir en cada tarjeta frases como “preguntas revisadas” si ya existe un indicador en el panel del objetivo. La información detallada puede aparecer al expandirla.

## 11. Accesibilidad y comportamiento responsive

Los elementos desplegables deben ser controles reales, con etiquetas claras y estado accesible (`aria-expanded`). La ruta no debe depender solo del color para diferenciar estados.

En pantallas pequeñas:

- el panel “Siguiente paso” ocupa primero toda la anchura;
- las métricas se agrupan en una fila desplazable o en una lista compacta;
- los bloques se convierten en acordeones de una sola columna;
- los objetivos se muestran en una vista secundaria o debajo del tema seleccionado;
- no se debe obligar al usuario a desplazarse horizontalmente para entender la secuencia.

## 12. Ajustes técnicos sugeridos

La API ya devuelve la ruta jerárquica, estados, progreso, objetivos y recomendación. Por ello, la primera implementación puede hacerse principalmente en la composición de la interfaz.

Se recomienda:

1. añadir estado local para el bloque expandido y el tema expandido;
2. abrir por defecto el bloque que contiene el objetivo recomendado;
3. reemplazar la cuadrícula global de objetivos por un detalle dependiente del tema;
4. mantener `openGuide`, `begin` y `openMap` como acciones existentes;
5. conservar los identificadores y estados actuales para no cambiar el contrato pedagógico;
6. mover sesiones recientes y explicación ampliada del método a paneles desplegables;
7. añadir pruebas de interacción para verificar que la recomendación siempre sea visible;
8. añadir pruebas para confirmar que un tema bloqueado no permite iniciar una sesión;
9. verificar que el regreso desde una lectura o práctica mantiene el contexto de la ruta.

Si durante la implementación se requiere una nueva entidad persistente, debe actualizarse primero el modelo de dominio. Para el diseño propuesto no es necesario crear entidades nuevas.

## 13. Criterios de aceptación

- La acción recomendada aparece en la primera pantalla visible sin desplazamiento excesivo.
- El usuario puede iniciar la actividad recomendada en un máximo de dos acciones.
- No se muestran simultáneamente los veinticinco temas y todos sus objetivos expandidos.
- El bloque actual se identifica inmediatamente y aparece abierto por defecto.
- Los demás bloques siguen siendo accesibles mediante expansión.
- Los temas conservan su orden, estado y porcentaje de dominio.
- Los objetivos solo se muestran al expandir o seleccionar un tema.
- Los temas bloqueados permanecen visibles, pero no se presentan como iniciables.
- El método de estudio continúa visible y comprensible, aunque en formato resumido.
- La lectura guiada sigue comenzando con recuperación inicial.
- Las acciones de aprender, practicar y repasar continúan dependiendo de la recomendación y del estado del objetivo.
- El regreso desde una sesión actualiza progreso, repasos y siguiente recomendación.
- La Biblioteca, el mapa jurídico y las fuentes siguen siendo accesibles sin ocupar el primer nivel visual.
- La interfaz funciona con teclado y comunica correctamente el estado de los desplegables.

## 14. Plan de implementación por fases

### Fase 1 — Reordenamiento visual

Mantener los mismos datos y acciones, pero reorganizar la página en: siguiente paso, resumen, ruta y confianza. Reducir el peso visual de métricas y paneles secundarios.

### Fase 2 — Ruta desplegable

Convertir los bloques en acordeones, abrir por defecto el bloque recomendado y mostrar los objetivos únicamente al expandir un tema.

### Fase 3 — Contexto de navegación

Conservar el bloque y tema activos al volver de lectura, práctica o repaso. Mostrar una confirmación breve del progreso actualizado.

### Fase 4 — Accesibilidad y responsive

Revisar navegación por teclado, etiquetas de estado, contraste, tamaños de interacción y comportamiento en móvil.

### Fase 5 — Validación con estudiantes

Observar si una persona nueva puede identificar el siguiente paso, encontrar un tema específico y comprender por qué otros temas están bloqueados. Ajustar textos y aperturas por defecto sin cambiar la lógica de dominio.

## Conclusión

La página principal debe dejar de comportarse como un inventario completo y convertirse en una entrada guiada a la ruta. La solución recomendada es mostrar una acción prioritaria, resumir el progreso y convertir bloques, temas y objetivos en niveles desplegables.

Así se conserva todo el contenido necesario, pero se entrega de acuerdo con la necesidad del momento. El estudiante ve primero qué hacer, después dónde está y finalmente puede explorar la totalidad de la ruta. El método de estudio, las reglas de progresión y la trazabilidad jurídica permanecen intactos.
