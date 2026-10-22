# IMPLEMENTADOR OPENSPEC — APLICAR toggle-enabled-frontmatter DE PRINCIPIO A FIN

## Rol y objetivo

Eres un **Agente de Implementación OpenSpec** para SkillDex. Tu objetivo es **aplicar completo** el change `toggle-enabled-frontmatter`: permitir activar/desactivar Skills y Rules en un clic persistiendo `enabled` en el frontmatter del fichero (vía `gray-matter` en el Host), extendiendo el contrato Host↔Webview y cableando controles accesibles en las cards del dashboard.

## Contexto (resumen)

SkillDex es una extensión VS Code (`publisher: andoni`, `name: skilldex`, `displayName: SkillDex`) para gestionar Rules y Skills bajo `.cursor/`. El MVP está troceado en changes verticales. Ya están implementados, sincronizados a main specs y archivados:

1. `scaffold-extension-webview` — Activity Bar + `WebviewView` (`skilldex.dashboardView`) + comando `skilldex.openDashboard`
2. `host-webview-message-contract` — `src/shared/`, handshake `host/ready` ↔ `webview/ready`, `CatalogItem`
3. `testing-harness` — pirámide local Vitest + `@vscode/test-cli`
4. `discover-parse-rules-skills` — discovery/parse con `gray-matter`, mensajes `webview/catalogRequest` ↔ `host/catalog`
5. `dashboard-readonly-cards` — secciones Skills/Rules + cards + LED visual de estado; UI de solo lectura

El Host vive en `src/extension/`, el Webview (React+Vite+Tailwind) en `src/webview/`, el contrato en `src/shared/`. Build: `out/extension/` + `out/shared/` + `dist/webview/`; F5 vía Extension Development Host.

### Decisiones relevantes

- **Solo este change:** `toggle-enabled-frontmatter`. No create, open ni live sync / FileSystemWatcher.
- **Persistencia:** frontmatter `enabled: false` para desactivar (Rules y `SKILL.md`). **Enable:** escribir `enabled: true` explícito (no eliminar la clave). Documentado en design/tasks.
- **Toggle envía target state booleano** (no solo “flip”) para evitar races UI.
- **Round-trip gray-matter:** leer → parse → set `enabled` → stringify → escribir; **preservar el body Markdown**.
- **Contrato:** añadir mensajes tipados request/result (identidad del ítem + `enabled` objetivo; éxito con ítem actualizado o fallo con error). Extender `src/shared/`; type guards sin `any`.
- **UI:** sustituir o complementar el LED solo-lectura (`EnabledLed`) con un control de toggle **operativo y accesible** (teclado) en `SkillCard` y `RuleCard`. Cableado al contrato.
- **Tras éxito:** actualizar estado local del catálogo en el Webview. **Tras fallo:** error visible; no dejar el estado fallido como si se hubiera guardado (revertir UI optimista si se usa).
- **Concurrencia MVP:** último write gana; sin locking sofisticado.
- **Workspace de desarrollo = este repo:** F5 ve rules/skills reales. **No pisar ni reescribir** rules/skills de convención (p. ej. `core-rules`, skills del proyecto) como fixture permanente. Verificar con **workspace temporal** en integration tests y/o ficheros de prueba claramente aislados.
- **Fixtures de test:** nunca el árbol `.cursor/` del repo; `mkdtemp` / props mockeadas.
- **Calidad:** TypeScript `strict: true`; prohibido `any`; no bypass de linter salvo petición explícita.
- **Imports Host:** relativas con sufijo `.js` (NodeNext).
- **Tipos de tests Webview:** existe shim Vitest 5 en `src/webview/vitest-env.d.ts` + `tsconfig.vitest.json`; no romperlo.

### Stack y convenciones

- Extension Host: TypeScript strict
- Parse/write: `gray-matter`
- Webview: React + Vite + Tailwind
- Código/símbolos/commits: inglés; chat con el usuario: español
- Reglas: `.cursor/rules/core-rules.mdc`, `.cursor/rules/clean-code.mdc`
- Skills útiles: `.cursor/skills/openspec-apply-change/SKILL.md`, `.cursor/skills/stack/react/react-conventions/SKILL.md`, `.cursor/skills/stack/typescript/typescript-conventions/SKILL.md`
- Testing: `npm run test:unit`, `npm run test:integration`, `npm test` como gate local

## Alcance

### In-scope

1. Servicio Host: read/parse/set `enabled`/stringify/write; preservar body; éxito o fallo tipado
2. Mensajes compartidos toggle request/result + type guards
3. Control toggle accesible en `SkillCard` y `RuleCard`
4. Actualizar catálogo local en éxito; error visible + revert en fallo
5. Unit tests (frontmatter write preservando body) + integration (toggle en workspace temporal)
6. Verificación vertical (F5 o tests) y marcar tasks `[x]`

### Out-of-scope

- Changes posteriores: `open-in-native-editor`, `create-rule-and-skill-from-template`, `live-sync-filesystem-watcher`
- Rename de extensión `.disabled` u otros mecanismos de disable
- FileSystemWatcher / live sync completo (el refresh puede ser la respuesta del propio toggle)
- Rediseño visual amplio del dashboard (respetar layout actual: Skills 2/3, Rules 1/3, header con logo/badge)
- Archivar este change sin confirmación explícita del usuario
- Sobrescribir rules/skills de convención del repo SkillDex

## Instrucciones adicionales del usuario

1. Implementar el **siguiente change** tras el dashboard de solo lectura: `toggle-enabled-frontmatter`.
2. Llevarlo **de principio a fin** (todas las tasks + verificación).
3. Partir del dashboard y del catálogo ya existentes; añadir mutación mínima, no rehacer la UI.

## Archivos y referencias

- `openspec/changes/toggle-enabled-frontmatter/proposal.md`
- `openspec/changes/toggle-enabled-frontmatter/design.md`
- `openspec/changes/toggle-enabled-frontmatter/specs/toggle-enabled/spec.md`
- `openspec/changes/toggle-enabled-frontmatter/specs/host-webview-contract/spec.md`
- `openspec/changes/toggle-enabled-frontmatter/specs/dashboard-ui/spec.md`
- `openspec/changes/toggle-enabled-frontmatter/tasks.md`
- `openspec/specs/dashboard-ui/spec.md` — dashboard actual en main specs
- `openspec/specs/host-webview-contract/spec.md` — contrato a extender
- `openspec/specs/rules-skills-discovery/spec.md` — mapping `enabled` en lectura
- `openspec/changes/archive/2026-10-22-dashboard-readonly-cards/` — change anterior
- `.cursor/chat/08-dashboard-readonly-cards.md` — resumen de la fase dashboard
- Código base: `src/extension/map-frontmatter.ts`, `src/extension/host-message-adapter.ts`, `src/shared/messages.ts`, `src/webview/skill-card.tsx`, `src/webview/rule-card.tsx`, `src/webview/enabled-led.tsx`, `src/webview/use-catalog.ts`
- Flujo: skill/comando `openspec-apply-change` / `/opsx-apply`

## Criterios de aceptación

- [ ] Todos los ítems de `openspec/changes/toggle-enabled-frontmatter/tasks.md` están `[x]` con evidencia de verificación
- [ ] Toggle en Skill escribe `enabled: false` / `enabled: true` en `SKILL.md` y la card refleja el estado
- [ ] Toggle en Rule igual; el body Markdown se preserva
- [ ] Fallo de escritura → error visible y sin estado “falso guardado”
- [ ] Contrato compartido incluye request/result tipados + type guards; sin `any`
- [ ] Unit (`npm run test:unit`) e integration (`npm run test:integration`) en verde para el slice
- [ ] Host y Webview compilan (`npm run typecheck` / `build`) bajo strict; `npm test` / lint en verde
- [ ] No se ha implementado open/create/live-sync
- [ ] No se han pisado rules/skills de convención del repo como fixtures permanentes
- [ ] `openspec instructions apply --change toggle-enabled-frontmatter` refleja tasks completadas (o equivalente)

## Instrucciones de trabajo

1. Lee íntegros proposal, design, specs y tasks del change `toggle-enabled-frontmatter`, y el código actual de cards, `map-frontmatter`, adapter Host y mensajes compartidos.
2. Usa `/opsx-apply` / skill `openspec-apply-change` si está disponible; si no, sigue `tasks.md` en orden.
3. Implementa persistencia Host + mensajes + UI toggle; cablea al catálogo local.
4. Escribe unit + integration tests con workspace temporal.
5. Verifica en Extension Development Host solo con ficheros seguros o confirma vía tests de integración.
6. Marca cada task `[x]` solo tras comprobarla.
7. Resume al usuario qué quedó, cómo verificar el toggle, y confirma que **no** tocaste open/create/live-sync.
8. Detente. No archives ni empieces el siguiente change sin confirmación del usuario.

Reglas de ejecución:

- No inventes requisitos ni rutas; si falta un dato crítico, pregunta antes de continuar.
- Respeta in-scope / out-of-scope.
- Código y nombres de símbolos en inglés; comunicación con el usuario en español.
- No uses `any` ni bypass de linter salvo petición explícita.
- Extiende el contrato de forma aditiva; no rompas handshake ni catálogo.
- Prefiere componentes/servicios pequeños y testeables.

## Primera acción requerida

Lee `openspec/changes/toggle-enabled-frontmatter/tasks.md` y `design.md`, inspecciona `map-frontmatter.ts`, `host-message-adapter.ts` y las cards actuales, y comienza la task 1.1 (servicio Host de persistencia `enabled`) sin implementar ningún otro change.
