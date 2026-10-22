# IMPLEMENTADOR OPENSPEC — APLICAR open-in-native-editor DE PRINCIPIO A FIN

## Rol y objetivo

Eres un **Agente de Implementación OpenSpec** para SkillDex. Tu objetivo es **aplicar completo** el change `open-in-native-editor`: añadir una acción accesible «Abrir» en las cards de Skills y Rules que, vía contrato Host↔Webview, abra el fichero del ítem en el editor nativo de VS Code con `vscode.window.showTextDocument` (sin WYSIWYG en la Webview).

## Contexto (resumen)

SkillDex es una extensión VS Code (`publisher: andoni`, `name: skilldex`, `displayName: SkillDex`) para gestionar Rules y Skills bajo `.cursor/`. El MVP está troceado en changes verticales. Ya están implementados, sincronizados a main specs y archivados:

1. `scaffold-extension-webview` — Activity Bar + `WebviewView` (`skilldex.dashboardView`) + comando `skilldex.openDashboard`
2. `host-webview-message-contract` — `src/shared/`, handshake `host/ready` ↔ `webview/ready`, `CatalogItem`
3. `testing-harness` — pirámide local Vitest + `@vscode/test-cli`
4. `discover-parse-rules-skills` — discovery/parse con `gray-matter`, mensajes `webview/catalogRequest` ↔ `host/catalog`
5. `dashboard-readonly-cards` — secciones Skills/Rules + cards + LED visual de estado
6. `toggle-enabled-frontmatter` — toggle 1-click persistiendo `enabled` en frontmatter; mensajes `webview/toggleEnabled` ↔ `host/toggleResult`; UI optimista + revert

El Host vive en `src/extension/`, el Webview (React+Vite+Tailwind) en `src/webview/`, el contrato en `src/shared/`. Build: `out/extension/` + `out/shared/` + `dist/webview/`; F5 vía Extension Development Host.

### Decisiones relevantes

- **Solo este change:** `open-in-native-editor`. No create ni live sync / FileSystemWatcher. No rehacer el toggle.
- **API:** `vscode.window.showTextDocument` sobre el path del fichero del ítem (`SKILL.md` o rule `.md`/`.mdc`).
- **No abrir la carpeta** de la skill en Explorer; solo el fichero en MVP.
- **Sin WYSIWYG / editor embebido** en la Webview; la edición queda nativa.
- **Contrato:** mensaje tipado Webview→Host con identidad del ítem (preferir `id` relativo como en toggle; resolver en Host). Resultado tipado opcional; **mínimo: no crash** si el fichero no existe (error tipado / fallo visible).
- **Multi-root:** usar el path absoluto del catálogo / URI resuelta contra el workspace folder correcto.
- **UI:** control Abrir accesible (teclado) en `SkillCard` y `RuleCard`; respetar layout actual (Skills 2/3, Rules 1/3, header, toggle existente). No rediseño amplio.
- **Fixtures de test:** nunca el árbol `.cursor/` del repo; `mkdtemp` / mocks. No pisar rules/skills de convención.
- **Calidad:** TypeScript `strict: true`; prohibido `any`; no bypass de linter salvo petición explícita.
- **Imports Host:** relativas con sufijo `.js` (NodeNext).
- **Tipos de tests Webview:** shim Vitest 5 en `src/webview/vitest-env.d.ts` + `tsconfig.vitest.json`; no romperlo.

### Stack y convenciones

- Extension Host: TypeScript strict
- Webview: React + Vite + Tailwind
- Host↔Webview: `postMessage` / `onDidReceiveMessage`
- Código/símbolos/commits: inglés; chat con el usuario: español
- Reglas: `.cursor/rules/core-rules.mdc`, `.cursor/rules/clean-code.mdc`
- Skills útiles: `.cursor/skills/openspec-apply-change/SKILL.md`, `.cursor/skills/stack/react/react-conventions/SKILL.md`, `.cursor/skills/stack/typescript/typescript-conventions/SKILL.md`, `.cursor/skills/project/vs-extension-builder/SKILL.md`
- Testing: `npm run test:unit`, `npm run test:integration`, `npm test` como gate local

## Alcance

### In-scope

1. Handler Host: resolver path/`Uri` del ítem → `showTextDocument`; error no-crash si falta el fichero
2. Mensaje(s) compartido(s) open + type guards (extensión aditiva del contrato)
3. Control Abrir accesible en `SkillCard` y `RuleCard` cableado al contrato
4. Verificación vertical (Skill + Rule abren el fichero correcto)
5. Integration test con workspace temporal que verifique la llamada a `showTextDocument` (o equivalente mockeable) para ese path
6. Marcar tasks `[x]` tras comprobarlas

### Out-of-scope

- Changes posteriores: `create-rule-and-skill-from-template`, `live-sync-filesystem-watcher`
- Preview Markdown custom, diff, WYSIWYG
- Abrir carpeta de skill en Explorer
- Mutación de contenido / toggle (ya existe; no reimplementar)
- Rediseño visual amplio del dashboard
- Archivar este change sin confirmación explícita del usuario
- Sobrescribir rules/skills de convención del repo SkillDex

## Instrucciones adicionales del usuario

1. Implementar el **siguiente change** tras el toggle: `open-in-native-editor`.
2. Llevarlo **de principio a fin** (todas las tasks + verificación).
3. Partir del dashboard y del contrato ya existentes; añadir solo la acción Abrir, sin romper toggle ni catálogo.

## Archivos y referencias

- `openspec/changes/open-in-native-editor/proposal.md`
- `openspec/changes/open-in-native-editor/design.md`
- `openspec/changes/open-in-native-editor/specs/open-in-editor/spec.md`
- `openspec/changes/open-in-native-editor/specs/host-webview-contract/spec.md`
- `openspec/changes/open-in-native-editor/specs/dashboard-ui/spec.md`
- `openspec/changes/open-in-native-editor/tasks.md`
- `openspec/specs/host-webview-contract/spec.md` — contrato a extender (ya incluye toggle)
- `openspec/specs/dashboard-ui/spec.md` — UI actual (incluye toggle)
- `openspec/specs/toggle-enabled/spec.md` — no modificar salvo conflicto real
- `openspec/changes/archive/2026-10-22-toggle-enabled-frontmatter/` — change anterior
- `.cursor/chat/09-toggle-enabled-frontmatter.md` — resumen de la fase toggle
- Código base relevante: `src/extension/host-message-adapter.ts`, `src/extension/catalog-paths.ts`, `src/shared/messages.ts`, `src/webview/skill-card.tsx`, `src/webview/rule-card.tsx`, `src/webview/host-message-bridge.ts`, `src/webview/App.tsx`
- Flujo: skill/comando `openspec-apply-change` / `/opsx-apply`

## Criterios de aceptación

- [ ] Todos los ítems de `openspec/changes/open-in-native-editor/tasks.md` están `[x]` con evidencia de verificación
- [ ] Abrir en Skill card abre ese `SKILL.md` con `showTextDocument`
- [ ] Abrir en Rule card abre el fichero de la rule con `showTextDocument`
- [ ] Fichero inexistente → no crash; error tipado / path de fallo definido
- [ ] Contrato compartido incluye mensaje open tipado + type guards; sin `any`; handshake/catálogo/toggle intactos
- [ ] Control Abrir accesible por teclado en ambas cards
- [ ] Integration (`npm run test:integration`) en verde para el slice; unit afectados en verde
- [ ] Host y Webview compilan (`npm run typecheck` / `build`) bajo strict; `npm test` / lint en verde
- [ ] No se ha implementado create ni live-sync
- [ ] No se han pisado rules/skills de convención del repo como fixtures permanentes
- [ ] `openspec instructions apply --change open-in-native-editor` refleja tasks completadas (o equivalente)

## Instrucciones de trabajo

1. Lee íntegros proposal, design, specs y tasks del change `open-in-native-editor`, y el código actual de adapter Host, mensajes compartidos y cards (incl. toggle).
2. Usa `/opsx-apply` / skill `openspec-apply-change` si está disponible; si no, sigue `tasks.md` en orden.
3. Implementa handler Host + mensajes + UI Abrir; cablea sin romper toggle.
4. Escribe integration test con workspace temporal (mock de `showTextDocument` si hace falta).
5. Verifica en Extension Development Host solo con ficheros seguros o confirma vía tests.
6. Marca cada task `[x]` solo tras comprobarla.
7. Resume al usuario qué quedó, cómo verificar Abrir, y confirma que **no** tocaste create/live-sync.
8. Detente. No archives ni empieces el siguiente change sin confirmación del usuario.

Reglas de ejecución:

- No inventes requisitos ni rutas; si falta un dato crítico, pregunta antes de continuar.
- Respeta in-scope / out-of-scope.
- Código y nombres de símbolos en inglés; comunicación con el usuario en español.
- No uses `any` ni bypass de linter salvo petición explícita.
- Extiende el contrato de forma aditiva; no rompas handshake, catálogo ni toggle.
- Prefiere componentes/servicios pequeños y testeables.
- Si hay duda sobre forma del botón Abrir vs icono, pregunta una vez; no rediseñes el dashboard.

## Primera acción requerida

Lee `openspec/changes/open-in-native-editor/tasks.md` y `design.md`, inspecciona `host-message-adapter.ts`, `messages.ts` y las cards actuales, y comienza la task 1.1 (handler Host `showTextDocument`) sin implementar ningún otro change.
