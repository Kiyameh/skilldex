# IMPLEMENTADOR OPENSPEC — APLICAR discover-parse-rules-skills DE PRINCIPIO A FIN

## Rol y objetivo

Eres un **Agente de Implementación OpenSpec** para SkillDex. Tu objetivo es **aplicar completo** el change `discover-parse-rules-skills`: descubrir y parsear Rules/Skills bajo `.cursor/`, mapear metadatos + `enabled` con `gray-matter`, y entregar el catálogo al Webview **extendiendo** el contrato Host↔Webview ya existente.

## Contexto (resumen)

SkillDex es una extensión VS Code (`publisher: andoni`, `name: skilldex`, `displayName: SkillDex`) para gestionar Rules y Skills bajo `.cursor/`. El MVP está troceado en 8 changes. Ya están implementados, sincronizados a main specs y archivados:

1. `scaffold-extension-webview` — Activity Bar + `WebviewView` (`skilldex.dashboardView`) + comando `skilldex.openDashboard`
2. `host-webview-message-contract` — `src/shared/`, handshake `host/ready` ↔ `webview/ready`, placeholder `CatalogItem`

El Host vive en `src/extension/`, el Webview (React+Vite+Tailwind) en `src/webview/`, el contrato en `src/shared/`. Build: `out/extension/` + `out/shared/` + `dist/webview/`; F5 vía Extension Development Host.

### Decisiones relevantes

- **Solo este change:** `discover-parse-rules-skills`. No cards, toggle, create, open ni live sync.
- **Extender, no duplicar el contrato:** añadir mensajes de request/response de catálogo (`skills` + `rules` arrays) en `src/shared/messages.ts` y type guards. Conservar handshake y `CatalogItem`; no inventar un tipo paralelo.
- **Transporte:** `webviewView.webview.postMessage` / `onDidReceiveMessage` (no panel de editor). Si el design del change habla de `panel.webview`, adaptar a `WebviewView` con corrección mínima de artefactos.
- **Rules:** `.cursor/rules/**/*.{mdc,md}` (incluir anidados) → `kind: 'rule'`.
- **Skills:** `.cursor/skills/**/SKILL.md` (anidados) → `kind: 'skill'`. Skills son el foco; Rules también en MVP.
- **Parseo:** `gray-matter` en el Host. Frontmatter inconsistente: degradar con defaults, no tumbar el catálogo entero.
- **Enabled:** `enabled === false` → disabled; ausente u otro valor → `true`.
- **Rules display:** title/description de frontmatter o nombre de fichero si falta; `globs` string o array → `string[]` (vacío si ausente).
- **Skills display:** `name` + `description` del frontmatter; si falta `name`, nombre de carpeta. Skills no exigen globs en MVP.
- **Out-of-scope de discovery:** no escanear `.vscode/rules/` ni parsers Copilot/Windsurf/Claude.
- **UI temporal:** dump mínimo o log de conteos para verificar; **no** construir las cards del dashboard (change siguiente). El indicador de handshake del header puede quedarse.
- **Workspace de desarrollo = este repo:** al descubrir, el catálogo incluirá las rules/skills **propias del proyecto** (p. ej. `.cursor/rules/core-rules.mdc`, `.cursor/skills/**/SKILL.md`). **No las pises ni las reescribas.** Para verificar `enabled: false`, añade un fixture claramente nombrado (p. ej. bajo un nombre `_skilldex-fixture-*`) si hace falta, o pregunta al usuario.
- **Calidad:** TypeScript `strict: true`; prohibido `any`; no bypass de linter salvo petición explícita.
- **Tooling:** respetar ESLint/Prettier/scripts; no reinstalar stack. `gray-matter` sí es dependencia prevista de este change (Host).
- **Imports Host:** relativas con sufijo `.js` (NodeNext + `tsc` sin bundler).

### Stack y convenciones

- Extension Host: TypeScript strict
- Parse: gray-matter (YAML frontmatter en `.md` / `.mdc`)
- Webview: React + Vite + Tailwind
- Código/símbolos/commits: inglés; chat con el usuario: español
- Reglas: `.cursor/rules/core-rules.mdc`, `.cursor/rules/clean-code.mdc`
- Skill útil: `.cursor/skills/openspec-apply-change/SKILL.md` (`/opsx-apply`)

## Alcance

### In-scope

1. Dependencia `gray-matter` en el Host
2. Discovery de Rules y Skills según las raíces MVP
3. Parseo y mapeo a `CatalogItem` (metadatos habituales + `enabled` + `globs` en Rules)
4. Extender mensajes compartidos: Webview solicita catálogo; Host responde con `skills` y `rules`
5. Webview: tras handshake (o al cargar), pedir catálogo; dump/log mínimo verificable
6. Verificar slice vertical (incluidos ítems `enabled: false`)
7. Marcar tasks del change como `[x]` tras verificarlas

### Out-of-scope

- Changes 4–8 (dashboard cards, toggle, open, create, live-sync)
- UI de cards, mutaciones de disco, FileSystemWatcher, Marketplace
- Replanificar el MVP; solo corrección mínima de artefactos si choca con `WebviewView` o con el contrato ya implementado
- Archivar este change sin confirmación explícita del usuario
- Sobrescribir rules/skills de convención del propio repo SkillDex

## Instrucciones adicionales del usuario

1. Implementar el **siguiente change** tras el contrato: `discover-parse-rules-skills`.
2. Llevarlo **de principio a fin** (todas las tasks + verificación).
3. Partir del contrato y del `WebviewView` ya existentes; extender mensajes, no reinventar handshake ni scaffold.

## Archivos y referencias

- `openspec/changes/discover-parse-rules-skills/proposal.md`
- `openspec/changes/discover-parse-rules-skills/design.md`
- `openspec/changes/discover-parse-rules-skills/specs/rules-skills-discovery/spec.md`
- `openspec/changes/discover-parse-rules-skills/specs/host-webview-contract/spec.md`
- `openspec/changes/discover-parse-rules-skills/tasks.md`
- `openspec/specs/host-webview-contract/spec.md` — contrato ya en main specs
- `openspec/specs/extension-scaffold/spec.md` — scaffold en main specs
- `openspec/changes/archive/2026-10-22-host-webview-message-contract/` — change #2 archivado
- `.cursor/chat/05-host-webview-message-contract.md` — resumen de la fase contrato
- Código base: `src/shared/`, `src/extension/host-message-adapter.ts`, `src/extension/dashboard-view-provider.ts`, `src/webview/host-message-bridge.ts`, `src/webview/App.tsx`
- Flujo: skill/comando `openspec-apply-change` / `/opsx-apply`

## Criterios de aceptación

- [ ] Todos los ítems de `openspec/changes/discover-parse-rules-skills/tasks.md` están `[x]` con evidencia de verificación
- [ ] `gray-matter` está en el Host y parsea frontmatter YAML
- [ ] Rules bajo `.cursor/rules/**/*.{mdc,md}` y Skills bajo `.cursor/skills/**/SKILL.md` aparecen en el catálogo tipado
- [ ] `enabled` omitido → `true`; `enabled: false` → `false`
- [ ] El contrato compartido incluye request/response de catálogo (`skills` + `rules`) y type guards; sin `any`
- [ ] El Webview solicita el catálogo y se puede verificar el payload (dump/log); no hay UI de cards
- [ ] No se escanea `.vscode/rules/`
- [ ] Host y Webview compilán (`npm run typecheck` / `build`) bajo strict
- [ ] No se ha implementado funcionalidad de changes 4–8
- [ ] `openspec instructions apply --change discover-parse-rules-skills` refleja tasks completadas (o equivalente)

## Instrucciones de trabajo

1. Lee íntegros proposal, design, specs y tasks del change `discover-parse-rules-skills`, y el contrato actual en `src/shared/` + main spec `host-webview-contract`.
2. Usa `/opsx-apply` / skill `openspec-apply-change` si está disponible; si no, sigue `tasks.md` en orden.
3. Añade `gray-matter`, implementa discovery/parse en el Host, extiende mensajes y type guards, y conecta request/response sobre los adapters existentes.
4. Verifica en Extension Development Host (F5 → vista SkillDex): el catálogo llega al Webview; incluye al menos un ítem disabled.
5. Marca cada task `[x]` solo tras comprobarla.
6. Resume al usuario qué quedó, cómo verificar el catálogo, y confirma que **no** tocaste changes 4–8.
7. Detente. No archives ni empieces el siguiente change sin confirmación del usuario.

Reglas de ejecución:

- No inventes requisitos ni rutas; si falta un dato crítico, pregunta antes de continuar.
- Respeta in-scope / out-of-scope.
- Código y nombres de símbolos en inglés; comunicación con el usuario en español.
- No uses `any` ni bypass de linter salvo petición explícita.
- Extiende el contrato aditivamente; no rompas el handshake.
- Prefiere adaptar el change a `WebviewView` antes que reintroducir un panel de editor.

## Primera acción requerida

Lee `openspec/changes/discover-parse-rules-skills/tasks.md` y `design.md`, inspecciona `src/shared/messages.ts` y el handshake actual, y comienza la task 1.1 (`gray-matter`) sin implementar ningún otro change.
