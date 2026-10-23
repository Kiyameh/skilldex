# IMPLEMENTADOR OPENSPEC — APLICAR live-sync-filesystem-watcher DE PRINCIPIO A FIN

## Rol y objetivo

Eres un **Agente de Implementación OpenSpec** para SkillDex. Tu objetivo es **iniciar y completar** el change `live-sync-filesystem-watcher`: registrar `FileSystemWatcher` sobre `.cursor/rules/` y `.cursor/skills/`, refrescar discovery con debounce ante create/change/delete, y empujar el catálogo actualizado al Webview para que el dashboard se re-renderice sin recarga manual.

## Contexto (resumen)

SkillDex es una extensión VS Code (`publisher: andoni`, `name: skilldex`, `displayName: SkillDex`) para gestionar Rules y Skills bajo `.cursor/`. El MVP está troceado en changes verticales. Ya están implementados, sincronizados a main specs y archivados:

1. `scaffold-extension-webview` — Activity Bar + `WebviewView` (`skilldex.dashboardView`)
2. `host-webview-message-contract` — `src/shared/`, handshake
3. `testing-harness` — Vitest + `@vscode/test-cli`
4. `discover-parse-rules-skills` — discovery/`gray-matter`, `webview/catalogRequest` ↔ `host/catalog`
5. `dashboard-readonly-cards` — secciones Skills/Rules + cards
6. `toggle-enabled-frontmatter` — toggle 1-click + `webview/toggleEnabled` ↔ `host/toggleResult`
7. `open-in-native-editor` — «Editar» → `showTextDocument` + `webview/openItem` ↔ `host/openResult`

Sigue abierto (no implementar en este change): `create-rule-and-skill-from-template`. El orden MVP original situaba create antes que live-sync; el usuario pide aplicar **live-sync ahora**. Verifica integración con **toggle** y **open**; la parte de create en la task 2.3 queda aplazada o se marca solo si create ya existiera.

El Host vive en `src/extension/`, el Webview en `src/webview/`, el contrato en `src/shared/`. Build: `out/extension/` + `out/shared/` + `dist/webview/`; F5 vía Extension Development Host. Hoy el catálogo solo se pide bajo demanda tras handshake; `deactivate` está vacío; no hay watchers.

### Decisiones relevantes

- **Solo este change:** `live-sync-filesystem-watcher`. No create-from-template. No rehacer toggle/open/discovery salvo cableado mínimo.
- **API:** `vscode.workspace.createFileSystemWatcher` + `RelativePattern` sobre `.cursor/rules/**` y `.cursor/skills/**` (o equivalente).
- **Debounce:** constante nombrada ~150–300ms; coalescer ráfagas create/change/delete.
- **Refresh:** re-ejecutar discovery completo (`discoverCatalog`) en MVP; misma forma de `CatalogPayload` que el request on-demand.
- **Push:** Host→Webview con mensaje tipado de catálogo (reutilizar `host/catalog` o extensión aditiva equivalente). El Webview ya sustituye listas al recibir `host/catalog` vía `useCatalog`; confirmar que el push actualiza UI sin pedir request explícito.
- **Sin workspace folder:** no registrar watchers; empty states existentes bastan.
- **Dispose:** liberar watchers en `deactivate` (y en dispose del panel si el ownership lo requiere).
- **Echo de writes propios** (p. ej. toggle): debounce + refresh completo mitiga inconsistencias; evitar bucles/crashes.
- **Fixtures:** solo `mkdtemp` / mocks; **nunca** mutar el `.cursor/` del repo SkillDex como fixture permanente.
- **Calidad:** TypeScript `strict: true`; prohibido `any`; no bypass de linter salvo petición explícita.
- **Imports Host:** relativas con sufijo `.js` (NodeNext).

### Stack y convenciones

- Extension Host: TypeScript strict
- Webview: React + Vite + Tailwind
- Host↔Webview: `postMessage` / `onDidReceiveMessage`
- Código/símbolos/commits: inglés; chat con el usuario: español
- Reglas: `.cursor/rules/core-rules.mdc`, `.cursor/rules/clean-code.mdc`
- Skills útiles: `.cursor/skills/openspec-apply-change/SKILL.md`, `.cursor/skills/project/vs-extension-builder/SKILL.md`, `.cursor/skills/stack/typescript/typescript-conventions/SKILL.md`
- Testing: `npm run test:unit`, `npm run test:integration`, `npm test` como gate local

## Alcance

### In-scope

1. Registrar watchers Rules + Skills con `RelativePattern`
2. Debounce + re-run discovery + push catálogo al Webview
3. Extender contrato solo si hace falta para push Host→Webview sin request (preferir reutilizar `host/catalog`)
4. Dispose de watchers en el ciclo de vida correcto
5. Re-render del dashboard al recibir el push (cablear si hoy solo escucha tras request)
6. Verificación vertical: edit/save skill, delete rule, dispose limpio
7. Integration test: mutar fichero en workspace temporal y observar refresh tras debounce
8. Marcar tasks `[x]` tras comprobarlas

### Out-of-scope

- `create-rule-and-skill-from-template` (sigue pendiente; no implementarlo aquí)
- Sync multi-máquina, git hooks, polling
- Diff granular por campo en UI (re-render de listas basta)
- Rediseño visual del dashboard
- Reimplementar discovery, toggle u open
- Archivar este change sin confirmación explícita del usuario
- Sobrescribir rules/skills de convención del repo SkillDex

## Instrucciones adicionales del usuario

1. El agente receptor debe **iniciar el desarrollo** del change OpenSpec `live-sync-filesystem-watcher` y llevarlo a cabo.
2. Partir de proposal/design/specs/tasks del change y del código actual (discovery, adapter, `use-catalog`, lifecycle de extensión).
3. Preferir aclarar dudas o presentar un plan breve al usuario si hay decisiones abiertas (p. ej. ownership de watchers: extensión vs panel; reutilizar vs nuevo mensaje de push), luego implementar.

## Archivos y referencias

- `openspec/changes/live-sync-filesystem-watcher/proposal.md`
- `openspec/changes/live-sync-filesystem-watcher/design.md`
- `openspec/changes/live-sync-filesystem-watcher/tasks.md`
- `openspec/changes/live-sync-filesystem-watcher/specs/live-sync/spec.md`
- `openspec/changes/live-sync-filesystem-watcher/specs/host-webview-contract/spec.md`
- `openspec/changes/live-sync-filesystem-watcher/specs/dashboard-ui/spec.md`
- `openspec/changes/live-sync-filesystem-watcher/specs/rules-skills-discovery/spec.md`
- `openspec/specs/rules-skills-discovery/spec.md`, `host-webview-contract/spec.md`, `dashboard-ui/spec.md`
- Código base: `src/extension/extension.ts`, `dashboard-view-provider.ts`, `host-message-adapter.ts`, `discover-catalog.ts`
- Webview: `src/webview/use-catalog.ts`, `host-message-bridge.ts`, `App.tsx`
- Contrato: `src/shared/messages.ts`, `type-guards.ts`
- Chat previo: `.cursor/chat/10-open-in-native-editor.md`
- Flujo: skill/comando `openspec-apply-change` / `/opsx-apply`

## Criterios de aceptación

- [ ] Todos los ítems de `openspec/changes/live-sync-filesystem-watcher/tasks.md` están `[x]` con evidencia (salvo create en 2.3: verificar toggle/open; documentar create como aplazado)
- [ ] Watchers activos con workspace folder sobre Rules y Skills
- [ ] Create/change/delete → discovery debounced → push → UI actualizada sin reload manual
- [ ] Ráfagas de eventos no provocan tormenta ilimitada de refreshes
- [ ] `deactivate` (y dispose correspondiente) libera watchers
- [ ] Contrato tipado; sin `any`; handshake/catálogo/toggle/open intactos
- [ ] Integration (`npm run test:integration`) cubre refresh tras mutación en temp workspace
- [ ] `typecheck` / `lint` / `build` / `npm test` en verde
- [ ] No se ha implementado create-from-template
- [ ] No se han pisado rules/skills de convención del repo como fixtures permanentes

## Instrucciones de trabajo

1. Lee íntegros proposal, design, specs y tasks del change, e inspecciona `extension.ts`, `dashboard-view-provider.ts`, `host-message-adapter.ts`, `discover-catalog.ts` y `use-catalog.ts`.
2. Si hay una decisión de ownership/contrato no cerrada en el design, pregunta al usuario o presenta un plan corto antes de codificar en masa.
3. Usa `/opsx-apply` / skill `openspec-apply-change` si está disponible; si no, sigue `tasks.md` en orden.
4. Implementa watchers + debounce + push; cablea Webview; escribe integration test en `mkdtemp`.
5. Verifica en Extension Development Host con ficheros seguros (o confirma vía tests); no reescribas el `.cursor/` de convención del repo.
6. Marca cada task `[x]` solo tras comprobarla.
7. Resume qué quedó, cómo verificar edit/save y delete, y confirma que **no** tocaste create.
8. Detente. No archives ni empieces otro change sin confirmación del usuario.

Reglas de ejecución:

- No inventes requisitos ni rutas; si falta un dato crítico, pregunta antes de continuar.
- Respeta in-scope / out-of-scope.
- Código y nombres de símbolos en inglés; comunicación con el usuario en español.
- No uses `any` ni bypass de linter salvo petición explícita.
- Extiende el contrato de forma aditiva solo si hace falta; preferir reutilizar `host/catalog`.
- Prefiere módulos pequeños y testeables; constante de debounce con nombre claro.

## Primera acción requerida

Lee `openspec/changes/live-sync-filesystem-watcher/tasks.md` y `design.md`, inspecciona `src/extension/extension.ts`, `dashboard-view-provider.ts` y `use-catalog.ts`, y comienza la task 1.1 (registrar watchers) — o presenta al usuario un plan breve con la decisión de ownership (extensión vs panel) si aún no está clara — sin implementar create ni otros changes.
