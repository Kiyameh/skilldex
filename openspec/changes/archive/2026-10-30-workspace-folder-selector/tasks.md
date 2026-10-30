# Tasks

## 1. Contrato y carpeta elegida

- [x] 1.1 Añadir `host/workspaceFolders` y `webview/selectWorkspaceFolder` en `src/shared/messages.ts` y en los type guards de `src/shared/type-guards.ts`. El snapshot lleva `folders` (`id`, `name`, `path`) y `selectedId` (`string` o `null`). La petición lleva solo `id`. Verificar en `src/shared/type-guards.test.ts` que un snapshot con dos carpetas y `selectedId` nulo pasa, y que un snapshot con `folders` que no es un array o un select sin `id` string se rechaza.
- [x] 1.2 Crear el módulo de carpeta elegida, inyectando la lista de carpetas, `workspaceState` (clave `skilldex.selectedWorkspaceFolder`, valor `uri.toString()`) y el aviso de cambio de carpetas. Sin valor válido usa la primera; sin carpetas, `selectedId` es `null`; un `id` desconocido no cambia la selección; añadir una carpeta mantiene la actual; quitar la elegida pasa a la primera que queda y notifica. El orden del snapshot es el de la lista recibida. Verificar con un test unitario colocated que cubre esos casos y que `path` es `fsPath`.
- [x] 1.3 Hacer que `getWorkspaceRoot()` del panel lea ese módulo y que el arranque de sesión envíe el snapshot junto a settings, también en los reintentos de handshake. `webview/selectWorkspaceFolder` con un `id` abierto actualiza el módulo; con un `id` cerrado no. En ambos casos el host responde con el snapshot de la selección real y un catálogo de esa raíz. Actualizar la expectativa de mensajes de arranque en `src/extension/host-message-adapter.test.ts`. Verificar ahí que el primer snapshot lleva las carpetas inyectadas, que elegir la segunda hace que `discoverCatalog`, `setItemEnabled` y `openCatalogItem` reciban su `fsPath`, y que un `id` desconocido no cambia esa raíz.

## 2. Watchers y raíz de descubrimiento

- [x] 2.1 Añadir al live sync un reenganche que dispone los watchers actuales, invalida un descubrimiento en vuelo, observa solo `.cursor/rules/**` y `.cursor/skills/**` de la carpeta que el getter devuelve en ese momento y publica su catálogo. Verificar en `src/extension/catalog-live-sync.test.ts` que los watchers viejos quedan dispuestos, que un descubrimiento empezado antes del reenganche no se publica y que un cambio posterior en la carpeta nueva sí llama a `discoverCatalog` con su ruta.
- [x] 2.2 En `extension.ts`, crear los watchers iniciales con la carpeta del módulo y llamar al reenganche cuando el módulo notifique un cambio. En `dashboard-view-provider.ts`, dejar de leer `workspace.workspaceFolders?.[0]`. Verificar que el test del módulo de 1.2 sigue notificando al quitar la carpeta elegida y que `npm run test:unit` pasa `src/extension/catalog-live-sync.test.ts` y `src/extension/host-message-adapter.test.ts`.
- [x] 2.3 Fijar que `discoverCatalog` no entra en un `.cursor` de un descendiente. Verificar en `src/extension/discover-catalog.test.ts` que, con `.cursor/skills` vacío en la raíz y un `SKILL.md` bajo `paquete/.cursor/skills/other/`, el catálogo no incluye esa skill, y que una raíz sin `.cursor` sigue devolviendo listas vacías.

## 3. Encabezado del panel

- [x] 3.1 Calcular en el webview la etiqueta de cada opción: el nombre de la carpeta, más el segmento padre de `path` cuando ese nombre está repetido; si el padre sale vacío, la ruta entera. Verificar con un test unitario colocated los tres casos (nombre único, nombre repetido, padre vacío).
- [x] 3.2 Sustituir el texto `SkillDex` del `h1` en `src/webview/App.tsx`. Sin carpetas, el título es `SkillDex`. Con una, es su nombre, `title` es la ruta y no hay control de elección. Con dos o más, es un botón `aria-haspopup="listbox"`, nombre accesible `Carpeta de análisis: <nombre>`, `title` con la ruta y un `listbox` con todas las raíces en orden, también las que no tienen `.cursor`. Elegir una envía `webview/selectWorkspaceFolder` y el título pasa a ese nombre. El logo se queda. Verificar en `src/webview/App.test.tsx` esos tres encabezados, el `title`, que la lista contiene las dos carpetas y que activar la segunda hace `postMessage` con su `id`.
- [x] 3.3 Al pasar de un `selectedId` a otro, vaciar la búsqueda, ocultar el catálogo anterior y soltar toggles pendientes y un resultado de toggle u open que llegue tarde. El primer snapshot, de ausencia de id a un id, no vacía un catálogo ya pintado. Verificar en `src/webview/App.test.tsx` que, con texto en el buscador y una skill visible, el cambio de id quita esa skill y deja el buscador vacío hasta el catálogo nuevo, y que un `toggleResult` de la carpeta anterior no marca el ítem del catálogo nuevo.

## 4. Corte completo

- [x] 4.1 Verificar el corte con `npm run test:unit` y `npm run test:integration` en verde.

## 5. Directorio de la herramienta de IA

- [x] 5.1 Añadir `skilldex.ai-tool-directory` (string, defecto `.cursor`, ámbito window). Rules, skills, watchers, toggle y abrir archivo usan ese directorio relativo a la carpeta elegida. Un valor vacío, absoluto o con `..` vuelve a `.cursor`. Al cambiarlo, los watchers se reenganchan. Verificar el default en el test de integración y que un directorio `.agents` descubre ese árbol y no el de `.cursor`.
