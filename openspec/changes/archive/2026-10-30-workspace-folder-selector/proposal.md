# Proposal

## Why

En un workspace con varias carpetas raíz, SkillDex analiza siempre la primera. El panel no dice cuál es, y rules, skills, el refresco en disco, el toggle y abrir un archivo quedan atados a esa raíz. Quien abre varios proyectos a la vez no puede elegir sobre cuál trabaja el análisis.

## What Changes

- El título "SkillDex" del encabezado pasa a ser el nombre de la carpeta raíz elegida. El logo, el engranaje y el buscador se quedan. El nombre del producto sigue en la barra lateral.
- Con dos o más carpetas, ese título es un selector. Con una sola, es el nombre y no hay desplegable. Sin ninguna carpeta, el título sigue siendo SkillDex.
- La lista incluye todas las carpetas raíz abiertas, también las que no tienen `.cursor`. Elegir una sin `.cursor` muestra los vacíos de catálogo que el panel ya tiene.
- El id de cada carpeta es su URI. Si dos se llaman igual, el desplegable muestra también la carpeta padre. La ruta completa va en el tooltip.
- La elección se guarda en el estado de esa ventana. Al volver a abrirla, se recupera si la carpeta sigue en el workspace. Si no, se usa la primera.
- Añadir o quitar una carpeta raíz actualiza la lista. Si desaparece la elegida, se vuelve a la primera y se vuelve a descubrir.
- Descubrimiento, watchers, toggle y abrir archivo usan esa misma carpeta. Al cambiar, el catálogo visible se vacía hasta que llega el nuevo, y se limpian la búsqueda y los toggles a medias.
- Fuera de alcance: buscar árboles `.cursor` anidados dentro de una sola raíz.
- La configuración `skilldex.ai-tool-directory` elige el directorio relativo donde viven rules y skills. El defecto es `.cursor`.

## Capabilities

### New Capabilities

- (ninguna)

### Modified Capabilities

- `dashboard-ui`: el título del encabezado muestra la carpeta elegida y, con dos o más raíces, permite elegir otra
- `host-webview-contract`: snapshot de carpetas raíz y mensaje para elegir una
- `rules-skills-discovery`: el catálogo sale del `.cursor/` de la carpeta elegida; una raíz sin ese árbol da catálogo vacío
- `live-sync`: los watchers siguen a la carpeta elegida y se reenganchan al cambiarla
- `toggle-enabled`: el toggle escribe en el fichero de la carpeta elegida
- `open-in-editor`: abrir un ítem resuelve la ruta contra la carpeta elegida
- `extension-scaffold`: la marca SkillDex sigue en el logo y en el título de la vista; el texto del encabezado puede ser el nombre de la carpeta

## Impact

- Host: raíz de análisis única para descubrimiento, watchers, toggle y abrir; estado de ventana; evento de carpetas del workspace
- Contrato Host↔Webview: dos mensajes nuevos
- Webview: el `h1` del encabezado y el estado de búsqueda al cambiar de carpeta
- Tests de host, contrato y UI
- No escanea `.vscode/rules/`
