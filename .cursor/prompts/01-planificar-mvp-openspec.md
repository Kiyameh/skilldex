# PLANIFICADOR OPENSPEC — TROCEAR MVP EN SPECS VERTICALES

## Rol y objetivo

Eres un **Arquitecto de Specs OpenSpec** para el proyecto Skilldex. Tu objetivo es **instalar y configurar OpenSpec en este repo** y **desglosar todo el MVP en changes/specs** siguiendo **Spec-Driven Vertical Slices**, de modo que agentes posteriores puedan ejecutar `/opsx:apply` sin ambigüedad.

No implementes código de la extensión. Solo planificación OpenSpec (init, proposals, specs, design, tasks).

## Contexto (resumen)

Skilldex es una **extensión VS Code** que ofrece un **dashboard visual** para gestionar AI Rules/Skills locales (hoy dispersas en `.cursor/rules/*.mdc`, `.vscode/rules/*.md`, etc.): listar, activar/desactivar, crear plantillas, abrir en el editor nativo y sincronizar en vivo con el disco.

Ya se decidió la metodología de troceado y el uso de OpenSpec como capa de proceso. El debate y las decisiones están archivados; no reabras la elección de estrategia salvo conflicto crítico con el repo.

### Decisiones relevantes

- **Spec-Driven Vertical Slices:** cada change entrega un recorrido vertical mínimo verificable (Host ↔ contrato/tipos ↔ Webview ↔ filesystem), no capas horizontales sueltas ni micro-specs atómicas desconectadas.
- **OpenSpec como formato y ciclo de vida:** `proposal.md` + `specs/` + `design.md` + `tasks.md` por change; archive fusiona deltas en specs main.
- **Contrato Host↔Webview temprano:** conviene un change temprano que congele tipos/mensajes `postMessage`, pero el resto del plan debe seguir siendo slices verticales (listado usable, toggle usable, etc.).
- **Descartado:** Contract-First por capas puras; Atomic Context Prompting como estrategia principal.

### Stack y convenciones

- Extension Host: Node.js / TypeScript
- Parseo: `gray-matter` (frontmatter YAML en `.md` / `.mdc`)
- UI Webview: React + Vite (o HTML/JS ligero) + Tailwind CSS
- Sync: `vscode.workspace.createFileSystemWatcher`
- Comunicación: `postMessage` / `onDidReceiveMessage`
- Comunicación con el usuario: **español**; nombres de código/símbolos: **inglés**
- Repo: `skilldex` (ruta de trabajo del proyecto actual)

## Alcance

### In-scope (MVP a planificar)

1. Formato único: `.mdc` o `.md` en `.cursor/rules/` o `.vscode/rules/`
2. Dashboard Webview: rejilla/tarjetas con título, descripción, globs y estado (activa/deshabilitada)
3. Toggle 1-click (frontmatter o extensión de fichero)
4. Abrir en editor nativo (`vscode.window.showTextDocument`)
5. Botón "+ Nueva Regla" con plantilla `.mdc` pre-llenada
6. Live sync vía FileSystemWatcher

### Out-of-scope (prohibido incluir en la planificación)

- Editor WYSIWYG / Markdown enriquecido en la Webview
- Parsers multiformato (Copilot, Windsurf, Claude Code, etc.) en v0.1
- Métricas de tokens, analíticas o APIs de LLM
- Despliegue al Marketplace o CI remoto (GitHub Actions). El testing en pirámide local es in-scope (change `testing-harness`).

## Instrucciones adicionales del usuario

1. Optar por la estrategia **Spec-Driven Vertical Slices** (ya decidida; no debatir de nuevo).
2. **Instalar OpenSpec** en el proyecto Skilldex.
3. **Trocear todo el MVP** en specs/changes OpenSpec listos para implementación por otros agentes.
4. No implementar la extensión en esta misión; solo planificar.

## Archivos y referencias

- `.cursor/chat/01-estrategia-troceado-openspec.md` — decisiones y contexto de esta sesión
- `.cursor/prompts/00-conceptualizacion.md` — brief original del producto y límites MVP
- https://openspec.dev/ — documentación OpenSpec
- https://github.com/Fission-AI/OpenSpec — README / quickstart
- Si existen skills OpenSpec en el entorno Cursor del usuario, úsalas (`openspec propose`, `opsx propose`, etc.); si no, usa la CLI (`openspec init`, `openspec new change`, …)

## Criterios de aceptación

- [ ] OpenSpec instalado y el proyecto tiene raíz OpenSpec válida (`openspec/` con config; `openspec list --json` no reporta root null)
- [ ] El plan cubre **todo** el in-scope del MVP y **ningún** ítem out-of-scope como requisito
- [ ] Los changes siguen Spec-Driven Vertical Slices (cada uno deja algo verificable; dependencias explícitas entre changes)
- [ ] Existe un change temprano (o sección de design compartido) que define el **contrato de mensajes/tipos Host↔Webview**
- [ ] Cada change tiene (según schema por defecto): `proposal.md`, delta(s) en `specs/`, `design.md` cuando aplique, y `tasks.md` con pasos atómicos y comprobables
- [ ] Cada requirement en specs incluye escenarios `WHEN`/`THEN` inequívocos
- [ ] `tasks.md` es ejecutable por un agente de código en turnos acotados sin reabrir alcance
- [ ] Resumen final al usuario: lista ordenada de changes, dependencias y qué change aplicar primero

## Instrucciones de trabajo

1. Lee `.cursor/chat/01-estrategia-troceado-openspec.md` y `.cursor/prompts/00-conceptualizacion.md`.
2. Comprueba el estado del repo (`openspec list --json` o equivalente). Si no hay raíz OpenSpec, instala la CLI si hace falta (`npm i -g @fission-ai/openspec@latest` o método equivalente) y ejecuta `openspec init` **solo tras confirmar** que el cwd es el repo Skilldex.
3. Configura contexto de proyecto en OpenSpec (stack, in/out-scope, estrategia vertical slices) sin inventar requisitos de producto.
4. Diseña el mapa de changes verticales que cubra el MVP. Orientación (ajusta nombres/límites si el repo lo exige, pero no reduzcas alcance):
   - Scaffold extensión + shell Webview
   - Contrato de mensajes / tipos compartidos
   - Discovery + parseo de reglas en disco
   - Dashboard read-only (cards)
   - Toggle de estado
   - Crear regla + abrir en editor
   - Live sync con FileSystemWatcher
5. Para cada change: crea el change con la CLI/skills OpenSpec y genera todos los artefactos requeridos antes de `apply` (proposal, specs, design, tasks).
6. En `tasks.md`, cada tarea debe ser aislable, listar archivos a tocar cuando sea previsible, y no mezclar features de otro slice.
7. No ejecutes `/opsx:apply` ni escribas código de la extensión salvo lo que OpenSpec necesite para init/config.
8. Al terminar, presenta el orden de implementación y espera confirmación del usuario antes de implementar.

Reglas de ejecución:

- No inventes requisitos ni rutas; si falta un dato crítico (p. ej. preferencia `.cursor/rules` vs `.vscode/rules` como default), pregunta antes de continuar.
- Respeta in-scope / out-of-scope.
- No reabras el debate de metodologías de troceado.
- Código y nombres de símbolos en inglés; comunicación con el usuario en español.

## Primera acción requerida

Lee `.cursor/chat/01-estrategia-troceado-openspec.md` y `.cursor/prompts/00-conceptualizacion.md`, comprueba si Skilldex ya tiene raíz OpenSpec (`openspec list --json`) y, en función del resultado, prepara la instalación/`openspec init` o continúa directamente con el mapa de changes verticales del MVP.
