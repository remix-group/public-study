# ADR-008: Ruta guiada y dominio multidimensional

## Estado

Aceptada

## Contexto

La nueva especificación funcional separa currículo, acceso, progresión, dominio y
mantenimiento. El MVP existente ya registra intentos y un dominio agregado, pero no
representa bloques, estados persistentes de ruta ni las dimensiones pedagógicas.

## Decisión

1. `Opec` representa el concepto funcional `JobProfile`; no se duplica la entidad.
2. Se incorpora `Block` entre `Competency` y `Topic`.
3. `TopicProgress` conserva el acceso acumulativo y el estado curricular por estudiante.
4. `MasteryState` conserva cinco dimensiones y mantiene `mastery` como agregado
   compatible con el motor existente.
5. `StudySession.mode` distingue aprender, practicar, evaluar, repasar y caso.
6. La progresión usa evidencia acumulada y un umbral configurable, inicialmente 70 %.
7. Las recomendaciones siguen siendo una proyección derivada; no se persisten hasta
   que exista una necesidad de auditoría independiente.

## Consecuencias

La API debe devolver una ruta jerárquica y razones de recomendación. Los intentos
actualizan dominio, repaso y progresión en la misma transacción. El contenido ya
desbloqueado no vuelve a `LOCKED`.
