# Proposal

## Why

SkillDex solo enseña el catálogo local. Quien mantiene skills en un remoto tiene que salir del panel para comprobar si está al día y para hacer pull. El checkout no siempre es `.cursor` (en LKWeb es `.ai-config` y después hay que generar), así que hace falta un pie de sincronización configurable, no un hardcode de un solo repo.

## What Changes

- Pie fijo al final del panel: referencia al remoto, estado frente a ese remoto, y botón `Pull`.
- Si `skilldex.remoteSkillsRepositoryUrl` está vacío: aviso `No hay un repo configurado` y enlace a la página de Settings de SkillDex (el mismo `webview/openSettings` del change `extension-settings`).
- Dos claves nuevas de ámbito `window`: `skilldex.localSkillsRepositoryPath` (default `.cursor`) y `skilldex.updateCommand` (default `""`).
- Con URL configurada, el host compara el checkout git de `localSkillsRepositoryPath` con ese remoto, hace `pull --ff-only` al pulsar `Pull` y, si hay comando, lo ejecuta después en un terminal visible.
- El descubrimiento del catálogo sigue siendo solo `.cursor/rules` y `.cursor/skills` de la raíz del workspace. Ni la URL ni el path git ni el comando lo cambian.
- **Depends on** `extension-settings` para la clave de URL, el snapshot de preferencias y abrir Settings. Este change es el primer uso de esa URL.

## Capabilities

### New Capabilities

- `remote-skills-sync`: claves de path y comando, resolución del checkout git, estados (sin URL, sin git, origin distinto, comprobando, al día, detrás, sucio, error), pipeline pull + comando opcional, y que el catálogo no se descubra desde el remoto.

### Modified Capabilities

- `dashboard-ui`: sección de pie siempre visible debajo del catálogo, con aviso o status + `Pull`.
- `host-webview-contract`: el snapshot de settings incluye path y comando; mensajes de status remoto y de petición/resultado de pull.

## Impact

- Manifiesto: `package.json` (`contributes.configuration`), dos claves nuevas.
- Host: git (`git -C`, sin dependencia nueva), terminal para pull y comando, validación de path relativo dentro del workspace.
- Contrato: `src/shared/messages.ts` y type guards.
- Webview: pie en `App`, sin ejecutar git.
- Tests unitarios del contrato, del resolver de sync y del pie; integración del host con un repo git temporal.
- No clona, no elige rama, no hace push, no resuelve conflictos, no cambia la raíz del catálogo.
