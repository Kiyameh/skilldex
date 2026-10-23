# Dashboard item presentation

- **Fecha:** 2026-10-23
- **Contexto:** Implementación y archivo del change OpenSpec `dashboard-item-presentation`

## Resumen

Se alineó el dashboard de SkillDex con el modelo nativo de Cursor: secciones `##` en Rules, `metadata.version` y categoría por carpeta en Skills, y persistencia vía `alwaysApply` / `disable-model-invocation` en lugar de `enabled`. Se planificó primero, se implementaron las 14 tasks, se sincronizaron las main specs y se archivó el change.

## Objetivo

- Aplicar de principio a fin el change `dashboard-item-presentation` (proposal/design/specs/tasks ya listos).
- No tocar create-from-template ni reescribir live-sync / open-in-editor.

## Decisiones

- **Campos aditivos en `CatalogItem`:** `sections?`, `version?`, `category?`; `enabled` sigue siendo el booleano de UI en el contrato.
- **Extracción h2:** parser línea a línea; ignorar fences; solo `##` (no `#` ni `###`); empty copy `No hay secciones`.
- **`metadata.version`:** solo string anidado; sin coerción; no leer `version` en raíz.
- **Categoría:** primer segmento bajo `.cursor/skills/` si hay ≥2 segmentos de carpeta; skills de raíz → `Sin categoría` (primero en UI); Title Case de carpeta; Rules sin agrupar.
- **Toggle Rules:** escribe `alwaysApply: true|false`; activo solo si YAML es booleano `true`.
- **Toggle Skills:** escribe `disable-model-invocation: true|false` (invertido); inactivo solo si booleano `true`.
- **No migrar `enabled`:** se ignora en lectura; el toggle no la crea, borra ni altera.
- **Discriminantes de mensajes:** sin cambios; solo shape aditivo de catálogo.
- **Fixtures:** solo `mkdtemp` / mocks; nunca mutar el `.cursor/` de convención del repo.

## Contenido clave

### Capas tocadas

1. Shared: `CatalogItem` + type guards.
2. Host: `extract-rule-sections`, `map-frontmatter` (claves nativas + version/category), `setItemEnabled`.
3. Webview: `RuleCard` (secciones), `SkillCard` (version muted, título `h4`), `SkillsSection` + `groupSkillsByCategory`.

### Verificación

- `npm run test:unit`, `test:integration`, `typecheck`, `lint`, `build` en verde.
- En F5: rules del repo sin `alwaysApply: true` se ven inactivas (esperado).

### Archive

- Specs sincronizadas a main: `dashboard-ui`, `host-webview-contract`, `rules-skills-discovery`, `toggle-enabled`.
- Change movido a `openspec/changes/archive/2026-10-23-dashboard-item-presentation/`.

## Archivos y referencias

- Prompt: `.cursor/prompts/10-aplicar-dashboard-item-presentation.md`
- Archive: `openspec/changes/archive/2026-10-23-dashboard-item-presentation/`
- Main specs: `openspec/specs/{dashboard-ui,host-webview-contract,rules-skills-discovery,toggle-enabled}/`
- Código: `src/shared/catalog.ts`, `src/extension/map-frontmatter.ts`, `src/extension/extract-rule-sections.ts`, `src/extension/set-item-enabled.ts`, `src/webview/{rule-card,skill-card,skills-section,group-skills-by-category}.*`

## Pendiente / siguientes pasos

- Commit(s) de este trabajo (split propuesto aparte).
- Change activo restante: `skill-invocation-size` (0/9).
- Create-from-template sigue fuera de este slice.
