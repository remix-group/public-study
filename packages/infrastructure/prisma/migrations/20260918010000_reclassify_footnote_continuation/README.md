# Revisión humana requerida

Esta migración corrige un artefacto de segmentación documental identificado en
la auditoría. No debe ejecutarse sin aprobación del revisor jurídico.

## Efecto

- Conserva el contenido previo del literal `a)` y de `a6c6f94b-a8bd-4790-bca1-19ed05cbbaa7` en `legal_source_quarantine`.
- Añade la continuación al literal `f164499b-7613-4d38-bdc4-6a5cd9dbec46`.
- Reclasifica `a6c6f94b-a8bd-4790-bca1-19ed05cbbaa7` como `continuation`, conserva su ID y lo vincula al literal padre.
- No asigna una fuente nueva ni aprueba el documento ABC/Estatuto; esos registros permanecen en revisión.

## Reversión

En una transacción, restaurar `content`, `unitType`, `number`, `title`,
`parentProvisionId` y `status` desde los registros:

- `legal_source_quarantine.id = 'footnote-parent-f164'`
- `legal_source_quarantine.id = 'footnote-continuation-a6c6'`

Después de revertir, ejecutar la auditoría en modo solo lectura y comprobar que
los identificadores y evidencias permanecen íntegros.
