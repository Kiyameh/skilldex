# Proposal

## Why

El valor del producto es un dashboard visual. Tras el discovery, hace falta una UI de solo lectura con dos secciones diferenciadas (Skills primaria, Rules secundaria) que muestre metadatos habituales y estado.

## What Changes

- Renderizar sección Skills (prioridad visual) y sección Rules
- Cards con metadatos habituales: Skills (`name`, `description`, `enabled`); Rules (título/descripción, `globs`, `enabled`)
- Estilos con Tailwind sobre React; sin acciones de mutación en este change

## Capabilities

### New Capabilities
- `dashboard-ui`: Dashboard Webview de solo lectura con secciones Skills y Rules

### Modified Capabilities
- (ninguno — consume catálogo ya expuesto por discovery/contrato)

## Impact

- Componentes React del Webview (secciones, cards)
- No implementa toggle, create, open ni FileSystemWatcher
- Metadatos adicionales de Skills quedan fuera (futuro)
