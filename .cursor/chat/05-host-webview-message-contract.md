# Contrato Host↔Webview (fase 4)

- **Fecha:** 2026-10-22
- **Contexto:** Aplicación completa del change OpenSpec `host-webview-message-contract`, sincronización a main specs y archivo.
- **Parte:** continúa de [04-scaffold-extension-webview.md](./04-scaffold-extension-webview.md)

## Resumen

Se congeló el contrato tipado Host↔Webview sobre el shell Activity Bar/`WebviewView` ya existente: módulo `src/shared/`, adapters con type guards (sin `any`) y handshake `host/ready` ↔ `webview/ready` verificable. El change quedó 8/8, sincronizado a `openspec/specs/host-webview-contract/spec.md` y archivado. No se implementaron discovery ni UI de cards.

## Objetivo

- Aplicar de principio a fin `host-webview-message-contract`.
- Dejar un contrato único importable por Host y Webview, con handshake observable.
- No implementar changes 3–8 en la misma misión.

## Decisiones

- **Mensajes de handshake:** `host/ready` (Host → Webview) y `webview/ready` (Webview → Host). Motivo: el prompt/spec lo preferían frente a `ping`/`pong`; discovery añadirá request/response de catálogo después, de forma aditiva.
- **Tipos de dominio:** `CatalogItem` placeholder `{ id, kind: 'rule' | 'skill', path, enabled, title?, description?, globs?: string[] }` sin enviarlo aún.
- **Transporte:** `webviewView.webview.postMessage` / `onDidReceiveMessage` (no panel de editor). Corrección mínima en `design.md` del change.
- **Carrera de carga:** reintento corto e idempotente en el Host, porque `postMessage` puede llegar antes de que el script del Webview esté vivo.
- **Observabilidad:** `console.log("SkillDex handshake complete")` + indicador temporal en el header (`Host: conectado` / `Host: esperando`).
- **Tests (sesión original):** no se añadió runner. **Actualización (2026-10-22):** el arnés `testing-harness` cubre type-guards, handshake con Webview fake y RTL del indicador; quality gate local `npm test`.
- **Imports del Host:** rutas relativas con sufijo `.js`. El Host se emite con `tsc` (NodeNext); un alias no se reescribe y rompería el runtime.
- **Build Host:** `tsconfig.extension.json` pasó a `rootDir: "src"` y `outDir: "out"` para incluir `src/shared/` (`main` sigue en `./out/extension/extension.js`).

## Contenido clave

### Contrato (`src/shared/`)

- `messages.ts`: unions discriminadas por `type`
- `catalog.ts`: `CatalogItem` / `CATALOG_ITEM_KINDS`
- `type-guards.ts`: narrowing desde `unknown`
- `index.ts`: reexportas

### Adapters

- Host: `src/extension/host-message-adapter.ts`, enganchado en `DashboardViewProvider.resolveWebviewView`
- Webview: `host-message-bridge.ts`, `vscode-api.ts`, hook `useHostHandshake` en `App.tsx`

### Cómo verificar

```bash
npm run build
```

F5 → Extension Development Host → icono SkillDex o **SkillDex: Abrir SkillDex**. El header debe pasar a **Host: conectado**; Debug Console: `SkillDex handshake complete`.

### Cierre OpenSpec

- Tasks 8/8 `[x]`
- Delta sync → `openspec/specs/host-webview-contract/spec.md`
- Archivado en `openspec/changes/archive/2026-10-22-host-webview-message-contract/`

## Archivos y referencias

- `src/shared/`, `src/extension/host-message-adapter.ts`, `src/webview/host-message-bridge.ts`
- `openspec/specs/host-webview-contract/spec.md`
- `openspec/changes/archive/2026-10-22-host-webview-message-contract/`
- `.cursor/prompts/04-aplicar-host-webview-contract.md`
- Siguiente change: `discover-parse-rules-skills`

## Pendiente / siguientes pasos

- Aplicar `discover-parse-rules-skills` (gray-matter, discovery `.cursor/rules` + `.cursor/skills/**/SKILL.md`, extender mensajes de catálogo).
- El workspace de desarrollo **es** este repo: discovery listará las rules/skills propias de SkillDex (`.cursor/rules/*.mdc` y `.cursor/skills/**/SKILL.md`). No pisar esos ficheros; para `enabled: false` usar un fixture claramente nombrado si hace falta.
- No archivar ni aplicar changes 4–8 (dashboard cards, toggle, open, create, live-sync) hasta cerrar discovery, salvo acuerdo explícito.

## Notas

La verificación visual del handshake en Extension Development Host quedó a cargo del usuario: Computer Use no puede controlar Cursor.
