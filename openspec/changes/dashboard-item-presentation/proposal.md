# Proposal

## Why

Las cards del dashboard aún muestran metadatos genéricos (`description` / `enabled`) que no coinciden con cómo Cursor interpreta Rules y Skills. El panel debe reflejar secciones reales del `.mdc`, `metadata.version`, categorías por carpetas y las claves nativas de activación.

## What Changes

- **BREAKING** (persistencia): el toggle de Rules escribe `alwaysApply` (no `enabled`). Omitido = inactivo. ON/OFF persisten `true`/`false` explícitos.
- **BREAKING** (persistencia): el toggle de Skills escribe `disable-model-invocation` (clave invertida: `true` = inactivo). ON persiste `false`; OFF persiste `true`.
- Discovery ignora `enabled` si aparece. El usuario lo eliminará a mano; SkillDex no migra ni borra esa clave.
- Cards de Rules: la descripción se sustituye por la lista de headings `##` del cuerpo Markdown (sin fences). Los globs se mantienen debajo. Sin headings → «No hay secciones». Lista de solo lectura (sin clic).
- Cards de Skills: si existe `metadata.version`, se muestra muted a la derecha del nombre (sin hueco si falta). La descripción al hover se mantiene.
- Skills agrupadas por el primer directorio bajo `.cursor/skills/`. Raíz → grupo «Sin categoría». Cabeceras en Title Case, no colapsables. Orden de filesystem. Rules no se agrupan.

## Capabilities

### New Capabilities

- (ninguna)

### Modified Capabilities

- `dashboard-ui`: secciones en cards de Rules; `version` en Skills; agrupación por categoría
- `rules-skills-discovery`: extraer `##`, mapear `metadata.version`, categoría de ruta, `alwaysApply` / `disable-model-invocation` → `enabled` de catálogo
- `toggle-enabled`: persistir `alwaysApply` y `disable-model-invocation` en lugar de `enabled`
- `host-webview-contract`: campos de catálogo `sections`, `version` y `category`

## Impact

- Host: `map-frontmatter.ts`, `discover-catalog.ts`, `set-item-enabled.ts`
- Shared: `CatalogItem` (+ type guards)
- Webview: `rule-card`, `skill-card`, `skills-section`
- Tests unitarios e integración de discovery, toggle y cards
- No toca live-sync, open-in-editor ni create-from-template
