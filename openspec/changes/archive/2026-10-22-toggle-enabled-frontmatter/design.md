# Design

## Context

Dashboard muestra estado. Persistencia acordada: frontmatter `enabled: false` en Rules y en `SKILL.md`.

## Goals / Non-Goals

**Goals:**
- Toggle 1-click con round-trip gray-matter
- UI refleja éxito/error
- Body Markdown preservado

**Non-Goals:**
- Rename de extensión `.disabled`
- Live sync completo (puede actualizar vía respuesta del toggle)

## Decisions

- **Disable:** escribir `enabled: false`.
- **Enable:** preferir `enabled: true` explícito para claridad (alternativa: eliminar clave; documentar la elegida en tasks y ser consistente).
- **Concurrencia:** último write gana; no locking sofisticado en MVP.
- **Idempotencia:** toggle envía target state booleano, no solo “flip”, para evitar races UI.

## Risks / Trade-offs

- YAML formatting changes by gray-matter: aceptable en MVP.
- Watcher futuro puede duplicar refresh: OK si debounce.
