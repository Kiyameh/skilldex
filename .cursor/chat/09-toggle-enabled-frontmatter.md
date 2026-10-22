# Toggle enabled vía frontmatter

- **Fecha:** 2026-10-22
- **Contexto:** Planificación, implementación, pulido UI y archivo del change OpenSpec `toggle-enabled-frontmatter`.
- **Parte:** continúa de [08-dashboard-readonly-cards.md](./08-dashboard-readonly-cards.md)

## Resumen

Se implementó el toggle 1-click de Skills y Rules persistiendo `enabled` en el frontmatter con `gray-matter`, extendiendo el contrato Host↔Webview y convirtiendo el LED de las cards en un switch accesible con UI optimista. Tras verificación del usuario se afinó el copy (`Inactiva`) y el hover (iconos toggle). Change 10/10, sync a main specs y archivado. No se tocó open/create/live-sync.

## Objetivo

- Aplicar de principio a fin `toggle-enabled-frontmatter`.
- Partir del dashboard y catálogo existentes; mutación mínima.
- Handoff al siguiente slice: `open-in-native-editor`.

## Decisiones

- **Enable:** escribir siempre `enabled: true` o `enabled: false` (nunca borrar la clave).
- **Target state booleano** en el mensaje (no flip) para evitar races.
- **Identidad del ítem:** el Host resuelve solo por `id` relativo POSIX; no confiar en `path` absoluto del Webview.
- **UI control:** el LED se convierte en el propio toggle (`role="switch"`), no un switch aparte.
- **Actualización UI:** optimista + revert en fallo + error visible (`role="alert"`).
- **Hover (pulido post-slice):** LED por defecto; en hover/focus del item se sustituye por `toggle-right` (activa) / `toggle-left` (inactiva). Texto disabled: `Inactiva` (antes `Desactivada`).
- **Paths compartidos:** extracto a `catalog-paths.ts` usado por discovery y persistencia.
- **Fixtures:** solo `mkdtemp`; nunca el `.cursor/` del repo.

## Contenido clave

### Host

- `set-item-enabled.ts` — RMW gray-matter + resultado tipado `{ ok, item | error }`
- `catalog-paths.ts` — resolución/validación de ids de catálogo
- `host-message-adapter.ts` — handler `webview/toggleEnabled` → `host/toggleResult`

### Contrato (`src/shared/`)

- `webview/toggleEnabled` `{ id, enabled }`
- `host/toggleResult` éxito `{ ok: true, item }` / fallo `{ ok: false, id, enabled, error }`

### Webview

- `EnabledToggle` (sustituye `EnabledLed`) + `toggle-icons.tsx`
- `use-catalog` — patch optimista, stale-result ignore, `toggleError`
- Cableado `App` → secciones → cards

### Verificación

- Unit 44 + integration 3 OK; typecheck, lint, build OK
- Usuario confirmó F5 / comportamiento correcto

### Cierre OpenSpec

- Tasks 10/10 `[x]`
- Sync → `openspec/specs/toggle-enabled/spec.md` (nuevo), updates en `host-webview-contract` y `dashboard-ui`
- Archivado en `openspec/changes/archive/2026-10-22-toggle-enabled-frontmatter/`

## Archivos y referencias

- `src/extension/set-item-enabled.ts`, `catalog-paths.ts`, `host-message-adapter.ts`
- `src/shared/messages.ts`, `type-guards.ts`
- `src/webview/enabled-toggle.tsx`, `use-catalog.ts`, `skill-card.tsx`, `rule-card.tsx`
- Prompt origen: `.cursor/prompts/07-aplicar-toggle-enabled-frontmatter.md`
- Siguiente: `open-in-native-editor`

## Pendiente / siguientes pasos

- Aplicar `open-in-native-editor` (acción Abrir → `showTextDocument`)
- Luego: `create-rule-and-skill-from-template`, `live-sync-filesystem-watcher`
