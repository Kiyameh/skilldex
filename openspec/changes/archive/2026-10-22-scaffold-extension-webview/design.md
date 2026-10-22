# Design

## Context

Repo SkillDex vacío de código de producto (solo `.cursor/` y OpenSpec). Stack fijado: Extension Host TS strict, Webview React+Vite+Tailwind. Identidad: publisher `andoni`, name `skilldex`, displayName `SkillDex`.

## Goals / Non-Goals

**Goals:**
- Extensión arrancable en Extension Development Host
- Webview shell con marca SkillDex y pipeline Vite+Tailwind
- Estructura de carpetas clara Host vs Webview
- Superficie UI: Activity Bar + WebviewView (sidebar), revelable también por comando

**Non-Goals:**
- Contrato de mensajes completo, discovery, dashboard features
- Publicación Marketplace, tests complejos
- Panel de editor (`createWebviewPanel`) como superficie principal

## Decisions

- **Layout sugerido:** `src/extension/` (Host) + `src/webview/` (React app) o equivalente monorepo-lite documentado en tasks; un solo `package.json` de extensión salvo que el scaffold oficial exija split claro.
- **Build:** Vite construye el Webview a un output estático servido por el Host (`webview.asWebviewUri`).
- **Tailwind:** configuración en el paquete Webview; no CSS Modules como default (alineado a `core-rules` actualizado).
- **Activación / superficie UI:**
  - `contributes.viewsContainers.activitybar` con id `skilldex` e icono en `media/`
  - `contributes.views` con `type: webview` (id estable `skilldex.dashboardView`, name SkillDex)
  - Host registra un `WebviewViewProvider` (`retainContextWhenHidden: true`)
  - Comando `skilldex.openDashboard` revela/enfoca esa vista (no crea un panel en el área de editores)
- **CSP:** HTML generado/inyectado por el Host con nonce; scripts y estilos vía `asWebviewUri` desde el output de Vite.

## Risks / Trade-offs

- Yeoman/`yo code` vs scaffold manual: preferir el generador oficial si acelera, pero ajustar nombres a SkillDex.
- Acoplar demasiado Host y Webview en un solo bundle complica el contrato posterior; mantener boundaries de carpetas desde el día 1.
- Changes posteriores que mencionen `panel.webview` deberán adaptarse a `webviewView.webview` al aplicarlos.
