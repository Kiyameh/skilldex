# Design

## Context

Hoy la raíz de análisis está partida. `dashboard-view-provider.ts` y `extension.ts` leen `workspace.workspaceFolders?.[0]` por separado. `getWorkspaceRoot()` se evalúa en cada petición, así que el catálogo, el toggle y abrir archivo siguen a la primera carpeta si esa lista cambia. `startCatalogLiveSync` no: crea los watchers una vez al activar y no los vuelve a enganchar. No hay `workspaceState` ni mensajes de carpetas. El `h1` de `App.tsx` es el texto fijo `SkillDex`; el logo es decorativo (`aria-hidden`). Ver proposal.md para el motivo. Los requisitos están en los deltas de este change.

## Goals / Non-Goals

**Goals:**

- Una sola carpeta elegida, leída por descubrimiento, watchers, toggle y abrir archivo.
- Reenganchar los watchers al cambiar de carpeta y tirar un refresco que ya iba contra la carpeta anterior.
- El encabezado muestra esa carpeta y, con dos o más, deja elegir.

**Non-Goals:**

- Seguir el editor activo, un Quick Pick o fusionar catálogos de varias raíces.
- Ordenar las carpetas por nombre. El orden es el de `workspace.workspaceFolders`.
- Tratar un `.cursor` anidado como raíz elegible.

## Decisions

- La carpeta elegida vive en un módulo del host creado al activar la extensión. Guarda el URI (`WorkspaceFolder.uri.toString()`) en `workspaceState` con la clave `skilldex.selectedWorkspaceFolder`. `getWorkspaceRoot()` y el live sync leen ese módulo; dejan de mirar `[0]` por su cuenta. Alternativa descartada: una setting. La elección es estado de esta ventana, no una preferencia de usuario.
- Si el URI guardado sigue abierto, es la selección. Si no, la primera carpeta. Sin carpetas, no hay selección. `workspace.onDidChangeWorkspaceFolders` actualiza esa decisión aunque el panel esté cerrado. Quitar la carpeta elegida cae en la primera que quede.
- Elegir un `id` que no está abierto no cambia la selección ni dispara un descubrimiento. El host responde con el snapshot actual y el catálogo de la carpeta que sigue elegida, para que el panel no se quede en blanco.
- Mensajes nuevos, mismo prefijo que el resto: `host/workspaceFolders` y `webview/selectWorkspaceFolder`. El snapshot es `{ folders: { id, name, path }[], selectedId: string | null }`. `id` es el URI, `name` es `WorkspaceFolder.name`, `path` es `uri.fsPath`. `selectedId` es `null` solo cuando no hay carpetas. No se añade `selectedId` al mensaje de catálogo: el host no publica un catálogo de una generación ya superada.
- El snapshot sale al arrancar la sesión del webview, junto al de settings, y también en cada reintento de handshake mientras no haya `webview/ready`. Vuelve a salir cuando cambia el conjunto de carpetas o la selección.
- El live sync gana un reenganche: dispone los watchers, sube la generación que ya usa para ignorar un descubrimiento en vuelo, crea watchers solo sobre la carpeta elegida y empuja su catálogo. Un evento bajo otra raíz no llega porque esa raíz no tiene watcher. Alternativa descartada: vigilar todas las raíces y filtrar. Hace trabajo de más y deja abierto el fallo de publicar el catálogo equivocado.
- Al pulsar otra carpeta, el webview vacía búsqueda, catálogo y toggles pendientes antes de que llegue la respuesta, y pide la selección. El título pasa ya al nombre pulsado. El snapshot posterior confirma o, si el id era inválido, restaura el anterior junto con su catálogo. El primer snapshot de la sesión no vacía el catálogo: solo un cambio de un `id` a otro.
- Con una carpeta, el `h1` es su nombre y `title` es la ruta. Con ninguna, el `h1` sigue siendo `SkillDex`. Con dos o más, el título es un botón con `aria-haspopup="listbox"`, nombre accesible `Carpeta de análisis: <nombre>` y `title` con la ruta. La lista es un `listbox`. El texto cerrado es solo el nombre. Si hay nombres repetidos, esas opciones añaden el `basename` del directorio padre, calculado en el webview a partir de `path`. El logo y el título de la vista en `package.json` no se tocan.
- El padre se calcula con el segmento anterior de `path`. Si ese segmento sale vacío, la opción muestra la ruta. No hace falta un campo nuevo en el contrato.

## Risks / Trade-offs

- [Un refresco de la carpeta anterior llega después del cambio] → La generación del live sync sube al reenganchar y ese resultado no se publica. El webview, además, no pinta el catálogo viejo en la espera.
- [Dos carpetas con el mismo nombre y el mismo padre] → La opción sigue siendo ambigua. `title` lleva la ruta completa.
- [El URI cambia al mover la carpeta] → La selección guardada no coincide y se usa la primera. Es el mismo fallback que si se quita del workspace.
- [El logo no tiene nombre accesible] → La marca en el panel web es visual. El título de la vista sigue siendo SkillDex, como pide el scaffold.

## Migration Plan

No hay migración. Sin valor guardado, la carpeta es la primera, que es lo que el panel hace ahora. Revertir el cambio ignora la clave de `workspaceState`.
