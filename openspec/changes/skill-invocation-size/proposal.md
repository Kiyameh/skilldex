# Proposal

## Why

El dashboard no muestra el coste aproximado de invocar una Skill. El usuario necesita ver de un vistazo cuántos caracteres tiene el `SKILL.md` principal y una estimación de tokens, para decidir si una Skill es pesada antes de usarla.

## What Changes

- El Host cuenta los code points Unicode de todo el `SKILL.md` (frontmatter + cuerpo; no archivos auxiliares) y expone `characterCount` en el ítem de catálogo.
- El Webview estima tokens con la constante `2.8` caracteres/token y `Math.round`, y pinta la línea en azul (`text-blue-500`) debajo de la descripción, solo en el reveal de hover/focus, con formato `es-ES`: `1.024 caracteres (~100 tokens)`.
- La línea se muestra también cuando el recuento es `0`; la virgulilla `~` es siempre visible.
- Las Rules no reciben ni muestran este dato.

## Capabilities

### New Capabilities

- (ninguna)

### Modified Capabilities

- `rules-skills-discovery`: contar code points del `SKILL.md` completo y mapear `characterCount`
- `host-webview-contract`: campo opcional `characterCount` en `CatalogItem` (obligatorio en skills, omitido en rules)
- `dashboard-ui`: línea de tamaño/tokens bajo la descripción en las cards de Skills

## Impact

- Host: recuento al mapear el fichero ya leído en discovery (y al re-mapear tras toggle/live-sync)
- Shared: `CatalogItem` + type guards
- Webview: `SkillCard` (formato, color, visibilidad en hover)
- Tests unitarios de recuento/redondeo/formato y RTL de la card; no APIs de LLM
