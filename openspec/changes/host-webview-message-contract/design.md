# Design

## Context

Existe (o existirá) shell Host+Webview. Los slices de catálogo y mutación necesitan un contrato único. Skills son el foco; Rules también en MVP.

## Goals / Non-Goals

**Goals:**
- Módulo de tipos compartidos importable desde Host y Webview
- Handshake verificable end-to-end
- Placeholders de dominio Rule/Skill/`enabled`

**Non-Goals:**
- Implementar discovery real o UI de cards
- Versionado semver complejo de protocolo (basta discriminant `type`)

## Decisions

- **Ubicación tipos:** carpeta `src/shared/` (o `packages/shared`) con mensajes y modelos de catálogo mínimos.
- **Transporte:** `webview.postMessage` / `panel.webview.onDidReceiveMessage`; adapters finos que validen discriminant (type guards), sin `any`.
- **Forma de ítem (mínima):** `{ id, kind: 'rule' | 'skill', path, enabled, title?, description?, globs?: string[] }` — campos display se rellenan en discovery.
- **Handshake:** `host/ready` + `webview/ready` o `ping`/`pong` documentado en el módulo.

## Risks / Trade-offs

- Duplicar tipos en dos builds (Host CJS/ESM vs Vite): mitigar con fuente única y path aliases.
- Congelar demasiado pronto: permitir extensión aditiva de mensajes en changes posteriores sin breaking renames.
