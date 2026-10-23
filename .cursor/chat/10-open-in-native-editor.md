# Abrir en editor nativo

- **Fecha:** 2026-10-23
- **Contexto:** Planificación, implementación, pulido UI y archivo del change OpenSpec `open-in-native-editor`.
- **Parte:** continúa de [09-toggle-enabled-frontmatter.md](./09-toggle-enabled-frontmatter.md)

## Resumen

Se aplicó de principio a fin `open-in-native-editor`: contrato `webview/openItem` ↔ `host/openResult`, Host con `showTextDocument`, y control accesible «Editar» en las cards. Tras verificación se afinó la UI (icono lápiz, estilos alineados con el toggle, más espacio). Change 7/7, sync a main specs y archivado. No se tocó create ni live-sync.

## Objetivo

- Aplicar el change tras el toggle (prompt `.cursor/prompts/08-aplicar-open-in-native-editor.md`).
- Abrir Skill/Rule en el editor nativo sin WYSIWYG en la Webview.
- Handoff al siguiente slice: `create-rule-and-skill-from-template` (luego `live-sync-filesystem-watcher`).

## Decisiones

- **Identidad:** solo `id` POSIX relativo; Host resuelve con `resolveCatalogItemPath` (no confiar en `path` absoluto del Webview).
- **Copy UI:** botón de texto **«Editar»** (no «Abrir»); mensajes del contrato en inglés (`openItem` / `openResult`).
- **Colocación:** a la derecha de la descripción; visible en `group-hover` y `group-focus-within` (teclado); `opacity-0` → `opacity-90` sin `display:none`.
- **Errores:** `host/openResult` tipado; banner `role="alert"` (mismo patrón que toggle); éxito sin ensuciar la UI.
- **Pulido post-slice:** icono `media/pencil.svg` vía `PencilIcon`; `EditButton` con estilos paralelos al toggle; más aire (`pt-3`/`mt-3`, `gap-3`) entre título/controles y descripción.
- **Fixtures:** solo `mkdtemp`; nunca el `.cursor/` del repo.

## Contenido clave

### Host

- `open-catalog-item.ts` — resolve + `fs.access` + `showTextDocument`; `{ ok, id, error? }`
- `host-message-adapter.ts` — handler `webview/openItem` → `host/openResult`

### Contrato (`src/shared/`)

- `webview/openItem` `{ id }`
- `host/openResult` éxito `{ ok: true, id }` / fallo `{ ok: false, id, error }`

### Webview

- `EditButton` + `PencilIcon`
- `use-catalog` — `openItem`, `openError` (banner compartido con `toggleError`)
- Cableado `App` → secciones → `SkillCard` / `RuleCard`

### Verificación

- Unit 54 + integration 4 OK; typecheck, lint, build OK
- Integration: skill + rule abren path correcto; fichero ausente → `ok: false` sin crash

### Cierre OpenSpec

- Tasks 7/7 `[x]`
- Sync → `openspec/specs/open-in-editor/spec.md` (nuevo); ADDED en `dashboard-ui` y `host-webview-contract`
- Archivado en `openspec/changes/archive/2026-10-23-open-in-native-editor/`

## Archivos y referencias

- `src/extension/open-catalog-item.ts`, `host-message-adapter.ts`
- `src/shared/messages.ts`, `type-guards.ts`
- `src/webview/edit-button.tsx`, `pencil-icon.tsx`, `skill-card.tsx`, `rule-card.tsx`, `use-catalog.ts`
- Prompt origen: `.cursor/prompts/08-aplicar-open-in-native-editor.md`
- Nota: el chat empezó apuntando a `08-dashboard-readonly-cards.md` por error; el alcance real fue open-in-native-editor
- Siguiente: `create-rule-and-skill-from-template`

## Pendiente / siguientes pasos

- Aplicar `create-rule-and-skill-from-template`
- Luego: `live-sync-filesystem-watcher`
- No abrir create/live-sync hasta cerrar el slice actual, salvo acuerdo explícito

## Notas

- La spec delta habla de «Open»; la UI de producto muestra «Editar» con icono lápiz.
- Skills revelan descripción+Editar en hover; Rules muestran descripción siempre y Editar en hover/focus.
