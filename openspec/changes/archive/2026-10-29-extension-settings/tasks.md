# Tasks

## 1. Preferencias en el manifiesto y en el contrato

- [x] 1.1 Declarar en `package.json` el grupo SkillDex con `skilldex.showSkills`, `skilldex.showRules` y `skilldex.remoteSkillsRepositoryUrl` (tipos, defaults, ámbitos, descripciones y orden del diseño). Verificar con un test de integración en `src/extension/extension.integration.test.ts`: tras activar la extensión, `getConfiguration("skilldex")` devuelve `true`, `true` y `""`.
- [x] 1.2 Añadir `host/settings` y `webview/openSettings` a `src/shared/messages.ts` y a los type guards de `src/shared/type-guards.ts`. Verificar que `src/shared/type-guards.test.ts` acepta un snapshot con los tres campos tipados y un open-settings sin payload, y rechaza un boolean o una URL que no sea string.
- [x] 1.3 Extraer la lectura coercida (`boolean` ausente o de otro tipo → `true`, URL que no sea string → `""`) en un módulo del host. Verificar con un test unitario colocated que cubre esos dos fallbacks y una URL de workspace leída tal cual. El test no abre el descubrimiento: `discover-catalog` no recibe la URL.

## 2. El panel obedece el snapshot

- [x] 2.1 Enviar el snapshot al arrancar la sesión del webview (junto al handshake) y otra vez cuando `affectsConfiguration("skilldex")` sea cierto, disponiendo el listener con la vista. Verificar en `src/extension/host-message-adapter.test.ts` (o en el test del provider, si el listener vive ahí) que el primer mensaje de settings sale al resolver la vista y que un cambio de `skilldex` provoca otro snapshot sin llamar a `discoverCatalog`.
- [x] 2.2 Retener el catálogo en el webview hasta recibir el snapshot y, mientras tanto, seguir mostrando «Catálogo: esperando…». Con ambas preferencias en `true`, las pestañas actuales se mantienen. Verificar en `src/webview/App.test.tsx` que un catálogo sin snapshot no muestra las pestañas y que, tras el snapshot con ambas a `true`, Skills aparece antes que Rules.
- [x] 2.3 Hacer que `src/webview/catalog-tabs.tsx` pinte solo la sección activa y omita el `tablist` cuando una preferencia está apagada. Verificar en `src/webview/catalog-tabs.test.tsx` los dos casos de una sola sección y que la sección oculta no muestra su estado vacío.

## 3. Abrir Settings y el estado del mapache

- [x] 3.1 Al recibir `webview/openSettings`, ejecutar `workbench.action.openSettings` con `@ext:` más el id de la extensión. Verificar en el test del adapter que la consulta resultante es `@ext:andoni.skilldex`.
- [x] 3.2 Añadir en la cabecera de `src/webview/App.tsx`, antes del badge, un botón con el SVG de `media/settings-2.svg` y nombre accesible «Configuración» que envía `webview/openSettings`. Verificar en `src/webview/App.test.tsx` que activarlo hace `postMessage` con ese tipo y que el botón sigue presente con las dos preferencias en `false`.
- [x] 3.3 Con las dos preferencias en `false` y snapshot recibido, mostrar el texto «No tienes ningún panel seleccionado, así que toma un mapache :D», `media/racoon.png` importado al bundle con ancho `w-40` y nombre accesible «Mapache», y el botón «Ir a la config» que envía el mismo mensaje. Verificar en `src/webview/App.test.tsx` el texto, el nombre de la imagen, la clase `w-40`, el `postMessage` del botón y la ausencia de las secciones. Si `npm run build:webview` rechaza la ruta fuera de `src/webview`, permitir `media/` en `server.fs.allow` y volver a comprobar que el build termina.

## 4. Corte completo

- [x] 4.1 Verificar el corte con `npm run test:unit` y `npm run test:integration` en verde, incluida la comprobación de que cambiar la URL no dispara un descubrimiento nuevo.
