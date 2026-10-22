# Proposal

## Why

Activar/desactivar Rules y Skills en un clic es un requisito central del MVP. El mecanismo acordado es frontmatter `enabled: false` (también en `SKILL.md`), no renombrado de extensión.

## What Changes

- Acción de toggle en cards de Skills y Rules
- Persistencia en disco escribiendo/actualizando `enabled` en el frontmatter
- Actualización del estado mostrado en la UI tras éxito (o error visible)

## Capabilities

### New Capabilities
- `toggle-enabled`: Toggle 1-click de Rules/Skills vía frontmatter `enabled`

### Modified Capabilities
- `host-webview-contract`: Mensajes para solicitar toggle y confirmar resultado
- `dashboard-ui`: Controles de toggle en cards (dejan de ser solo lectura en este aspecto)

## Impact

- Escritura de ficheros vía Host (`gray-matter` stringify + FS)
- No incluye create, open ni live sync (el refresh puede ser respuesta al propio toggle)
