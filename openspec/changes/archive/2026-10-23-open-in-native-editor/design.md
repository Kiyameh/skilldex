# Design

## Context

Edición de contenido es nativa. Open es un change independiente de Create.

## Goals / Non-Goals

**Goals:**
- Acción Abrir → `showTextDocument`
- Funciona para Skills y Rules

**Non-Goals:**
- Preview Markdown custom, diff, WYSIWYG
- Abrir carpeta de skill en Explorer (solo el `SKILL.md` en MVP)

## Decisions

- Abrir siempre el path del fichero del ítem (`SKILL.md` o rule file).
- Si el fichero no existe, Host reporta error tipado (mensaje result opcional; mínimo: no crash).

## Risks / Trade-offs

- Multi-root workspaces: resolver URI contra workspace folder correcto (usar path absoluto del catálogo).
