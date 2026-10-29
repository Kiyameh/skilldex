# Design

## Context

Ver proposal.md (Why) y el delta `specs/dashboard-ui/spec.md`. El catálogo ya llega entero al Webview (`useCatalog`). `App` pinta el encabezado (título + `ConnectionBadge`) y, debajo, `CatalogTabs`, que muestra una sola lista. `SkillCard` usa `item.title ?? item.id` y, si falta `description`, el relleno `Sin descripción`. `RuleCard` usa el mismo respaldo de título y no pinta `description`. `groupSkillsByCategory` omite un grupo vacío.

El spec principal de `dashboard-ui` sigue pidiendo las dos secciones a la vez, con Skills delante. El código ya las separa en pestañas. Este change no reconcilia esa deriva.

## Goals / Non-Goals

**Goals:**

- Filtrar en el Webview las listas que `CatalogTabs` ya recibe
- Distinguir catálogo vacío de consulta sin coincidencias
- Dejar el estado de la consulta por encima de las pestañas para que sobreviva al cambio de lista

**Non-Goals:**

- Mensajes nuevos hacia el host, campos nuevos en `CatalogItem`, o índice de búsqueda
- Resaltar coincidencias dentro de la card
- Plegar acentos (`búsqueda` no coincide con `busqueda`)
- Buscar categoría, secciones, globs o la descripción de frontmatter de una rule
- Volver a apilar Skills y Rules
- Botón de limpiar nativo del input

## Decisions

- **Estado en `App`:** `query` vive en el encabezado, junto al título. `CatalogTabs` recibe skills y rules ya filtradas, más el tamaño del catálogo sin filtrar de cada lista. Así la consulta no se pierde al cambiar de pestaña y las secciones no leen el input.
- **Función pura de filtrado:** un helper de Webview (p. ej. `filterCatalogItems`) recibe los ítems, la consulta ya recortada y el kind. Nombre visible = `title ?? id`, igual que las cards. En skills, además `description` si es string. En rules, solo el nombre visible. Comparación: `toLowerCase()` e `includes`. Consulta `""` devuelve la lista original. Sin normalización de diacríticos.
- **Vacío en la sección:** si la lista visible está vacía y el recuento sin filtrar es 0, se mantiene `No hay skills todavía` / `No hay rules todavía`. Si el recuento sin filtrar es mayor que 0, el mensaje es `No hemos encontrado nada :(`. Filtrar antes de `groupSkillsByCategory` esconde las cabeceras sin coincidencias; el agrupador no cambia.
- **Campo:** `input type="text"` (no `type="search"`, para no mostrar el borrado nativo), sin `<form>`, sin `<label>` visible. `placeholder` y `aria-label` = `Encuentra algo...`. Con `query.trim().length > 0`, clase `text-orange-500` en el valor; si no, sin esa clase. El naranja fijo sigue el precedente de `text-blue-500` en la línea de tamaño, no un token de VS Code.
- **Sitio:** segunda fila del `<header>`, bajo la fila del título y de la insignia, por encima de `CatalogTabs`.

**Alternativas descartadas:**

- Filtrar dentro de cada sección con dos estados: la consulta se duplicaría o se perdería al desmontar el panel inactivo.
- `type="search"`: en el webview de Electron aparece un control de limpiar que el producto no pide.
- Pasar solo la lista filtrada: la sección no podría distinguir «no hay ítems» de «no hay coincidencias».

## Risks / Trade-offs

- [Una skill coincide por `description` aunque ese texto solo se ve al hover] → Aceptado; el requisito pide buscar la descripción real.
- [`text-orange-500` puede contrastar mal según el tema] → Aceptado; el producto pidió naranja fijo.
- [El spec histórico de secciones simultáneas no coincide con las pestañas] → No se toca en este change. El filtro se aplica a los arrays que ya entran en `CatalogTabs`.
- [Un catálogo grande se filtra en cada tecla en el hilo de UI] → El catálogo es local y pequeño; no hace falta debounce ni índice.

## Migration Plan

- No hay datos que migrar. Revertir el change devuelve el listado completo.

## Open Questions

Ninguna.
