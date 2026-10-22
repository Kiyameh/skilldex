# Design

## Context

Contrato Host↔Webview disponible. Raíces MVP: solo `.cursor/rules/` y `.cursor/skills/**/SKILL.md`. Parseo con `gray-matter`.

## Goals / Non-Goals

**Goals:**
- Catálogo tipado Rules + Skills
- Mapeo de metadatos habituales + `enabled`
- Entrega al Webview vía mensajes del contrato

**Non-Goals:**
- UI de cards, toggle, create, open, watcher
- `.vscode/rules/`, Copilot/Windsurf/Claude parsers
- Metadatos avanzados de Skills (futuro)

## Decisions

- **Rules:** escanear `.cursor/rules/**/*.{mdc,md}` (incluir anidados si existen).
- **Skills:** glob `** /SKILL.md` bajo `.cursor/skills/`.
- **Enabled:** `enabled === false` → disabled; cualquier otro caso → enabled.
- **Rules display:** preferir `description` / título derivado de frontmatter o nombre de fichero si falta.
- **Skills display:** `name` + `description` del frontmatter; si falta `name`, usar nombre de carpeta.
- **Globs:** Rules leen `globs` (string o array) normalizado a `string[]`; Skills no exigen globs en MVP.
- **Verificación temporal:** Host puede loggear conteos; Webview puede mostrar JSON crudo opcional solo si hace falta probar — preferible dejar dump mínimo fuera de UI final (el change de dashboard lo sustituye).

## Risks / Trade-offs

- Frontmatter inconsistente en el wild: degradar con defaults, no fallar el catálogo entero.
- Skills anidadas profundas: aceptar recursión estándar; documentar en tasks.
