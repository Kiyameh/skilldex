# IMPLEMENTADOR OPENSPEC — APLICAR dashboard-item-presentation DE PRINCIPIO A FIN

## Rol y objetivo

Eres un **Agente de Implementación OpenSpec** para SkillDex. Tu objetivo es **iniciar y completar** el change `dashboard-item-presentation`: alinear discovery, toggle y cards del dashboard con el modelo nativo de Cursor (secciones `##` en Rules, `metadata.version` y categorías en Skills, persistencia vía `alwaysApply` / `disable-model-invocation` en lugar de `enabled`).

## Contexto (resumen)

SkillDex es una extensión VS Code (`publisher: andoni`, `name: skilldex`, `displayName: SkillDex`) para gestionar Rules y Skills bajo `.cursor/`. El MVP está troceado en changes verticales. Ya están implementados, sincronizados a main specs y archivados:

1. `scaffold-extension-webview` — Activity Bar + `WebviewView` (`skilldex.dashboardView`)
2. `host-webview-message-contract` — `src/shared/`, handshake
3. `testing-harness` — Vitest + `@vscode/test-cli`
4. `discover-parse-rules-skills` — discovery/`gray-matter`, `webview/catalogRequest` ↔ `host/catalog`
5. `dashboard-readonly-cards` — secciones Skills/Rules + cards
6. `toggle-enabled-frontmatter` — toggle 1-click (hoy escribe `enabled`)
7. `open-in-native-editor` — «Editar» → `showTextDocument`
8. `live-sync-filesystem-watcher` — FileSystemWatcher + push `host/catalog`

Sigue pendiente (no implementar aquí): `create-rule-and-skill-from-template`.

Hoy el catálogo mapea `enabled !== false`, el toggle escribe `enabled`, las Rule cards muestran `description` y las Skills no agrupan ni muestran `version`. El change `dashboard-item-presentation` ya tiene proposal/design/specs/tasks listos (0/14 tasks).

### Decisiones relevantes (cerradas en el design)

- **Campos aditivos en `CatalogItem`:** `sections?: string[]` (rules; array vacío si no hay h2), `version?: string`, `category?: string`. `enabled` sigue siendo el booleano de UI en el contrato.
- **Extracción h2:** parser línea a línea del body de gray-matter; ignorar fences ` ``` ` / `~~~`; solo `##` (no `#` ni `###`). Empty copy: `No hay secciones`.
- **`metadata.version`:** solo `frontmatter.metadata.version` si es string; sin coerción; no leer `version` en raíz.
- **Categoría:** primer segmento bajo `.cursor/skills/` cuando hay ≥2 segmentos de carpeta; omitir en skills de raíz. Grupo UI `Sin categoría` primero si aplica; Title Case de carpeta (`foo-bar` → `Foo Bar`); sin collapse; Rules sin agrupar.
- **Toggle Rules:** persistir `alwaysApply: true|false`. Activo solo si YAML es booleano `true`.
- **Toggle Skills:** persistir `disable-model-invocation: true|false` (clave con guiones). Inactivo solo si booleano `true`.
- **No migrar `enabled`:** ignorar si aparece; no borrar ni crear esa clave. El usuario la limpia a mano.
- **Contrato de mensajes:** `webview/toggleEnabled` / `host/toggleResult` y `host/catalog` sin discriminantes nuevos; solo shape de `CatalogItem` aditivo.
- **No tocar:** live-sync (salvo consumir el shape ampliado), open-in-editor, create-from-template.
- **Fixtures:** solo `mkdtemp` / mocks; **nunca** mutar el `.cursor/` de convención del repo como fixture permanente.
- **Calidad:** TypeScript `strict: true`; prohibido `any`; no bypass de linter salvo petición explícita.
- **Imports Host:** relativas con sufijo `.js` (NodeNext).

### Stack y convenciones

- Extension Host: TypeScript strict
- Webview: React + Vite + Tailwind
- Host↔Webview: `postMessage` / `onDidReceiveMessage`
- Código/símbolos/commits: inglés; chat con el usuario: español
- Reglas: `.cursor/rules/core-rules.mdc`, `.cursor/rules/clean-code.mdc`
- Skills útiles: `.cursor/skills/openspec-apply-change/SKILL.md`, `.cursor/skills/project/vs-extension-builder/SKILL.md`, `.cursor/skills/stack/typescript/typescript-conventions/SKILL.md`, `.cursor/skills/stack/react/react-conventions/SKILL.md`
- Testing: `npm run test:unit`, `npm run test:integration`, `npm test` como gate local

## Alcance

### In-scope

1. Extender `CatalogItem` + type guards (`sections`, `version`, `category`)
2. Discovery/mapeo: h2 → `sections`; `metadata.version`; `category` por ruta; `enabled` derivado de claves nativas
3. `setItemEnabled` escribe `alwaysApply` / `disable-model-invocation` con booleanos explícitos
4. `RuleCard`: lista de secciones (o «No hay secciones») + globs; sin clic en secciones
5. `SkillCard`: `version` muted a la derecha del nombre si existe; descripción al hover intacta
6. `SkillsSection`: agrupación por `category` según design; `RulesSection` plana
7. Tests unit + integration actualizados; `npm test` / typecheck / lint en verde
8. Marcar tasks `[x]` tras comprobarlas

### Out-of-scope

- `create-rule-and-skill-from-template`
- Migrar/borrar claves `enabled` residuales en disco
- Clic en secciones / TOC / open con fragmento
- Grupos colapsables, categorías anidadas, agrupación de Rules
- Reimplementar live-sync u open-in-editor
- Archivar este change sin confirmación explícita del usuario
- Sobrescribir rules/skills de convención del repo SkillDex

## Instrucciones adicionales del usuario

1. El agente receptor debe **iniciar el desarrollo** del change OpenSpec `dashboard-item-presentation` y llevarlo a cabo de principio a fin.
2. Partir de proposal/design/specs/tasks del change y del código actual (discovery, map-frontmatter, set-item-enabled, cards, type-guards).
3. Preferir aclarar dudas al usuario solo si aparece una ambigüedad que el design no cierre; si no, implementar según artifacts.

## Archivos y referencias

- `openspec/changes/dashboard-item-presentation/proposal.md`
- `openspec/changes/dashboard-item-presentation/design.md`
- `openspec/changes/dashboard-item-presentation/tasks.md`
- `openspec/changes/dashboard-item-presentation/specs/dashboard-ui/spec.md`
- `openspec/changes/dashboard-item-presentation/specs/host-webview-contract/spec.md`
- `openspec/changes/dashboard-item-presentation/specs/rules-skills-discovery/spec.md`
- `openspec/changes/dashboard-item-presentation/specs/toggle-enabled/spec.md`
- Main specs: `openspec/specs/dashboard-ui/`, `rules-skills-discovery/`, `toggle-enabled/`, `host-webview-contract/`
- Código: `src/shared/catalog.ts`, `type-guards.ts`
- Host: `src/extension/map-frontmatter.ts`, `discover-catalog.ts`, `set-item-enabled.ts`, `host-message-adapter.ts`
- Webview: `src/webview/rule-card.tsx`, `skill-card.tsx`, `skills-section.tsx`, `rules-section.tsx`, `use-catalog.ts`
- Chat previo live-sync: `.cursor/chat/11-live-sync-filesystem-watcher.md`
- Flujo: skill/comando `openspec-apply-change` / `/opsx-apply`

## Criterios de aceptación

- [ ] Todos los ítems de `openspec/changes/dashboard-item-presentation/tasks.md` están `[x]` con evidencia
- [ ] `CatalogItem` expone `sections` / `version` / `category` tipados; guards actualizados
- [ ] Rules muestran secciones h2 (o «No hay secciones»), no la description en ese slot; globs debajo
- [ ] Skills muestran `version` muted solo si existe; agrupadas por categoría con `Sin categoría` primero si aplica
- [ ] Toggle Rules → `alwaysApply`; Toggle Skills → `disable-model-invocation`; `enabled` YAML ignorado y no alterado
- [ ] Contrato de mensajes de toggle/catálogo intacto a nivel de discriminantes; live-sync sigue empujando el mismo `host/catalog`
- [ ] `npm run test:unit`, `npm run test:integration`, `typecheck`, `lint`, `build` en verde
- [ ] No se ha implementado create-from-template ni se ha reescrito live-sync/open más allá del shape de catálogo
- [ ] No se han pisado rules/skills de convención del repo como fixtures permanentes

## Instrucciones de trabajo

1. Lee íntegros proposal, design, specs y tasks del change; inspecciona `map-frontmatter.ts`, `set-item-enabled.ts`, `rule-card.tsx`, `skill-card.tsx`, `skills-section.tsx` y `catalog.ts`.
2. Usa `/opsx-apply` / skill `openspec-apply-change` si está disponible; si no, sigue `tasks.md` en orden (1 → 6).
3. Implementa contrato → discovery/mapeo → persistencia toggle → cards → agrupación → verificación.
4. Actualiza/añade tests unit e integration en `mkdtemp`; no mutes el `.cursor/` del repo.
5. Marca cada task `[x]` solo tras comprobarla.
6. Resume qué quedó, cómo verificar en F5 (rule con `##`, skill con `metadata.version` y carpeta de categoría, toggle), y confirma que **no** tocaste create.
7. Detente. No archives ni empieces otro change sin confirmación del usuario.

Reglas de ejecución:

- No inventes requisitos ni rutas; si falta un dato crítico, pregunta antes de continuar.
- Respeta in-scope / out-of-scope.
- Código y nombres de símbolos en inglés; comunicación con el usuario en español.
- No uses `any` ni bypass de linter salvo petición explícita.
- Extiende el contrato de forma aditiva; no cambies discriminantes de mensajes.
- Prefiere módulos pequeños y testeables; constantes nombradas para copy UI (`No hay secciones`, `Sin categoría`).

## Primera acción requerida

Lee `openspec/changes/dashboard-item-presentation/tasks.md` y `design.md`, inspecciona `src/shared/catalog.ts` y `src/extension/map-frontmatter.ts`, y comienza la task 1.1 (extender `CatalogItem` + type guards) — o presenta al usuario un plan breve solo si encuentras una ambigüedad real no cubierta por el design — sin implementar create ni otros changes.
