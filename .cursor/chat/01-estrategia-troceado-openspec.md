# Estrategia de troceado y OpenSpec

- **Fecha:** 2026-10-21
- **Contexto:** Conceptualización del MVP de Skilldex (extensión VS Code) y elección de metodología de planificación para agentes de IA.

## Resumen

Se partió del rol AI-Driven Spec Architect (`00-conceptualizacion.md`) para debatir cómo trocear el MVP. Se evaluaron tres estrategias y se analizó OpenSpec como capa de proceso. **Decisión:** Spec-Driven Vertical Slices, ejecutadas vía OpenSpec (`propose` → `apply` → `archive`). El siguiente paso es un agente que instale OpenSpec y genere el plan completo de specs/changes.

## Objetivo

- Definir la metodología de troceado del MVP antes de generar specs atómicas.
- Valorar si OpenSpec encaja como formato y ciclo de vida de esas specs.

## Decisiones

- **Estrategia: Spec-Driven Vertical Slices:** cada unidad de trabajo entrega un recorrido vertical verificable (Host ↔ tipos ↔ Webview ↔ FS) en lugar de capas horizontales o micro-specs sueltas.
- **OpenSpec como capa operativa:** no construye el dashboard; estructura proposal/specs/design/tasks, apply y archive. Encaja con Cursor y ya se usa en zunbeltz-web.
- **Híbrido práctico sugerido (compatible con vertical slices):** primera capacidad/contrato de mensajes Host↔Webview pronto; después slices por feature (listado, toggle, create, open, live sync).
- **Alternativa descartada — Contract-First puro por capas:** buena coherencia de tipos, pero las primeras entregas no son demoables y retrasan feedback UI.
- **Alternativa descartada — Atomic Context Prompting (micro-specs):** útil para turnos muy cortos, pero pierde visión de producto y añade overhead de orquestación en un MVP acotado.

## Contenido clave

### MVP (recordatorio)

- Extensión VS Code: dashboard visual de AI Rules/Skills en `.cursor/rules/` o `.vscode/rules/` (`.mdc` / `.md`).
- Stack: Extension Host (Node/TS), `gray-matter`, Webview (React+Vite o HTML ligero + Tailwind), `FileSystemWatcher`, `postMessage`.
- In-scope: cards (título, descripción, globs, estado), toggle 1-click, abrir en editor, crear regla plantilla, live sync.
- Out-of-scope: WYSIWYG, multiformato (Copilot/Windsurf/Claude), métricas/LLM, Marketplace/CI remoto.
- **Actualización (2026-10-22):** el testing en pirámide (Vitest + `@vscode/test-cli`, CI local) entra en el MVP vía change `testing-harness`.

### Estrategias evaluadas (PASO 1)

1. Spec-Driven Vertical Slices — elegida.
2. Contract-First + capas horizontales — descartada como estrategia principal.
3. Atomic Context Prompting — descartada como estrategia principal.

### OpenSpec — encaje

- Flujo: explore → propose → apply → verify → archive.
- Artefactos por change: `proposal.md`, `specs/`, `design.md`, `tasks.md`.
- Mapa orientativo de changes (propuesto en debate, no cerrado como plan oficial):
  - scaffold extensión
  - contrato de mensajes
  - discovery/parseo de reglas
  - dashboard UI
  - toggle
  - create + open
  - live sync
- Skilldex (producto) ≠ OpenSpec (proceso): capas independientes.

## Archivos y referencias

- `.cursor/prompts/00-conceptualizacion.md` — prompt original Spec Architect
- https://openspec.dev/ — framework
- Skills OpenSpec en zunbeltz-web (referencia de uso previo)

## Pendiente / siguientes pasos

- Agente receptor: instalar OpenSpec en `skilldex` y trocear todo el MVP en specs/changes con estrategia Spec-Driven Vertical Slices.
- Prompt de handoff: `.cursor/prompts/01-planificar-mvp-openspec.md`
