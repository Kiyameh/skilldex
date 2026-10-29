# Proposal

## Why

Con el catálogo crecido, localizar una skill o una rule obliga a recorrer la lista a mano. Un filtro en el propio panel evita salir del dashboard para buscar por nombre o descripción.

## What Changes

- Un input bajo el título de SkillDex, por encima de las listas del catálogo. Placeholder `Encuentra algo...`. Sin etiqueta visible y sin botón de enviar.
- El filtro se aplica al escribir. Una sola consulta vale para Skills y para Rules; cambiar de lista no la borra.
- Skills coinciden por el nombre visible o por el campo `description`. Rules coinciden solo por el título visible. No cuentan secciones, globs ni la descripción de frontmatter de una rule.
- El texto de relleno `Sin descripción` no es buscable. El nombre o título de respaldo es el mismo que ya muestra la card.
- Con texto (tras recortar espacios), el texto escrito en el input se muestra en naranja. Solo espacios, o el campo vacío, no es una búsqueda: color normal y catálogo completo.
- La comparación es una subcadena, sin distinguir mayúsculas.
- Si el catálogo de esa lista tiene ítems pero ninguno coincide, el mensaje es `No hemos encontrado nada :(`. Los vacíos de catálogo (`No hay skills todavía`, `No hay rules todavía`) no cambian.
- Una categoría de skills sin coincidencias no muestra su cabecera.

## Capabilities

### New Capabilities

- (ninguna)

### Modified Capabilities

- `dashboard-ui`: filtro en vivo del catálogo por nombre o descripción, estado visual de búsqueda activa y vacío distinto cuando no hay coincidencias

## Impact

- Webview: encabezado del dashboard y listas de Skills y Rules
- Tests de UI del webview (Vitest + React Testing Library)
- No cambia el host, el contrato de mensajes ni el modelo `CatalogItem`
- No reabre el requisito de secciones apiladas: el filtro opera sobre las listas que el dashboard ya pinta
