# Plan OpenSpec del MVP SkillDex

- **Fecha:** 2026-10-22
- **Contexto:** Ejecución de `.cursor/prompts/01-planificar-mvp-openspec.md`: instalar OpenSpec, cerrar requisitos pendientes y trocear el MVP en changes verticales.
- **Parte:** continúa de [01-estrategia-troceado-openspec.md](./01-estrategia-troceado-openspec.md)

## Resumen

Se instaló OpenSpec en el repo (`root` válido, schema `spec-driven`) y se generaron **8 changes** completos (`proposal` / `specs` / `design` / `tasks`), todos validados. Quedaron fijadas las decisiones de producto pendientes (`.cursor/` only, Skills+Rules, toggle `enabled: false`, Tailwind, identidad SkillDex). No se implementó código de la extensión.

## Objetivo

- Instalar y configurar OpenSpec en SkillDex.
- Trocear todo el MVP en Spec-Driven Vertical Slices listos para `/opsx:apply`.
- No reabrir el debate de metodología ni implementar la extensión en esa sesión.

## Decisiones

- **Directorio MVP:** solo `.cursor/` (`.vscode/rules/` aplazado).
- **Toggle:** frontmatter `enabled: false` en Rules y en `SKILL.md` (no rename de extensión).
- **Webview:** React + Vite + Tailwind; `core-rules.mdc` actualizado para reflejarlo (antes exigía CSS nativo/Modules).
- **Alcance Items:** Rules **y** Skills; Skills son el foco principal.
- **Dashboard:** dos secciones diferenciadas (Skills primero, Rules después).
- **Metadatos Skills (MVP):** habituales (`name`, `description`, `enabled`); más campos en el futuro.
- **Create:** “+ Nueva Regla” y “+ Nueva Skill” (un change); Open en change aparte.
- **Identidad extensión:** `displayName` SkillDex, `name` skilldex, `publisher` andoni.
- **Ids de change:** se aceptaron los nombres tentativos del mapa (con create renombrado a `create-rule-and-skill-from-template`).

## Contenido clave

### OpenSpec

- CLI ya presente (`openspec` 1.13.2); `openspec init --tools cursor --language Spanish`.
- Contexto de proyecto en `openspec/config.yaml` (stack, in/out-scope, estrategia, identidad).
- Skills/commands Cursor: `opsx-*` bajo `.cursor/`.

### Orden de changes (aplicar así)

| # | Change | Notas |
|---|--------|-------|
| 1 | `scaffold-extension-webview` | **Primero** |
| 2 | `host-webview-message-contract` | Contrato postMessage temprano |
| 3 | `discover-parse-rules-skills` | Solo `.cursor/rules` + `.cursor/skills/**/SKILL.md` |
| 4 | `dashboard-readonly-cards` | Secciones Skills + Rules, solo lectura |
| 5 | `toggle-enabled-frontmatter` | Paralelo OK tras 4 |
| 6 | `open-in-native-editor` | Paralelo OK tras 4 |
| 7 | `create-rule-and-skill-from-template` | Paralelo OK tras 4 |
| 8 | `live-sync-filesystem-watcher` | Al final |

### In-scope / out-of-scope (recordatorio)

- In: discovery, cards, toggle, open, create Rule/Skill, live sync.
- Out: WYSIWYG, parsers multiformato, métricas/LLM, testing/Marketplace complejos.

## Archivos y referencias

- `openspec/config.yaml`
- `openspec/changes/*/` (8 changes)
- `.cursor/rules/core-rules.mdc` (Tailwind)
- `.cursor/prompts/01-planificar-mvp-openspec.md`
- `.cursor/chat/01-estrategia-troceado-openspec.md`

## Pendiente / siguientes pasos

- Actualizar skill `css-conventions` a Tailwind (queda pendiente de confirmación).
- Agente de tooling (lint/format/etc.) e instalación.
- Agente de implementación: `/opsx:apply` de `scaffold-extension-webview` de principio a fin.
- No implementar el resto de changes hasta cerrar el scaffold (salvo acuerdo explícito).

## Notas

- Criterio de diseño en create: InputBox en Host para el nombre; slug kebab-case; no overwrite silencioso.
- Enable al reactivar toggle: preferir `enabled: true` explícito (documentado en design/tasks del toggle).
