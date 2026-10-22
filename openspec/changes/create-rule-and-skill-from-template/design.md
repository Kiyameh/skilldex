# Design

## Context

Create Rule y Create Skill ambos in-scope; CTAs por sección. Separado de Open.

## Goals / Non-Goals

**Goals:**
- Plantillas `.mdc` y `SKILL.md` pre-llenadas
- Crear directorios `.cursor/rules` / `.cursor/skills` si faltan
- Ítems nuevos enabled por defecto

**Non-Goals:**
- Wizard multi-paso complejo
- Open automático tras create (puede sugerirse después; no requerido aquí)
- Generar árbol completo de references de skill

## Decisions

- **Naming:** pedir nombre al usuario (InputBox VS Code desde Host, o prompt simple en Webview + validación Host). Preferir InputBox en Host para MVP (menos UI custom).
- **Rule path:** `.cursor/rules/<slug>.mdc`.
- **Skill path:** `.cursor/skills/<slug>/SKILL.md` con frontmatter `name`/`description` habituales.
- **Slug:** kebab-case derivado del nombre; rechazar path traversal.
- **Colisión:** si existe, fallar con error claro (no overwrite silencioso).

## Risks / Trade-offs

- Plantillas demasiado pobres vs demasiado ricas: mantener mínimo útil alineado a convenciones Cursor.
