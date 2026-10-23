# Live sync FileSystemWatcher

- **Fecha:** 2026-10-23
- **Contexto:** Planificación, implementación, fix de tsconfig y archivo del change OpenSpec `live-sync-filesystem-watcher`.
- **Parte:** continúa de [10-open-in-native-editor.md](./10-open-in-native-editor.md); el orden MVP saltó create-from-template a petición del usuario.

## Resumen

Se aplicó de principio a fin `live-sync-filesystem-watcher`: servicio de watchers a nivel extensión, debounce 250ms, rediscovery completo y push reutilizando `host/catalog`. Create quedó aplazado. Se corrigió el IDE para tests de integración (referencia a `tsconfig.integration.json`). Change 10/10, sync a main specs (incl. capability nueva `live-sync`) y archivado.

## Objetivo

- Aplicar el change desde el prompt `.cursor/prompts/09-aplicar-live-sync-filesystem-watcher.md`.
- Refrescar el dashboard ante create/change/delete en `.cursor/rules/` y `.cursor/skills/` sin reload manual.
- Handoff al siguiente slice activo: `dashboard-item-presentation` (create-from-template sigue pendiente aparte).

## Decisiones

- **Ownership:** watchers en la extensión (`activate` / `deactivate` + `subscriptions`), no solo en el panel; el panel puede no estar resuelto.
- **Contrato:** reutilizar `host/catalog` (sin `requestId` ni tipo nuevo); sink opcional hasta que el Webview se resuelva.
- **Debounce:** `CATALOG_LIVE_SYNC_DEBOUNCE_MS = 250`; un timer compartido; generation para descartar refreshes obsoletos.
- **Factory inyectable:** `createFileSystemWatcher(base, glob)` se pasa desde `activate` (RelativePattern ahí) para que el módulo sea testeable sin cargar `vscode` en Vitest.
- **Sin workspace folder:** no registrar watchers; no escuchar `onDidChangeWorkspaceFolders` (YAGNI).
- **Echo del toggle:** aceptado; refresh completo + limpieza de `pendingToggleIds` al recibir `host/catalog`.
- **Create (task 2.3):** aplazada; solo se verificó toggle/open.
- **tsconfig:** raíz ahora referencia `tsconfig.integration.json` para que el language service resuelva `node:*` en `*.integration.test.ts`.

## Contenido clave

### Host

- `catalog-live-sync.ts` — watchers rules/skills, debounce, `discoverCatalog`, sink, dispose idempotente
- `extension.ts` — arranque del servicio + dispose en `deactivate`
- `dashboard-view-provider.ts` — `setCatalogSink` / `clearCatalogSink`
- `host-message-adapter.ts` — `postCatalog` compartido por request on-demand y live-sync

### Webview

- `use-catalog.ts` — al aplicar `host/catalog` limpia pending toggles (eco del write)

### Tests

- Unit: coalescing, sin folder, dispose, generation stale
- Integration: `mkdtemp` + watcher real VS Code — edit skill description, delete rule, dispose sin más pushes

### Verificación

- 61 unit + 5 integration; typecheck / lint / build OK
- Fixtures solo en temp; no se mutó el `.cursor/` de convención del repo

### Cierre OpenSpec

- Tasks 10/10 `[x]`
- Sync → `openspec/specs/live-sync/spec.md` (nuevo); ADDED en `host-webview-contract`, `dashboard-ui`, `rules-skills-discovery`
- Archivado en `openspec/changes/archive/2026-10-23-live-sync-filesystem-watcher/`

## Archivos y referencias

- `src/extension/catalog-live-sync.ts`, `catalog-live-sync.test.ts`, `catalog-live-sync.integration.test.ts`
- `src/extension/extension.ts`, `dashboard-view-provider.ts`, `host-message-adapter.ts`
- `src/webview/use-catalog.ts`
- `tsconfig.json` (referencia a integration)
- Prompt origen: `.cursor/prompts/09-aplicar-live-sync-filesystem-watcher.md`
- Siguiente: `dashboard-item-presentation` (prompt de handoff)

## Pendiente / siguientes pasos

- Aplicar `dashboard-item-presentation` (presentation nativa Cursor: sections, version, category, alwaysApply / disable-model-invocation)
- `create-rule-and-skill-from-template` sigue pendiente (no estaba en este change)

## Notas

- El orden MVP original situaba create antes que live-sync; se aplicó live-sync primero por acuerdo explícito.
- No se archivó create ni se implementó en la verificación 2.3.
