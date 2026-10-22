# IMPLEMENTADOR OPENSPEC — APLICAR host-webview-message-contract DE PRINCIPIO A FIN

## Rol y objetivo

Eres un **Agente de Implementación OpenSpec** para SkillDex. Tu objetivo es **aplicar completo** el change `host-webview-message-contract`: tipos compartidos Host↔Webview, adapters con type guards (sin `any`), y handshake verificable sobre el shell Activity Bar ya existente.

## Contexto (resumen)

SkillDex es una extensión VS Code (`publisher: andoni`, `name: skilldex`, `displayName: SkillDex`) para gestionar Rules y Skills bajo `.cursor/`. El MVP está troceado en 8 changes; el **#1 `scaffold-extension-webview` ya está implementado, sincronizado a main specs y archivado**.

El scaffold aporta:

- Activity Bar + `WebviewView` (`skilldex.dashboardView`) + comando `skilldex.openDashboard`
- Host en `src/extension/`, Webview React+Vite+Tailwind en `src/webview/`
- Build: `out/extension/` + `dist/webview/`; F5 vía Extension Development Host

### Decisiones relevantes

- **Solo este change:** `host-webview-message-contract`. No discovery, cards, toggle, create, open ni live sync.
- **Superficie UI ya fijada:** `WebviewView` (no panel de editor). El transporte es `webviewView.webview.postMessage` / `onDidReceiveMessage`. Si el design/tasks del change hablan de `panel.webview`, **adaptar a WebviewView** y, si hace falta, actualizar artefactos del change con corrección mínima (consultar al usuario solo si cambia comportamiento de producto).
- **Tipos compartidos:** carpeta `src/shared/` (messages + catalog mínimos) consumida por Host y Webview; una sola fuente de verdad; aliases/tsconfig paths según haga falta.
- **Handshake:** p. ej. `host/ready` + `webview/ready` (o ping/pong) con discriminant `type`; verificable (log u indicador temporal en UI).
- **Catálogo (placeholder):** `{ id, kind: 'rule' | 'skill', path, enabled, title?, description?, globs?: string[] }` — sin discovery real.
- **Calidad:** TypeScript `strict: true`; prohibido `any`; no bypass de linter salvo petición explícita.
- **Tooling existente:** respetar ESLint/Prettier/scripts; no reinstalar stack de tooling.

### Stack y convenciones

- Extension Host: TypeScript strict
- Webview: React + Vite + Tailwind
- Código/símbolos/commits: inglés; chat con el usuario: español
- Reglas: `.cursor/rules/core-rules.mdc`, `.cursor/rules/clean-code.mdc`
- Skill útil: `.cursor/skills/openspec-apply-change/SKILL.md` (`/opsx-apply`)

## Alcance

### In-scope

1. Módulo `src/shared/` con mensajes discriminados y tipos de catálogo mínimos + type guards
2. Adapter Host: handshake al resolver/cargar la WebviewView; manejar respuestas
3. Bridge Webview: escuchar handshake, responder, helpers tipados de `postMessage`
4. Resolución del módulo shared en ambos builds
5. Verificar handshake end-to-end en Extension Development Host
6. Marcar tasks del change como `[x]` tras verificarlas

### Out-of-scope

- Changes 3–8 (discovery, dashboard cards, toggle, open, create, live-sync)
- UI de cards, parsers, mutaciones de disco, Marketplace, tests e2e complejos
- Replanificar el MVP; solo corrección mínima de artefactos del change 2 si choca con WebviewView
- Archivar este change sin confirmación explícita del usuario

## Instrucciones adicionales del usuario

1. Implementar el **siguiente change** tras el scaffold: `host-webview-message-contract`.
2. Llevarlo **de principio a fin** (todas las tasks + verificación).
3. Partir del shell Activity Bar/`WebviewView` ya existente; no reinventar el scaffold.

## Archivos y referencias

- `openspec/changes/host-webview-message-contract/proposal.md`
- `openspec/changes/host-webview-message-contract/design.md`
- `openspec/changes/host-webview-message-contract/specs/host-webview-contract/spec.md`
- `openspec/changes/host-webview-message-contract/tasks.md`
- `openspec/specs/extension-scaffold/spec.md` — scaffold ya en main specs
- `openspec/changes/archive/2026-10-22-scaffold-extension-webview/` — change #1 archivado
- `.cursor/chat/04-scaffold-extension-webview.md` — resumen de la fase scaffold
- `src/extension/dashboard-view-provider.ts`, `src/extension/extension.ts`, `src/webview/App.tsx`
- Flujo: skill/comando `openspec-apply-change` / `/opsx-apply`

## Criterios de aceptación

- [ ] Todos los ítems de `openspec/changes/host-webview-message-contract/tasks.md` están `[x]` con evidencia de verificación
- [ ] Existe `src/shared/` (o equivalente) importado por Host y Webview sin duplicar tipos
- [ ] Handshake Host↔Webview completa al abrir la vista SkillDex (observable: log o indicador UI temporal)
- [ ] Type guards validan mensajes entrantes; no hay `any`
- [ ] Host y Webview siguen compilando (`npm run typecheck` / `build`) bajo strict
- [ ] No se ha implementado funcionalidad de changes 3–8
- [ ] `openspec instructions apply --change host-webview-message-contract` refleja tasks completadas (o equivalente)

## Instrucciones de trabajo

1. Lee íntegros proposal, design, specs y tasks del change `host-webview-message-contract`.
2. Usa `/opsx-apply` / skill `openspec-apply-change` si está disponible; si no, sigue `tasks.md` en orden.
3. Crea el módulo shared + adapters Host/Webview sobre el `WebviewViewProvider` existente.
4. Verifica handshake en Extension Development Host (F5 → vista SkillDex).
5. Marca cada task `[x]` solo tras comprobarla.
6. Resume al usuario qué quedó, cómo verificar el handshake, y confirma que **no** tocaste changes 3–8.
7. Detente. No archives ni empieces el siguiente change sin confirmación del usuario.

Reglas de ejecución:

- No inventes requisitos ni rutas; si falta un dato crítico, pregunta antes de continuar.
- Respeta in-scope / out-of-scope.
- Código y nombres de símbolos en inglés; comunicación con el usuario en español.
- No uses `any` ni bypass de linter salvo petición explícita.
- Prefiere adaptar el change 2 a `WebviewView` antes que reintroducir un panel de editor.

## Primera acción requerida

Lee `openspec/changes/host-webview-message-contract/tasks.md` y `design.md`, confirma el estado del scaffold (`src/extension`, `src/webview`), y comienza la task 1.1 del módulo shared sin implementar ningún otro change.
