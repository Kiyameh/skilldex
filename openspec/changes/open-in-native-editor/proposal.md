# Proposal

## Why

La edición de contenido queda fuera de la Webview (sin WYSIWYG). El usuario debe poder abrir una Rule o Skill en el editor nativo de VS Code desde la card.

## What Changes

- Acción “Abrir” en cards de Skills y Rules
- Host ejecuta `vscode.window.showTextDocument` sobre la ruta del ítem
- Sin editor embebido en la Webview

## Capabilities

### New Capabilities
- `open-in-editor`: Abrir Rule o Skill en el editor nativo de VS Code

### Modified Capabilities
- `host-webview-contract`: Mensaje Webview→Host para abrir documento
- `dashboard-ui`: Botón/acción Abrir en cada card

## Impact

- Solo Host API de ventanas/editores; sin mutación de contenido
- Independiente de create y toggle (puede aplicarse en paralelo tras dashboard)
