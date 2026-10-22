# Proposal

## Why

El MVP requiere creación rápida de Rules y Skills desde plantillas, sin abandonar el dashboard. Create queda separado de Open para mantener slices acotados.

## What Changes

- Botón “+ Nueva Regla”: crea `.mdc` pre-llenado en `.cursor/rules/`
- Botón “+ Nueva Skill”: crea carpeta + `SKILL.md` plantilla bajo `.cursor/skills/`
- Tras crear, el catálogo debe poder reflejar el nuevo ítem (vía respuesta Host o sync posterior)

## Capabilities

### New Capabilities
- `create-from-template`: Creación de Rule y Skill desde plantillas pre-llenadas

### Modified Capabilities
- `host-webview-contract`: Mensajes para crear Rule/Skill y devolver resultado
- `dashboard-ui`: CTAs de creación en las secciones correspondientes

## Impact

- Escritura de FS y plantillas embebidas o en assets
- No incluye WYSIWYG ni open automático obligatorio (open es otro change; puede enlazarse después)
