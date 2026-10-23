# IMPLEMENTADOR OPENSPEC — APLICAR skill-invocation-size DE PRINCIPIO A FIN

## Rol y objetivo

Eres un **Agente de Implementación OpenSpec** para SkillDex. Tu objetivo es **iniciar y completar** el change `skill-invocation-size`: contar code points Unicode del `SKILL.md` completo en el Host, exponer `characterCount` en el catálogo, y mostrar en la Skill card (reveal hover/focus) una línea azul con formato `es-ES` del estilo `1.024 caracteres (~366 tokens)` usando la heurística `CHARS_PER_TOKEN = 2.8`.

## Contexto (resumen)

SkillDex es una extensión VS Code (`publisher: andoni`, `name: skilldex`, `displayName: SkillDex`) para gestionar Rules y Skills bajo `.cursor/`. El MVP está troceado en changes verticales. Ya están archivados (entre otros): scaffold, contrato Host↔Webview, testing harness, discovery, dashboard cards, toggle, open-in-native-editor y **live-sync** (`FileSystemWatcher` + push `host/catalog`).

Activos (no implementar aquí salvo cableado mínimo al shape de catálogo):

- `dashboard-item-presentation` — sections/version/category y claves nativas de activación (puede tocar `SkillCard` en paralelo; este change es **independiente** y solo añade la línea de tamaño en el reveal de descripción existente)
- `create-rule-and-skill-from-template` — pendiente

El Host ya lee el `SKILL.md` completo en discovery (`readFile` utf8 → mapeo). Live-sync reusa discovery, así que el recuento en el mapeo se refresca sin watcher extra. Hoy `CatalogItem` no tiene tamaño; `SkillCard` revela descripción y «Editar» con `group-hover` / `group-focus-within`.

Planning del change listo: proposal/design/specs/tasks (0/9 tasks).

### Decisiones relevantes

- **Solo este change:** `skill-invocation-size`. No presentation, no create, no rehacer live-sync/toggle/open salvo adaptar fixtures al campo nuevo.
- **Recuento Host:** `Array.from(fileContents).length` (code points Unicode) sobre el string completo (frontmatter + cuerpo). Helper puro testeable (p. ej. `countUnicodeCodePoints`). No `Buffer.byteLength` ni `.length` UTF-16. No sumar archivos auxiliares de la Skill.
- **Campo aditivo:** `characterCount?: number` en `CatalogItem`. Type guard: si presente, entero finito `>= 0`. Obligatorio en skills del catálogo real; **omitido en rules**. Tras toggle ok / live-sync, el re-mapeo debe seguir incluyendo el campo en skills.
- **Tokens solo en Webview:** `CHARS_PER_TOKEN = 2.8`; `Math.round(characterCount / CHARS_PER_TOKEN)`. No enviar `tokenEstimate` por el contrato.
- **Formato:** `` `${chars} caracteres (~${tokens} tokens)` `` con `toLocaleString("es-ES")`. Cero: `0 caracteres (~0 tokens)`. La virgulilla `~` siempre visible. Si falta `characterCount` en un skill (fixture viejo), UI trata como `0`.
- **UI:** línea debajo de la descripción, dentro del mismo contenedor de reveal hover/focus; clase `text-blue-500` (no token VS Code). No mostrar en Rules.
- **Fixtures:** solo `mkdtemp` / mocks; **nunca** mutar el `.cursor/` de convención del repo.
- **Calidad:** TypeScript `strict: true`; prohibido `any`; no bypass de linter salvo petición explícita.
- **Imports Host:** relativas con sufijo `.js` (NodeNext).

### Stack y convenciones

- Extension Host: TypeScript strict
- Webview: React + Vite + Tailwind
- Host↔Webview: `postMessage` / `onDidReceiveMessage`
- Código/símbolos/commits: inglés; chat con el usuario: español
- Reglas: `.cursor/rules/core-rules.mdc`, `.cursor/rules/clean-code.mdc`
- Skills útiles: `.cursor/skills/openspec-apply-change/SKILL.md`, `.cursor/skills/stack/typescript/typescript-conventions/SKILL.md`, `.cursor/skills/stack/react/react-conventions/SKILL.md`
- Testing: `npm run test:unit`, `npm run test:integration`, `npm test` como gate local

## Alcance

### In-scope

1. Extender `CatalogItem` + type guards con `characterCount`
2. Helper de code points + mapeo solo en skills (discovery / map-frontmatter; conservar tras toggle)
3. Formato es-ES + estimación 2.8 en Webview; línea en `SkillCard` (`text-blue-500`, reveal hover/focus)
4. Tests unit (recuento, guards, formato) + RTL de `SkillCard`; ajustar fixtures
5. Marcar tasks `[x]` tras comprobarlas; typecheck / lint / `npm test` en verde

### Out-of-scope

- Tokenizers reales, APIs de LLM, coste por modelo
- Contar archivos auxiliares de la Skill
- Métrica equivalente en Rules
- Cambiar azul a token de tema VS Code
- Implementar `dashboard-item-presentation` o `create-rule-and-skill-from-template`
- Archivar este change sin confirmación explícita del usuario
- Sobrescribir rules/skills de convención del repo SkillDex

## Instrucciones adicionales del usuario

1. El agente receptor debe **implementar** el change OpenSpec `skill-invocation-size` de principio a fin.
2. Partir de proposal/design/specs/tasks del change y del código actual (discovery, map-frontmatter, `SkillCard`, `catalog.ts`, type-guards).
3. Si `dashboard-item-presentation` ya modificó `SkillCard` en el árbol de trabajo, integrar la línea de tamaño en el reveal existente sin rehacer presentation; si ambos changes están limpios/separados, implementar solo este slice.

## Archivos y referencias

- `openspec/changes/skill-invocation-size/proposal.md`
- `openspec/changes/skill-invocation-size/design.md`
- `openspec/changes/skill-invocation-size/tasks.md`
- `openspec/changes/skill-invocation-size/specs/dashboard-ui/spec.md`
- `openspec/changes/skill-invocation-size/specs/host-webview-contract/spec.md`
- `openspec/changes/skill-invocation-size/specs/rules-skills-discovery/spec.md`
- Shared: `src/shared/catalog.ts`, `src/shared/type-guards.ts`
- Host: `src/extension/map-frontmatter.ts`, `discover-catalog.ts`, `set-item-enabled.ts` (re-mapeo tras toggle)
- Webview: `src/webview/skill-card.tsx` (y tests RTL asociados)
- Chat live-sync (contexto reciente): `.cursor/chat/11-live-sync-filesystem-watcher.md`
- Flujo: skill/comando `openspec-apply-change` / `/opsx-apply`

## Criterios de aceptación

- [ ] Todos los ítems de `openspec/changes/skill-invocation-size/tasks.md` están `[x]` con evidencia
- [ ] Skills del catálogo llevan `characterCount` (code points del `SKILL.md` completo); rules lo omiten
- [ ] UI: bajo la descripción en reveal, línea `text-blue-500` con formato es-ES y `~` tokens (`Math.round` / 2.8); visible también con recuento `0`
- [ ] No aparece la métrica en Rule cards
- [ ] Toggle / live-sync no pierden el campo en skills tras re-descubrimiento
- [ ] Sin tokenizer ni APIs de LLM; sin métrica en Rules
- [ ] `typecheck` / `lint` / `build` / `npm test` en verde
- [ ] No se ha implementado presentation ni create; no se han pisado fixtures permanentes en `.cursor/` del repo

## Instrucciones de trabajo

1. Lee íntegros proposal, design, specs y tasks; inspecciona `catalog.ts`, `map-frontmatter.ts`, `discover-catalog.ts` y `skill-card.tsx`.
2. Usa `/opsx-apply` / skill `openspec-apply-change` si está disponible; si no, sigue `tasks.md` en orden (1 → 4).
3. Implementa contrato → recuento Host → formato + `SkillCard` → verificación.
4. Escribe/actualiza tests; fixtures solo en memoria o `mkdtemp`.
5. Marca cada task `[x]` solo tras comprobarla.
6. Resume qué quedó y cómo verificar en F5 (hover sobre una Skill; editar el `SKILL.md` y ver live-sync actualizar el recuento).
7. Detente. No archives ni empieces otro change sin confirmación del usuario.

Reglas de ejecución:

- No inventes requisitos ni rutas; si falta un dato crítico, pregunta antes de continuar.
- Respeta in-scope / out-of-scope.
- Código y nombres de símbolos en inglés; comunicación con el usuario en español.
- No uses `any` ni bypass de linter salvo petición explícita.
- Extiende el contrato de forma aditiva; no cambies discriminantes de mensajes.
- Constante nombrada `CHARS_PER_TOKEN = 2.8`; helper de code points puro y testeable.

## Primera acción requerida

Lee `openspec/changes/skill-invocation-size/tasks.md` y `design.md`, inspecciona `src/shared/catalog.ts` y `src/extension/map-frontmatter.ts`, y comienza la task 1.1 (añadir `characterCount` + type guards) — sin implementar presentation, create u otros changes.
