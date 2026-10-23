# Proposal

## Why

Rules/Skills cambian fuera de SkillDex (editor nativo, git, otros tools). El dashboard debe refrescarse en vivo sin recarga manual mediante `FileSystemWatcher`.

## What Changes

- Registrar watchers sobre `.cursor/rules/` y `.cursor/skills/`
- Ante create/change/delete, re-descubrir/re-parsear y empujar catálogo actualizado a la Webview
- Evitar bucles obvios o tormentas de eventos (debounce razonable)

## Capabilities

### New Capabilities
- `live-sync`: Sincronización en vivo del dashboard vía FileSystemWatcher

### Modified Capabilities
- `host-webview-contract`: Evento Host→Webview de catálogo actualizado (si aún no existe como push)
- `rules-skills-discovery`: Reutilizar discovery ante eventos FS
- `dashboard-ui`: Re-render al recibir catálogo actualizado

## Impact

- `vscode.workspace.createFileSystemWatcher`
- Cierra el MVP vertical; no añade features out-of-scope
