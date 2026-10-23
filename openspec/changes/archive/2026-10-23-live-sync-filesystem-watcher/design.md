# Design

## Context

Mutaciones internas y ediciones externas deben converger en el mismo catálogo. API: `vscode.workspace.createFileSystemWatcher`.

## Goals / Non-Goals

**Goals:**
- Watchers en roots Rules y Skills
- Refresh + push de catálogo
- Debounce y dispose

**Non-Goals:**
- Sync multi-máquina, git hooks, polling
- Diff granular por campo en UI (re-render lista basta)

## Decisions

- **Patterns:** watch `.cursor/rules/**/*` y `.cursor/skills/**/*` (o equivalente RelativePattern).
- **Debounce:** ~150–300ms coalescing (constante nombrada).
- **Fuente de verdad:** re-run discovery completo en MVP (simple, correcto); optimizar después si hace falta.
- **Integración con toggle/create:** push unificado evita estados divergentes.

## Risks / Trade-offs

- Echo de writes propios: debounce + refresh completo mitiga inconsistencias.
- Workspaces sin folder: no registrar watchers / mostrar empty state ya existente.
