# Proposal

## Why

El panel muestra siempre Skills y Rules, y no hay sitio para preferencias de la extensión. Hace falta poder ocultar cada sección y guardar la URL de un repositorio remoto de skills, usando la página de Settings de Cursor.

## What Changes

- Tres claves en `contributes.configuration`: `skilldex.showSkills` y `skilldex.showRules` (boolean, por defecto `true`, ámbito `application`) y `skilldex.remoteSkillsRepositoryUrl` (string, por defecto `""`, ámbito `window`).
- Un botón con el icono `media/settings-2.svg` en la cabecera del panel abre Settings filtrado a SkillDex (`@ext:andoni.skilldex`).
- Con una sola sección visible, el catálogo la muestra sin barra de pestañas. Con las dos, se mantienen las pestañas actuales (Skills primero).
- Con las dos ocultas, el catálogo muestra el texto «No tienes ningún panel seleccionado, así que toma un mapache :D», `media/racoon.png` a unos 160 px de ancho (texto alternativo «Mapache») y un botón «Ir a la config» que abre la misma página de Settings.
- La URL solo se almacena. El descubrimiento local de `.cursor/` no la lee.
- El host envía las tres preferencias al webview al abrir el panel y cada vez que cambian, antes de pintar el catálogo con el valor por defecto.

## Capabilities

### New Capabilities

- `extension-settings`: claves nativas de configuración, sus ámbitos y valores por defecto, apertura de la página de Settings de Cursor, y persistencia de la URL sin usarla en el descubrimiento.

### Modified Capabilities

- `dashboard-ui`: la presencia de las secciones Skills y Rules depende de la configuración; estado vacío con mapache cuando ambas están ocultas; botón de configuración en la cabecera.
- `host-webview-contract`: mensaje Host→Webview con la instantánea de preferencias y mensaje Webview→Host para abrir Settings.

## Impact

- Manifiesto: `package.json` (`contributes.configuration`).
- Host: lectura de `vscode.workspace.getConfiguration`, `onDidChangeConfiguration` y `workbench.action.openSettings`.
- Contrato: `src/shared/messages.ts` y type guards.
- Webview: cabecera de `App`, `catalog-tabs` y estado vacío. `racoon.png` entra en el bundle del webview (el CSP ya permite imágenes de ese origen; `localResourceRoots` sigue limitado a `dist/webview`).
- Tests unitarios del webview y del contrato. El descubrimiento y el toggle no cambian.
