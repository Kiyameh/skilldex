# Discovery y parseo de Rules/Skills

- **Fecha:** 2026-10-22
- **Contexto:** Aplicación completa del change OpenSpec `discover-parse-rules-skills`, sync a main specs y archivo.
- **Parte:** continúa de [06-sistema-testing-piramide.md](./06-sistema-testing-piramide.md)

## Resumen

Se planificó e implementó el discovery/parse bajo `.cursor/` con `gray-matter`, se extendió el contrato Host↔Webview con request/response de catálogo, y el Webview muestra un dump temporal (conteos + JSON). El change quedó 14/14, sincronizado a main specs y archivado. El usuario verificó el slice en F5. No se implementaron cards ni mutaciones.

## Objetivo

- Planificar e implementar de principio a fin `discover-parse-rules-skills`.
- Entregar catálogo tipado al Webview sin UI de cards.
- Archivar el change y dejar handoff al siguiente slice (`dashboard-readonly-cards`).

## Decisiones

- **Mensajes:** `webview/catalogRequest` (sin payload) y `host/catalog` con `{ skills, rules }`; tipo reutilizable `CatalogPayload`.
- **Identidad:** `path` = `fsPath` absoluto; `id` = ruta POSIX relativa al workspace (p. ej. `.cursor/rules/core-rules.mdc`). Skills: `title` ← `name` o nombre de carpeta.
- **Workspace:** solo `workspaceFolders[0]`; sin carpeta → arrays vacíos.
- **Discovery:** `node:fs/promises` + `readdir` recursivo (sin `glob` ni `findFiles`) para unit tests sin Electron.
- **Enabled:** solo boolean `false` deshabilita; ausente/`"false"`/otro → `true`.
- **Globs (Rules):** string → `[string]`; array filtrado a strings; ausente → `[]`.
- **Errores de parseo:** omitir el ítem, continuar el catálogo (warn en consola Host).
- **Fixture `enabled: false`:** no commitear bajo `.cursor/`; verificar solo con tests en `mkdtemp`. En F5 se usa el catálogo real del repo.
- **UI temporal:** conteos + `<pre>` JSON en `<main>`; handshake del header se mantiene.
- **Router:** filtrar handshake por `webview/ready` / `host/ready` para no confundirlo con mensajes de catálogo.
- **Descartado:** fixtures `_skilldex-fixture-*` en el repo (Cursor también los vería); UI solo conteos o solo console.

## Contenido clave

### Módulos

- Shared: `messages.ts`, `type-guards.ts`, `catalog.ts` (`CatalogPayload`)
- Host: `discover-catalog.ts`, `map-frontmatter.ts`, `host-message-adapter.ts` (`startHostMessageHandling`)
- Webview: `use-catalog.ts`, dump en `App.tsx`

### Verificación

- Unit: mapping `enabled`/`globs`, skip `.vscode/rules/`, YAML roto no tumba el catálogo
- Integration: workspace temporal con skill `enabled: false`
- Repo real al descubrir: 2 rules + 22 skills; sin `.vscode`
- F5 (usuario): handshake + dump correcto

### Cierre OpenSpec

- Tasks 14/14 `[x]`
- Sync → `openspec/specs/rules-skills-discovery/spec.md` (nuevo) + requisito de catálogo en `host-webview-contract`
- Archivado en `openspec/changes/archive/2026-10-22-discover-parse-rules-skills/`

## Archivos y referencias

- `src/extension/discover-catalog.ts`, `src/extension/map-frontmatter.ts`
- `src/shared/messages.ts`, `src/webview/use-catalog.ts`, `src/webview/App.tsx`
- `openspec/specs/rules-skills-discovery/spec.md`
- `openspec/specs/host-webview-contract/spec.md`
- `.cursor/prompts/05-aplicar-discover-parse.md`
- Siguiente change: `dashboard-readonly-cards`

## Pendiente / siguientes pasos

- Aplicar `dashboard-readonly-cards` (sustituir dump por secciones Skills/Rules + cards).
- No archivar ni abrir toggle/open/create/live-sync hasta cerrar el dashboard de solo lectura, salvo acuerdo explícito.

## Notas

- YAML con `globs: **/*.ts` sin comillas falla el parser; el Host omite ese ítem. En fixtures usar `globs: "**/*.ts"`.
