# Scaffold extensión SkillDex (fase 3)

- **Fecha:** 2026-10-22
- **Contexto:** Aplicación completa del change OpenSpec `scaffold-extension-webview` y verificación en Extension Development Host.
- **Parte:** continúa de [03-tooling-base-desarrollo.md](./03-tooling-base-desarrollo.md)

## Resumen

Se implementó el esqueleto de la extensión SkillDex: Activity Bar + WebviewView React/Vite/Tailwind con shell branded, comando para revelar la vista, pipeline de build Host+Webview y debug F5. Se alinearon los artefactos OpenSpec a esa superficie UI (no panel de editor). El change quedó aplicado (8/8 tasks), sincronizado a main specs y archivado.

## Objetivo

- Aplicar de principio a fin `scaffold-extension-webview`.
- Dejar una extensión arrancable con shell SkillDex verificable.
- No implementar changes 2–8 en la misma misión.

## Decisiones

- **Superficie UI: Activity Bar + `WebviewView` + comando `skilldex.openDashboard` que revela la vista** (no `createWebviewPanel` en el área de editores). Motivo: el usuario eligió “ambos” (barra + comando); el spec/tasks se actualizaron para no contradecir el design.
- **Un solo `package.json`**: fusionar `main`/`contributes`/deps/scripts de build sobre el tooling de la fase 2, sin romper lint/format.
- **Layout:** `src/extension/` (Host) + `src/webview/` (React); HTML con CSP + `asWebviewUri` desde `dist/webview`.
- **Verificación:** F5 abre una segunda ventana (Extension Development Host); ahí se ve el icono SkillDex. La ventana del repo no carga la extensión hasta instalarla/publicarla.

## Contenido clave

### Qué se entregó

- Identidad: `publisher: andoni`, `name: skilldex`, `displayName: SkillDex`
- Contribuciones: `viewsContainers.activitybar`, vista webview `skilldex.dashboardView`, comando `skilldex.openDashboard`
- Host: `activate`/`deactivate`, `DashboardViewProvider`, CSP con nonce
- Webview: shell vacío con título SkillDex (Tailwind)
- Scripts: `build`, `watch`, `compile`, `build:webview`, `typecheck`
- Debug: `.vscode/launch.json` + `tasks.json` versionados

### Cómo verificar

```bash
npm run build
```

F5 → ventana Extension Development Host → icono SkillDex o paleta **SkillDex: Abrir SkillDex**.

### Cierre OpenSpec

- Tasks 8/8 `[x]`
- Delta sync → `openspec/specs/extension-scaffold/spec.md`
- Archivado en `openspec/changes/archive/2026-10-22-scaffold-extension-webview/`

## Archivos y referencias

- `package.json`, `src/extension/`, `src/webview/`, `media/skilldex-icon.svg`
- `openspec/specs/extension-scaffold/spec.md`
- `openspec/changes/archive/2026-10-22-scaffold-extension-webview/`
- `.cursor/prompts/03-aplicar-scaffold-extension.md`
- Siguiente change: `host-webview-message-contract`

## Pendiente / siguientes pasos

- Aplicar `host-webview-message-contract` (tipos compartidos + handshake Host↔Webview).
- Adaptar el transporte del contrato a `webviewView.webview` (el design del change 2 aún menciona `panel.webview` de forma genérica).
- No archivar ni aplicar changes 3–8 hasta cerrar el contrato, salvo acuerdo explícito.
