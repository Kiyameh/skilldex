# Dashboard de solo lectura (cards)

- **Fecha:** 2026-10-22
- **Contexto:** Aplicación completa del change OpenSpec `dashboard-readonly-cards`, pulido visual, sync a main specs y archivo.
- **Parte:** continúa de [07-discover-parse-rules-skills.md](./07-discover-parse-rules-skills.md)

## Resumen

Se sustituyó el dump JSON/conteos del Webview por un dashboard de solo lectura: secciones Skills (primaria) y Rules, cards con metadatos, empty states y LED de estado. Tras verificación del usuario se afinó el layout (header, proporciones, hover en skills). El change quedó 9/9, sincronizado a `openspec/specs/dashboard-ui/spec.md` y archivado. No se implementaron mutaciones (toggle/open/create/live-sync).

## Objetivo

- Aplicar de principio a fin `dashboard-readonly-cards`.
- Consumir el catálogo Host↔Webview ya existente (sin reinventar el contrato).
- Dejar handoff al siguiente slice: `toggle-enabled-frontmatter`.

## Decisiones

- **Alcance:** solo Webview UI; Host/discovery/contrato intactos salvo necesidad mínima (no hizo falta tocarlos).
- **Enabled visual:** LED circular verde/rojo + texto `Activa` / `Desactivada` (no switch clicable en este change).
- **Loading ≠ empty:** `catalog === undefined` → “Catálogo: esperando…”; empty states solo con arrays vacíos ya recibidos.
- **Fallbacks:** descripción ausente → “Sin descripción”; globs vacíos → “Sin globs”; `title` ausente → `id`.
- **Estructura plana** en `src/webview/` (kebab-case, un componente por archivo); sin carpeta `features/` aún.
- **Pulido visual (post-MVP slice):**
  - Logo SVG inline (`SkillDexLogo`, `currentColor`) a la izquierda del título.
  - Subtítulo eliminado.
  - Badge `conectado` / `desconectado` (borde verde/rojo) a la derecha del título.
  - Layout vertical: Skills ~2/3 (`flex-[2]`), Rules ~1/3 (`flex-1`); título fijo + lista scrolleable.
  - Skill cards: nombre + LED; descripción revelada con `max-h-0` → `max-h-24` en hover/focus-within.
  - Rule cards: contenido sin cambios de este pulido.
- **Tipos Vitest 5 + jest-dom 7:** `Assertion<R, T>` no fusiona con la augmentación antigua; shim local en `vitest-env.d.ts` extendiendo `Matchers`, más `tsconfig.vitest.json` para typecheck de tests.

## Contenido clave

### Componentes Webview

- `App.tsx` — header (logo + título + `ConnectionBadge`) + main con secciones
- `SkillsSection` / `RulesSection` — headings + scroll
- `SkillCard` / `RuleCard` / `EnabledLed`
- `SkillDexLogo`, `ConnectionBadge`
- Hook existente: `useCatalog` + handshake

### Verificación

- Unit/RTL: secciones, cards, empty states, badge; 31 tests OK
- `typecheck` (incluye vitest), `lint`, `build`, `npm test` (unit + integration) OK
- F5 (usuario): dashboard correcto con catálogo real del repo

### Cierre OpenSpec

- Tasks 9/9 `[x]`
- Sync → `openspec/specs/dashboard-ui/spec.md` (nuevo)
- Archivado en `openspec/changes/archive/2026-10-22-dashboard-readonly-cards/`

## Archivos y referencias

- `src/webview/App.tsx`, `skills-section.tsx`, `rules-section.tsx`, `skill-card.tsx`, `rule-card.tsx`
- `src/webview/enabled-led.tsx`, `connection-badge.tsx`, `skilldex-logo.tsx`
- `src/webview/vitest-env.d.ts`, `tsconfig.vitest.json`
- `openspec/specs/dashboard-ui/spec.md`
- `.cursor/prompts/06-aplicar-dashboard-readonly-cards.md`
- Siguiente change: `toggle-enabled-frontmatter`

## Pendiente / siguientes pasos

- Aplicar `toggle-enabled-frontmatter` (persistir `enabled` vía gray-matter; controles operativos en cards).
- No abrir open/create/live-sync hasta cerrar el toggle, salvo acuerdo explícito.
- No pisar ni reescribir rules/skills de convención del repo; fixtures solo en temp/tests.

## Notas

- El LED sigue siendo solo visual hasta el change de toggle; ahí se sustituye o se cablea a un control accesible operativo.
- Al toglear en F5 futuro, evitar mutar ficheros de convención del propio SkillDex sin fixture temporal.
