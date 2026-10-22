# Proposal

## Why

El dashboard necesita una fuente de verdad tipada de Rules y Skills bajo `.cursor/`. Skills son el foco principal; Rules también entran en el MVP. Sin discovery/parseo no hay datos reales que mostrar.

## What Changes

- Descubrir ficheros de Rules en `.cursor/rules/` (`.mdc` / `.md`)
- Descubrir Skills en `.cursor/skills/**/SKILL.md`
- Parsear frontmatter con `gray-matter` (metadatos habituales + `enabled`)
- Exponer lista tipada al Webview vía el contrato Host↔Webview (sin UI de cards aún, o con dump mínimo verificable)

## Capabilities

### New Capabilities
- `rules-skills-discovery`: Discovery y parseo de Rules/Skills locales bajo `.cursor/`

### Modified Capabilities
- `host-webview-contract`: Extender mensajes para solicitar/recibir el catálogo parseado

## Impact

- Dependencia `gray-matter`
- Lectura de filesystem del workspace
- No incluye toggle, create, open ni live sync
- Out-of-scope: `.vscode/rules/`, parsers multiformato
