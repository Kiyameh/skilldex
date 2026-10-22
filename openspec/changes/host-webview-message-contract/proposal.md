# Proposal

## Why

Los slices posteriores (listado, toggle, create, open, sync) dependen de un contrato estable Host↔Webview. Congelarlo temprano evita divergencia de tipos y mensajes `postMessage` entre capas.

## What Changes

- Definir tipos TypeScript compartidos para mensajes Host → Webview y Webview → Host
- Implementar stub bidireccional verificable (ping/pong o handshake) sobre el shell existente
- Documentar convenciones de versionado/discriminación de mensajes (`type` / payload)

## Capabilities

### New Capabilities
- `host-webview-contract`: Contrato tipado de mensajes y tipos de dominio compartidos entre Host y Webview

### Modified Capabilities
- (ninguno)

## Impact

- Paquete/carpeta de tipos compartidos consumida por Host y Webview
- Extiende el scaffold; no añade UI de cards ni mutaciones de disco
- Cambios posteriores DEBEN reutilizar este contrato (extender, no duplicar)
