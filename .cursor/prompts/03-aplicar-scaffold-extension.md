# IMPLEMENTADOR OPENSPEC — APLICAR scaffold-extension-webview DE PRINCIPIO A FIN

## Rol y objetivo

Eres un **Agente de Implementación OpenSpec** para SkillDex. Tu objetivo es **aplicar completo** el change `scaffold-extension-webview`: llevar todos los ítems de `tasks.md` a hecho, dejando una extensión VS Code arrancable con shell Webview React+Vite+Tailwind que muestre la marca SkillDex.

## Contexto (resumen)

SkillDex es una extensión VS Code (publisher `andoni`, name `skilldex`, displayName `SkillDex`) para gestionar Rules y Skills bajo `.cursor/`. El MVP ya está troceado en 8 changes OpenSpec (Spec-Driven Vertical Slices). **Este agente solo implementa el change #1** (scaffold). El resto queda para sesiones posteriores.

OpenSpec ya está instalado; los artefactos de planificación existen y están validados.

### Decisiones relevantes

- **Solo este change:** `scaffold-extension-webview`. No implementar contrato, discovery, dashboard, toggle, create, open ni live sync.
- **Stack Webview:** React + Vite + Tailwind CSS (no CSS Modules como default).
- **Host:** Node.js / TypeScript con `strict: true`; prohibido `any`.
- **Identidad:** publisher `andoni`, name `skilldex`, displayName `SkillDex`.
- **Metodología:** seguir `proposal.md` + `design.md` + `specs/` + `tasks.md` del change; no reinventar alcance.
- **Tooling de repo (lint/format):** puede existir o estar en paralelo otro agente (`03-configurar-tooling-proyecto.md`). No bloquees el scaffold esperando un tooling perfecto; si ya hay ESLint/Prettier/etc., intégrate sin romperlos. Si no hay, no instales un stack completo de tooling aquí (eso es otra misión).

### Stack y convenciones

- Extension Host: TypeScript strict
- Webview: React + Vite + Tailwind
- Código/símbolos/commits: inglés; chat con el usuario: español
- Reglas: `.cursor/rules/core-rules.mdc`, `.cursor/rules/clean-code.mdc`
- Skill útil: `.cursor/skills/project/vs-extension-builder/SKILL.md`

## Alcance

### In-scope

1. Manifest de extensión con identidad SkillDex y comando para abrir el panel
2. Entry Host (`activate`/`deactivate`) que abra Webview panel
3. App Webview React+Vite+Tailwind con shell vacío branded SkillDex
4. Pipeline de build Host + Webview usable en Extension Development Host
5. Marcar tareas del `tasks.md` del change como completadas al verificarlas
6. Verificar criterios del spec `extension-scaffold` en la práctica

### Out-of-scope

- Changes 2–8 (`host-webview-message-contract`, discovery, dashboard, toggle, open, create, live-sync)
- Editor WYSIWYG, parsers multiformato, Marketplace/CI remoto. Tests del scaffold: arnés `testing-harness` (integration de activate/comando).
- Replanificar o reescribir specs salvo corrección mínima imprescindible (y consulta al usuario si cambia comportamiento)
- Instalar/definir el tooling global del monorepo (lint/format/husky/etc.) como misión principal

## Instrucciones adicionales del usuario

1. Iniciar la implementación por el **primer spec/change**: `scaffold-extension-webview`.
2. Llevarlo **de principio a fin** (todas las tasks + verificación en Extension Development Host).
3. No avanzar al siguiente change OpenSpec en la misma misión salvo que el usuario lo pida explícitamente.

## Archivos y referencias

- `openspec/changes/scaffold-extension-webview/proposal.md` — por qué / qué
- `openspec/changes/scaffold-extension-webview/design.md` — decisiones de diseño
- `openspec/changes/scaffold-extension-webview/specs/extension-scaffold/spec.md` — requisitos WHEN/THEN
- `openspec/changes/scaffold-extension-webview/tasks.md` — checklist ejecutable
- `openspec/config.yaml` — contexto de proyecto
- `.cursor/chat/02-plan-openspec-mvp-changes.md` — resumen de la planificación
- `.cursor/prompts/03-configurar-tooling-proyecto.md` — misión hermana de tooling (no mezclar)
- `.cursor/skills/project/vs-extension-builder/SKILL.md` — guía extensión VS Code
- Flujo OpenSpec apply: skill/comando `openspec-apply-change` / `/opsx-apply` si está disponible

## Criterios de aceptación

- [ ] Todos los ítems de `openspec/changes/scaffold-extension-webview/tasks.md` están marcados `[x]` con evidencia de verificación
- [ ] `package.json` declara `publisher: andoni`, `name: skilldex`, `displayName: SkillDex`
- [ ] Existe comando que abre un Webview panel SkillDex
- [ ] La Webview se construye con React + Vite + Tailwind y muestra shell branded SkillDex
- [ ] Extension Host compila con TypeScript `strict: true` sin `any`
- [ ] Se puede lanzar Extension Development Host, abrir el panel y ver el shell sin errores bloqueantes
- [ ] No se ha implementado funcionalidad de changes 2–8
- [ ] `openspec status --change scaffold-extension-webview` refleja tasks completadas (o equivalente tras apply)

## Instrucciones de trabajo

1. Lee íntegros los artefactos del change `scaffold-extension-webview` (proposal, design, specs, tasks) y `openspec/config.yaml`.
2. Si existe workflow `/opsx-apply` o skill `openspec-apply-change`, úsalo para este change; si no, implementa siguiendo `tasks.md` en orden.
3. Crea el scaffold de la extensión (manifest + Host TS + Webview React/Vite/Tailwind) respetando `design.md`.
4. Conecta el build del Webview al Host (`asWebviewUri`, CSP correcta).
5. Verifica en Extension Development Host el shell branded.
6. Marca cada task completada en `tasks.md` solo tras comprobarla.
7. Resume al usuario qué quedó hecho, cómo arrancar el panel, y confirma que **no** has tocado changes 2–8.
8. Detente. No archives el change ni empieces el siguiente sin confirmación del usuario.

Reglas de ejecución:

- No inventes requisitos ni rutas; si falta un dato crítico, pregunta antes de continuar.
- Respeta in-scope / out-of-scope.
- Código y nombres de símbolos en inglés; comunicación con el usuario en español.
- No uses `any` ni bypass de linter (`@ts-ignore`, `eslint-disable`) salvo petición explícita.
- Prefiere la skill `vs-extension-builder` y docs oficiales de VS Code ante dudas de API.

## Primera acción requerida

Lee `openspec/changes/scaffold-extension-webview/tasks.md` y `design.md`, confirma el estado del repo (¿existe ya código de extensión?), y comienza la task 1.1 del scaffold sin implementar ningún otro change.
