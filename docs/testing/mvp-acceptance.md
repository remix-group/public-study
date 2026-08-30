# MVP Acceptance Criteria

Este documento define los criterios de aceptación principales (ACs) que validan el correcto funcionamiento del MVP. Estos escenarios serán la guía principal para las pruebas automatizadas (unitarias, integración, E2E) que aseguran el ciclo de aprendizaje completo.

---

## AC-001: Inicio de Sesión de Estudio

**Given:** el usuario tiene disponible la competencia funcional "Cobro Coactivo"
**When:** inicia una sesión de estudio
**Then:** el sistema debe mostrar los objetivos de aprendizaje correspondientes a esa competencia.

---

## AC-002: Registro de Intento (QuestionAttempt)

**Given:** el usuario responde una pregunta o resuelve un caso
**When:** se registra el intento en el sistema
**Then:** debe persistirse obligatoriamente la siguiente información:
- La respuesta provista por el usuario
- El resultado de la evaluación (ej. correcto/incorrecto/parcial)
- El tiempo invertido en la respuesta
- La dificultad (calculada o reportada)
- La evidencia jurídica asociada que fundamenta la pregunta/respuesta

---

## AC-003: Actualización de Dominio (Mastery) ante Error

**Given:** el estudiante falla una pregunta durante una sesión
**Then:** debe registrarse el tipo de error cometido (`Mistake`)
**And:** debe actualizarse su estado de dominio (`MasteryState`) reduciendo su nivel o recalculando la curva
**And:** debe programarse una próxima revisión (`ReviewSchedule`).
