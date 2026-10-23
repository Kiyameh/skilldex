# Skill invocation size

- **Fecha:** 2026-10-23
- **Contexto:** Planificación, implementación y archivo del change OpenSpec `skill-invocation-size`

## Resumen

Se añadió el tamaño de invocación de Skills: el Host cuenta code points Unicode del `SKILL.md` completo, lo expone como `characterCount` en el catálogo, y el Webview muestra en el reveal hover/focus una línea azul `N caracteres (~M tokens)` con formato `es-ES` y heurística `CHARS_PER_TOKEN = 2.8`. Tras F5 en verde, se sincronizaron las main specs y se archivó el change.

## Objetivo

- Implementar de principio a fin `skill-invocation-size` (proposal/design/specs/tasks ya listos).
- No rehacer presentation, create-from-template ni live-sync/toggle/open más allá del shape de catálogo.

## Decisiones

- **Recuento en Host:** `Array.from(fileContents).length` sobre el string completo (frontmatter + cuerpo); helper puro `countUnicodeCodePoints`. No `Buffer.byteLength` ni `.length` UTF-16. No sumar archivos auxiliares.
- **Campo aditivo:** `characterCount?: number` en `CatalogItem`; type guard: si presente, entero finito `>= 0`. Obligatorio en skills reales; omitido en rules. Toggle/live-sync lo conservan al re-mapear.
- **Tokens solo en Webview:** `CHARS_PER_TOKEN = 2.8`; `Math.round(characterCount / 2.8)`. Sin `tokenEstimate` en el contrato.
- **Formato:** `` `${chars} caracteres (~${tokens} tokens)` `` con `toLocaleString("es-ES", { useGrouping: true })` (sin `useGrouping`, Node/CLDR no agrupa `1024` como `1.024`). Virgulilla `~` siempre; `0` también se muestra. Campo omitido en UI → `0`.
- **UI:** línea bajo la descripción, mismo reveal `group-hover` / `group-focus-within`; `text-blue-500`; `max-h-28` → `max-h-40`. No en Rule cards. Version de presentation permanece en el header.
- **Independencia de presentation:** al planificar coexistía trabajo a medias; el usuario confirmó que presentation ya estaba terminada — se implementó solo este slice encima.
- **Fixtures:** solo `mkdtemp` / mocks; nunca mutar `.cursor/` de convención del repo.

## Contenido clave

### Capas tocadas

1. Shared: `CatalogItem.characterCount` + type guards.
2. Host: `count-unicode-code-points`, mapeo en `map-frontmatter` (solo skills).
3. Webview: `format-skill-invocation-size`, línea en `SkillCard`.

### Verificación

- `npm run test:unit`, `test:integration`, `typecheck`, `lint`, `build` en verde.
- F5: hover Skill → línea azul; editar `SKILL.md` → live-sync actualiza; Rules sin métrica.

### Archive

- Deltas sincronizadas a `openspec/specs/{dashboard-ui,host-webview-contract,rules-skills-discovery}/spec.md`.
- Change movido a `openspec/changes/archive/2026-10-23-skill-invocation-size/`.

## Archivos y referencias

- Prompt: `.cursor/prompts/11-aplicar-skill-invocation-size.md`
- Archive: `openspec/changes/archive/2026-10-23-skill-invocation-size/`
- Host: `src/extension/count-unicode-code-points.ts`, `map-frontmatter.ts`
- Shared: `src/shared/catalog.ts`, `type-guards.ts`
- Webview: `src/webview/format-skill-invocation-size.ts`, `skill-card.tsx`

## Pendiente / siguientes pasos

- Change pendiente típico del MVP: `create-rule-and-skill-from-template` (si sigue en roadmap).
- No archivar otros changes desde este chat.

## Notas

- La heurística 2.8 chars/token es grosera a propósito; la `~` lo comunica.
- `text-blue-500` fijo (no token VS Code) fue requisito de producto aceptado.
