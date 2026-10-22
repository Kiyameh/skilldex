# IMPLEMENTADOR OPENSPEC — APLICAR dashboard-readonly-cards DE PRINCIPIO A FIN

## Rol y objetivo

Eres un **Agente de Implementación OpenSpec** para SkillDex. Tu objetivo es **aplicar completo** el change `dashboard-readonly-cards`: sustituir el dump temporal del catálogo por un dashboard de **solo lectura** con dos secciones diferenciadas (Skills primaria, Rules secundaria) y cards de metadatos habituales, alimentadas por el contrato Host↔Webview ya existente.

## Contexto (resumen)

SkillDex es una extensión VS Code (`publisher: andoni`, `name: skilldex`, `displayName: SkillDex`) para gestionar Rules y Skills bajo `.cursor/`. El MVP está troceado en changes verticales. Ya están implementados, sincronizados a main specs y archivados:

1. `scaffold-extension-webview` — Activity Bar + `WebviewView` (`skilldex.dashboardView`) + comando `skilldex.openDashboard`
2. `host-webview-message-contract` — `src/shared/`, handshake `host/ready` ↔ `webview/ready`, `CatalogItem`
3. `testing-harness` — pirámide local Vitest + `@vscode/test-cli`
4. `discover-parse-rules-skills` — discovery/parse con `gray-matter`, mensajes `webview/catalogRequest` ↔ `host/catalog`, dump temporal en el Webview

El Host vive en `src/extension/`, el Webview (React+Vite+Tailwind) en `src/webview/`, el contrato en `src/shared/`. Build: `out/extension/` + `out/shared/` + `dist/webview/`; F5 vía Extension Development Host.

### Decisiones relevantes

- **Solo este change:** `dashboard-readonly-cards`. No toggle, create, open ni live sync funcionales.
- **Consumir, no reinventar el catálogo:** el Webview ya pide catálogo tras handshake (`useCatalog` / `webview/catalogRequest` → `host/catalog`). Sustituir el dump JSON/conteos por secciones + cards; no cambiar el contrato salvo necesidad mínima (preferible no tocarlo).
- **Skills primero:** sección Skills visualmente primaria y antes que Rules.
- **Cards Skills:** mostrar `name` (campo `title` del `CatalogItem` mapeado desde frontmatter `name` o carpeta), `description`, estado enabled/disabled.
- **Cards Rules:** título/descripción, `globs` (o indicación vacío), estado enabled/disabled.
- **Empty states:** cada sección muestra mensaje vacío si su lista está vacía; no blank void.
- **Enabled visual:** indicador claro (texto o switch disabled visual-only). Controles de mutación **no** deben funcionar en este change.
- **A11y:** headings de sección; cards como `<article>`; HTML semántico; contraste suficiente; queries RTL accesibles.
- **Estilo:** Tailwind; composición simple (evitar dashboard genérico sobrecargado). Skills primero.
- **Workspace de desarrollo = este repo:** F5 listará rules/skills reales. **No las pises ni las reescribas.**
- **Fixtures de test:** no usar el `.cursor/` del repo; RTL con props/estado mockeado; empty states con catálogo vacío en memoria.
- **Calidad:** TypeScript `strict: true`; prohibido `any`; no bypass de linter salvo petición explícita.
- **Imports Host:** si tocas Host (idealmente no hace falta), relativas con sufijo `.js` (NodeNext).

### Stack y convenciones

- Extension Host: TypeScript strict
- Webview: React + Vite + Tailwind
- Código/símbolos/commits: inglés; chat con el usuario: español
- Reglas: `.cursor/rules/core-rules.mdc`, `.cursor/rules/clean-code.mdc`
- Skills útiles: `.cursor/skills/openspec-apply-change/SKILL.md`, `.cursor/skills/stack/react/react-conventions/SKILL.md`
- Testing: `npm run test:unit` (RTL), `npm test` como gate local

## Alcance

### In-scope

1. `SkillsSection` y `RulesSection` con headings claros; Skills renderizada primero
2. Empty states por sección
3. `SkillCard` y `RuleCard` con metadatos habituales + estado enabled
4. Cablear al estado de catálogo existente; **eliminar** el dump JSON/conteos temporales
5. Estilo Tailwind + HTML semántico / a11y
6. Verificación vertical (F5 con catálogo real + empty states en tests)
7. RTL tests de secciones, cards y empty states; marcar tasks `[x]` tras verificar

### Out-of-scope

- Changes posteriores: `toggle-enabled-frontmatter`, `open-in-native-editor`, `create-rule-and-skill-from-template`, `live-sync-filesystem-watcher`
- Controles de mutación funcionales (toggle/create/open)
- Rediseño visual final / motion heavy
- Metadatos avanzados de Skills
- Reescritura del contrato o del discovery Host (salvo bug bloqueante mínimo)
- Archivar este change sin confirmación explícita del usuario
- Sobrescribir rules/skills de convención del repo SkillDex

## Instrucciones adicionales del usuario

1. Implementar el **siguiente change** tras discovery: `dashboard-readonly-cards`.
2. Llevarlo **de principio a fin** (todas las tasks + verificación).
3. Partir del catálogo y del handshake ya existentes; reemplazar la UI temporal, no reinventar el transporte.

## Archivos y referencias

- `openspec/changes/dashboard-readonly-cards/proposal.md`
- `openspec/changes/dashboard-readonly-cards/design.md`
- `openspec/changes/dashboard-readonly-cards/specs/dashboard-ui/spec.md`
- `openspec/changes/dashboard-readonly-cards/tasks.md`
- `openspec/specs/rules-skills-discovery/spec.md` — discovery en main specs
- `openspec/specs/host-webview-contract/spec.md` — incluye request/response de catálogo
- `openspec/changes/archive/2026-10-22-discover-parse-rules-skills/` — change anterior archivado
- `.cursor/chat/07-discover-parse-rules-skills.md` — resumen de la fase discovery
- Código base: `src/webview/App.tsx`, `src/webview/use-catalog.ts`, `src/webview/use-host-handshake.ts`, `src/shared/catalog.ts`
- Flujo: skill/comando `openspec-apply-change` / `/opsx-apply`

## Criterios de aceptación

- [ ] Todos los ítems de `openspec/changes/dashboard-readonly-cards/tasks.md` están `[x]` con evidencia de verificación
- [ ] Existen secciones Skills (primera) y Rules claramente diferenciadas
- [ ] `SkillCard` muestra name, description y enabled; `RuleCard` muestra title/description, globs y enabled
- [ ] Empty states visibles cuando la lista correspondiente está vacía
- [ ] El dump JSON temporal / conteos de verificación del change discovery **ya no** son la UI principal
- [ ] No hay toggle/create/open funcionales
- [ ] RTL (`npm run test:unit`) cubre secciones, cards y empty states con queries accesibles
- [ ] Host y Webview compilan (`npm run typecheck` / `build`) bajo strict; `npm test` / lint en verde
- [ ] No se ha implementado funcionalidad de changes posteriores (toggle, open, create, live-sync)
- [ ] `openspec instructions apply --change dashboard-readonly-cards` refleja tasks completadas (o equivalente)

## Instrucciones de trabajo

1. Lee íntegros proposal, design, specs y tasks del change `dashboard-readonly-cards`, y el código actual de `App.tsx` / `use-catalog.ts` / `CatalogItem`.
2. Usa `/opsx-apply` / skill `openspec-apply-change` si está disponible; si no, sigue `tasks.md` en orden.
3. Extrae componentes de sección/card; cablea el catálogo existente; elimina el dump temporal.
4. Escribe RTL tests; verifica empty states y campos de card.
5. Verifica en Extension Development Host (F5 → vista SkillDex): dos secciones con cards reales del workspace.
6. Marca cada task `[x]` solo tras comprobarla.
7. Resume al usuario qué quedó, cómo verificar el dashboard, y confirma que **no** tocaste toggle/open/create/live-sync.
8. Detente. No archives ni empieces el siguiente change sin confirmación del usuario.

Reglas de ejecución:

- No inventes requisitos ni rutas; si falta un dato crítico, pregunta antes de continuar.
- Respeta in-scope / out-of-scope.
- Código y nombres de símbolos en inglés; comunicación con el usuario en español.
- No uses `any` ni bypass de linter salvo petición explícita.
- Reutiliza el request/response de catálogo; no rompas el handshake.
- Prefiere componentes pequeños y testeables junto a `src/webview/`.

## Primera acción requerida

Lee `openspec/changes/dashboard-readonly-cards/tasks.md` y `design.md`, inspecciona `src/webview/App.tsx` y `use-catalog.ts`, y comienza la task 1.1 (`SkillsSection` / `RulesSection`) sin implementar ningún otro change.
