# Design

## Context

El webview no puede leer la configuración de Cursor. Hoy el host solo le empuja handshake, catálogo y resultados de toggle/open (`src/shared/messages.ts`, `src/extension/host-message-adapter.ts`). `localResourceRoots` está limitado a `dist/webview` y el CSP de `get-webview-html.ts` permite imágenes de ese origen. El catálogo se pinta en pestañas (`src/webview/catalog-tabs.tsx`) en cuanto llega el mensaje de catálogo. Ver proposal.md para el motivo.

## Goals / Non-Goals

**Goals:**

- Un corte vertical: claves en el manifiesto, lectura en el host, snapshot al webview, visibilidad de secciones y apertura de Settings.
- Actualizar el panel al cambiar una clave, sin recargar la extensión.

**Non-Goals:**

- Validar el formato de la URL o usarla en el descubrimiento.
- Formulario propio de configuración, ventana de sistema o menú `view/title`.
- Recortar el fondo negro de `media/racoon.png`.

## Decisions

- Las preferencias viven en `contributes.configuration`, no en `globalState`. Así aparecen en Settings y entran en Settings Sync. `application` impide que un `.vscode/settings.json` clonado oculte secciones; `window` permite guardar la URL en el workspace. Alternativa descartada: `globalState`, invisible en la página nativa que se acordó usar.
- Mensajes nuevos, con el mismo prefijo que el resto del contrato: `host/settings` y `webview/openSettings`. El snapshot lleva los tres valores ya coercidos. El de apertura no lleva payload.
- Una función del host lee `vscode.workspace.getConfiguration("skilldex")` y coerciona: boolean ausente o de otro tipo → `true`; URL que no sea string → `""`. Con la contribución declarada, `getConfiguration` ya devuelve los defaults; la coerción cubre un valor corrupto.
- El listener `onDidChangeConfiguration` se suscribe al resolver la vista y se dispone con ella. Solo reacciona a `affectsConfiguration("skilldex")`. El primer snapshot se envía al arrancar la sesión del webview, junto al handshake, sin esperar a `webview/ready`.
- El webview no pinta secciones hasta tener catálogo y snapshot. Si el catálogo llega antes, se guarda y sigue el estado de espera ya existente («Catálogo: esperando…»). Así no aparecen las dos pestañas para ocultarse un momento después.
- Abrir Settings es `commands.executeCommand("workbench.action.openSettings", "@ext:" + extensionId)`. Con el `publisher` y `name` actuales la consulta es `@ext:andoni.skilldex`. El botón de cabecera y «Ir a la config» envían el mismo mensaje.
- El icono de cabecera es un SVG inline copiado de `media/settings-2.svg`, igual que `PencilIcon`, con nombre accesible «Configuración». Va en la cabecera, antes del badge de conexión.
- `racoon.png` se importa desde el webview (`../../media/racoon.png`) para que Vite lo emita dentro de `dist/webview`. No se amplía `localResourceRoots`. Ancho `w-40` (160 px). Si el build rechaza la ruta fuera de `src/webview`, se permite `media/` en `server.fs.allow`.

## Risks / Trade-offs

- [Una copia de `showSkills` / `showRules` en settings de workspace no tiene efecto] → La descripción de cada clave dice que es la preferencia del panel; el ámbito `application` hace que Cursor ignore el valor de workspace.
- [`racoon.png` es 726×344 con fondo negro] → En tema claro se ve un rectángulo negro. Se muestra el asset tal cual; recortarlo queda fuera de este cambio.
- [La consulta `@ext:` depende del id de la extensión] → Se construye con el id real (`andoni.skilldex` hoy), no con un literal suelto en el webview.
- [Multi-root] → La URL se lee con `getConfiguration` al nivel de la ventana, igual que el catálogo usa la primera carpeta. No hay ámbito `resource` en este cambio.

## Migration Plan

No hay migración. Los defaults (`true`, `true`, `""`) dejan el panel como está. Revertir el cambio deja claves huérfanas que Cursor ignora.
