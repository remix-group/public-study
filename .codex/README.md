# Configuración compartida de Codex

Este directorio contiene las instrucciones que el equipo comparte para trabajar
en DIAN Study Platform.

## Perfiles de agentes

Los perfiles de `.codex/agents/` son roles especializados reutilizables. Cada
perfil define su misión, límites, archivos que debe consultar, entregables y
verificaciones. No representan procesos automáticos permanentes: se aplican
cuando una tarea requiere ese rol o cuando se solicita una revisión cruzada.

Perfiles disponibles:

- `domain-architecture`: dominio, arquitectura y ADR.
- `legal-knowledge`: fuentes jurídicas y autoridad normativa.
- `knowledge-graph`: relaciones y navegación del grafo jurídico.
- `adaptive-learning`: lógica pedagógica y adaptación.
- `backend-security`: API, autenticación y autorización.
- `frontend-ux`: experiencia de estudiante y editor.
- `devops-dependencies`: Docker, versiones, dependencias y CI.
- `testing-quality`: pruebas, calidad y criterios de aceptación.

## Regla común

Todo agente debe leer `AGENTS.md` y las especificaciones relevantes antes de
modificar código. Debe preservar cambios no relacionados, evitar secretos y
reportar archivos modificados, pruebas ejecutadas, riesgos y pendientes.
