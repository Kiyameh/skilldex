# dashboard-ui Specification

## Purpose

Renderizar el dashboard con dos secciones diferenciadas (Skills primaria, Rules secundaria), cards de metadatos habituales, controles de toggle de `enabled` y acción Abrir/Editar hacia el editor nativo.

## Requirements

### Requirement: Two differentiated sections
When both section preferences are enabled, the Webview SHALL present two clearly differentiated sections: Skills and Rules. The Skills section SHALL be visually primary (appears first / emphasized) and a tab list MUST be present. When only one section preference is enabled, the Webview SHALL present only that section and MUST NOT show a tab list. A section whose preference is disabled MUST NOT be rendered.

#### Scenario: Skills section appears before Rules
- **WHEN** both section preferences are enabled and the dashboard renders a catalog
- **THEN** the Skills section MUST be distinguishable from the Rules section
- **AND** the Skills section MUST appear before the Rules section
- **AND** a tab list MUST be present

#### Scenario: Only the skills section is visible
- **WHEN** the skills preference is enabled, the rules preference is disabled, and a catalog is available
- **THEN** the Skills section MUST be shown
- **AND** the Rules section MUST NOT be rendered
- **AND** a tab list MUST NOT be shown

#### Scenario: Only the rules section is visible
- **WHEN** the rules preference is enabled, the skills preference is disabled, and a catalog is available
- **THEN** the Rules section MUST be shown
- **AND** the Skills section MUST NOT be rendered
- **AND** a tab list MUST NOT be shown

### Requirement: Skill cards show habitual metadata
Each Skill card SHALL show at least `name`, `description` (revealed on hover/focus), and enabled/disabled state. When version is present it SHALL appear muted to the right of the name.

#### Scenario: Skill card content
- **WHEN** a skill catalog item is rendered
- **THEN** the card MUST display its name and enabled state
- **AND** the description MUST remain available on hover or focus

### Requirement: Rule cards show habitual metadata including globs
Each Rule card SHALL show at least the title, a sections list (or `No hay secciones`), globs, and enabled/disabled state. Globs SHALL appear below the sections list.

#### Scenario: Rule card content
- **WHEN** a rule catalog item is rendered
- **THEN** the card MUST display its title, sections list or `No hay secciones`, its globs (or an empty-state indication), and enabled state
- **AND** globs MUST appear below the sections list

### Requirement: Rule cards list document sections
Each Rule card SHALL replace the description field with a read-only list of section titles extracted from the rule document. Section items MUST NOT be interactive (no click-to-open).

#### Scenario: Sections replace description
- **WHEN** a rule catalog item with one or more sections is rendered
- **THEN** the card MUST show those section titles as a list
- **AND** the card MUST NOT show the frontmatter description in that slot

#### Scenario: No sections empty copy
- **WHEN** a rule catalog item has zero sections
- **THEN** the card MUST show the text `No hay secciones`

### Requirement: Skill cards show version beside the name
When a skill catalog item includes a version, the Skill card SHALL display it with a muted tone immediately to the right of the skill name. When version is absent, the card MUST NOT reserve empty space for it.

#### Scenario: Version present
- **WHEN** a skill catalog item has a version string
- **THEN** the card MUST show that version to the right of the name in a muted style

#### Scenario: Version absent
- **WHEN** a skill catalog item has no version
- **THEN** the card MUST show the name without a version placeholder

### Requirement: Skill cards show invocation size on hover
Each Skill card SHALL show, below the description inside the hover/focus reveal, a single line with the skill’s character count and approximate token cost. The line MUST use the format `<chars> caracteres (~<tokens> tokens)`, where both numbers use `es-ES` grouping (e.g. `1.024`). Tokens MUST be `round(characterCount / 2.8)` using half-away-from-zero for positive values (1.5 → 2). The tilde MUST always appear. The line MUST remain visible in that reveal when `characterCount` is `0`. The line MUST use the Tailwind class `text-blue-500`. Rule cards MUST NOT show this line.

#### Scenario: Size line under description on hover
- **WHEN** a skill catalog item with `characterCount` 1024 is revealed by hover or focus
- **THEN** the card MUST show `1.024 caracteres (~366 tokens)` below the description
- **AND** that line MUST use `text-blue-500`

#### Scenario: Size line hidden until hover or focus
- **WHEN** a skill card is rendered without hover or focus on the card
- **THEN** the size line MUST NOT be visible outside the description reveal

#### Scenario: Zero count still shown
- **WHEN** a skill catalog item has `characterCount` 0 and the card is revealed by hover or focus
- **THEN** the card MUST show `0 caracteres (~0 tokens)` below the description

#### Scenario: Tilde always present
- **WHEN** `characterCount` divides evenly by 2.8
- **THEN** the displayed line MUST still include `~` before the token number

#### Scenario: Rule cards omit size line
- **WHEN** a rule catalog item is rendered
- **THEN** the card MUST NOT show a character or token size line

### Requirement: Skills grouped by category
The Skills section SHALL group skill cards by category. Category headers SHALL use Title Case. Groups MUST NOT be collapsible. The Rules section MUST remain a flat list.

#### Scenario: Categorized skills render under headers
- **WHEN** the catalog contains skills with distinct categories
- **THEN** the Skills section MUST render a Title Case header per category
- **AND** each skill card MUST appear under its category header
- **AND** group headers MUST NOT provide a collapse control

#### Scenario: Root skills use Sin categoría
- **WHEN** the catalog contains skills with no category
- **THEN** those skills MUST appear under a header labeled `Sin categoría`

#### Scenario: Rules stay ungrouped
- **WHEN** the dashboard renders rules whose files live in nested folders
- **THEN** the Rules section MUST list rule cards without category headers

### Requirement: Empty states per section
Each visible section SHALL show an empty state when its list is empty. A hidden section MUST NOT show its empty state.

#### Scenario: No skills yet
- **WHEN** the Skills section is visible and the catalog contains zero skills
- **THEN** the Skills section MUST show an empty-state message (not a blank void)

#### Scenario: Hidden skills section skips its empty state
- **WHEN** the Skills section is hidden and the catalog contains zero skills
- **THEN** the Skills empty-state message MUST NOT be rendered

### Requirement: Cards expose toggle control
Skill and Rule cards SHALL include an accessible toggle control wired to the toggle message contract.

#### Scenario: Toggle is operable from card
- **WHEN** a catalog card is rendered after this change
- **THEN** it MUST provide a keyboard-accessible control that initiates the toggle request

### Requirement: Open control on cards
Each Skill and Rule card SHALL expose an Open control that sends the open message.

#### Scenario: Open control present
- **WHEN** a catalog card is rendered after this change
- **THEN** it MUST include an accessible Open action

### Requirement: Re-render on catalog push
The dashboard SHALL replace its rendered Skills and Rules lists when it receives a Host catalog update push.

#### Scenario: UI reflects pushed catalog
- **WHEN** the Webview receives a catalog update message
- **THEN** both sections MUST re-render to match the new payload

### Requirement: Catalog search field
El dashboard SHALL mostrar un campo de texto bajo el título y por encima de las listas del catálogo. El placeholder MUST ser `Encuentra algo...`. El campo MUST NOT mostrar una etiqueta visible ni un control de envío. El campo MUST exponer el nombre accesible `Encuentra algo...`.

#### Scenario: Idle search field
- **WHEN** el dashboard muestra un catálogo y el campo de búsqueda está vacío
- **THEN** el campo MUST mostrar el placeholder `Encuentra algo...`
- **AND** el campo MUST NOT mostrar una etiqueta visible ni un botón de enviar

### Requirement: Live catalog filter
El dashboard SHALL filtrar las listas al cambiar el texto del campo, sin acción de envío. Una consulta MUST aplicarse tanto a Skills como a Rules, y MUST conservarse al pasar de una lista a la otra. La consulta activa es el texto recortado de espacios en los extremos. Una consulta vacía, o formada solo por espacios, MUST mostrar el catálogo completo.

La comparación MUST ser una subcadena sin distinguir mayúsculas. Una skill MUST coincidir si su nombre visible o su campo `description` contiene la consulta. Una rule MUST coincidir solo si su título visible contiene la consulta. El texto de relleno `Sin descripción`, las secciones, los globs, la descripción de frontmatter de una rule y las cabeceras de categoría MUST NOT contar como coincidencia. El nombre o título visible incluye el mismo respaldo que ya muestra la card cuando falta el campo principal.

#### Scenario: Skill matches visible name
- **WHEN** la consulta es `react` y una skill tiene nombre visible `React Conventions`
- **THEN** esa skill MUST permanecer visible
- **AND** una skill cuyo nombre y `description` no contienen esa subcadena MUST NOT permanecer visible

#### Scenario: Skill matches description
- **WHEN** la consulta es `acceso` y una skill tiene nombre visible `Otra` y `description` `Control de acceso`
- **THEN** esa skill MUST permanecer visible

#### Scenario: Rule matches title only
- **WHEN** la consulta es `glob` y una rule tiene título visible `Ejemplo`, descripción de frontmatter `filtra por globs` y globs `**/*.ts`
- **THEN** esa rule MUST NOT permanecer visible

#### Scenario: Rule title match
- **WHEN** la consulta es `ejemplo` y una rule tiene título visible `Ejemplo`
- **THEN** esa rule MUST permanecer visible

#### Scenario: Placeholder description is not searchable
- **WHEN** la consulta es `descripción` y una skill no tiene campo `description`
- **THEN** esa skill MUST NOT permanecer visible solo porque la card muestra `Sin descripción`

#### Scenario: Whitespace is not a search
- **WHEN** el campo contiene solo espacios
- **THEN** las listas MUST mostrar los mismos ítems que con el campo vacío

#### Scenario: Query survives list switch
- **WHEN** hay una consulta activa y el usuario pasa de la lista de Skills a la de Rules
- **THEN** el campo MUST conservar el texto
- **AND** la lista de Rules MUST mostrarse ya filtrada por esa consulta

### Requirement: No matches message
Si una lista del catálogo tiene ítems y la consulta activa no deja ninguno, esa lista SHALL mostrar el texto `No hemos encontrado nada :(`. Ese mensaje MUST NOT sustituir al vacío de catálogo cuando la lista no tiene ítems.

#### Scenario: Filter misses every item
- **WHEN** la lista de Skills tiene ítems y ninguno coincide con la consulta activa
- **THEN** la lista MUST mostrar `No hemos encontrado nada :(`
- **AND** MUST NOT mostrar `No hay skills todavía`

#### Scenario: Catalog empty stays unchanged
- **WHEN** la lista de Skills no tiene ítems y la consulta está activa
- **THEN** la lista MUST seguir mostrando su vacío de catálogo
- **AND** MUST NOT mostrar `No hemos encontrado nada :(`

### Requirement: Empty skill categories stay hidden
Mientras la consulta está activa, una cabecera de categoría MUST NOT mostrarse si ninguna skill de ese grupo coincide.

#### Scenario: Category without matches
- **WHEN** la consulta deja sin coincidencias a todas las skills de una categoría
- **THEN** esa cabecera de categoría MUST NOT mostrarse

### Requirement: Settings button in the header
The dashboard header SHALL include a button that shows the settings-2 icon and requests opening settings. Its accessible name MUST be `Configuración`. The button MUST stay available when both sections are hidden.

#### Scenario: Header button requests settings
- **WHEN** the user activates the header settings button
- **THEN** the Webview MUST send the open-settings request

#### Scenario: Header button remains when both sections are hidden
- **WHEN** both section preferences are disabled
- **THEN** the header settings button MUST still be present

### Requirement: Empty state when both sections are hidden
When both section preferences are disabled and a settings snapshot has been received, the dashboard MUST NOT render the Skills or Rules sections. It SHALL show the text `No tienes ningún panel seleccionado, así que toma un mapache :D`, the raccoon image at 160 CSS pixels wide with accessible name `Mapache`, and a button labeled `Ir a la config` that requests opening settings.

#### Scenario: Both hidden shows the raccoon empty state
- **WHEN** both section preferences are disabled and a settings snapshot has been received
- **THEN** the dashboard MUST show the text `No tienes ningún panel seleccionado, así que toma un mapache :D`
- **AND** it MUST show the raccoon image with accessible name `Mapache` at 160 CSS pixels wide
- **AND** it MUST show a button named `Ir a la config`
- **AND** it MUST NOT render the Skills or Rules sections

#### Scenario: Empty-state button requests settings
- **WHEN** the user activates `Ir a la config`
- **THEN** the Webview MUST send the open-settings request

### Requirement: Sections render only after a settings snapshot
The dashboard MUST NOT render the Skills or Rules sections until it has received a settings snapshot. A later snapshot MUST update which sections are visible without reloading the panel.

#### Scenario: Catalog before settings does not show sections
- **WHEN** a catalog arrives and no settings snapshot has arrived
- **THEN** the Skills and Rules sections MUST NOT be rendered

#### Scenario: A later snapshot hides Rules
- **WHEN** both sections are visible and a later settings snapshot disables Rules
- **THEN** the Rules section MUST no longer be rendered
- **AND** the Skills section MUST remain visible
- **AND** a tab list MUST NOT be shown

### Requirement: Header title shows the selected workspace folder
Cuando hay al menos una carpeta raíz abierta, el título del encabezado SHALL ser el nombre de la carpeta elegida. El logo de SkillDex MUST permanecer visible. La ruta completa de esa carpeta MUST estar disponible como descripción del título. El campo de búsqueda MUST seguir debajo del título.

#### Scenario: One open folder replaces the SkillDex title
- **WHEN** el workspace tiene una sola carpeta raíz
- **THEN** el título del encabezado MUST mostrar el nombre de esa carpeta
- **AND** el título MUST NOT ser el texto `SkillDex`
- **AND** el encabezado MUST NOT ofrecer un control para elegir otra carpeta
- **AND** el logo de SkillDex MUST seguir visible

#### Scenario: No open folder keeps the SkillDex title
- **WHEN** el workspace no tiene ninguna carpeta raíz
- **THEN** el título del encabezado MUST ser el texto `SkillDex`
- **AND** el encabezado MUST NOT ofrecer un control para elegir carpeta

#### Scenario: Title describes the folder path
- **WHEN** hay una carpeta elegida
- **THEN** el título MUST exponer la ruta completa de esa carpeta como descripción

### Requirement: Folder choice lists every open workspace root
Con dos o más carpetas raíz abiertas, el título del encabezado SHALL ser el control para elegir la carpeta del análisis. Su nombre accesible MUST incluir el nombre de la carpeta elegida. La lista MUST incluir cada carpeta raíz abierta, en el orden del workspace, también las que no tienen `.cursor`. Elegir una entrada MUST pedir al Host que esa carpeta pase a ser la del análisis.

#### Scenario: Several roots open a choice
- **WHEN** el workspace tiene dos o más carpetas raíz
- **THEN** el título MUST ser un control cuyo nombre accesible incluye el nombre de la carpeta elegida
- **AND** activarlo MUST listar todas las carpetas raíz abiertas, en el orden del workspace

#### Scenario: A root without .cursor stays in the list
- **WHEN** una carpeta raíz abierta no tiene árbol `.cursor`
- **THEN** esa carpeta MUST aparecer en la lista

#### Scenario: Choosing a folder requests that root
- **WHEN** el usuario elige una carpeta de la lista
- **THEN** el Webview MUST pedir al Host que esa carpeta sea la del análisis

### Requirement: Duplicate folder names show the parent directory
Si dos o más carpetas de la lista comparten nombre, cada una de esas entradas SHALL mostrar también el nombre de su directorio padre. Una entrada cuyo nombre no se repite MUST mostrar solo el nombre de la carpeta.

#### Scenario: Shared names are disambiguated
- **WHEN** dos carpetas raíz abiertas se llaman igual
- **THEN** cada una de esas entradas MUST mostrar el nombre de su directorio padre además del nombre de la carpeta

#### Scenario: A unique name stays plain
- **WHEN** el nombre de una carpeta raíz no coincide con el de ninguna otra carpeta abierta
- **THEN** su entrada MUST mostrar solo el nombre de la carpeta

### Requirement: Folder switch clears the search and the previous catalog
Al pasar a otra carpeta, el dashboard SHALL vaciar el campo de búsqueda y MUST NOT seguir mostrando skills ni rules de la carpeta anterior mientras llega el catálogo nuevo. Un toggle que estuviera pendiente MUST NOT mostrarse como pendiente en el catálogo nuevo.

#### Scenario: Search is cleared on switch
- **WHEN** el campo de búsqueda tiene texto y el usuario elige otra carpeta
- **THEN** el campo MUST quedar vacío al mostrar el catálogo de la carpeta nueva

#### Scenario: Previous catalog does not linger
- **WHEN** el usuario elige otra carpeta y el catálogo nuevo todavía no ha llegado
- **THEN** el dashboard MUST NOT mostrar las skills ni las rules de la carpeta anterior

#### Scenario: A pending toggle does not carry over
- **WHEN** el usuario elige otra carpeta mientras un toggle sigue pendiente
- **THEN** el catálogo de la carpeta nueva MUST NOT mostrar ese toggle como pendiente

### Requirement: Skills panel groups the list with Live
Cuando la sección Skills está visible y `skilldex.showLiveArea` está activa, su panel SHALL agrupar en un solo contenedor la lista scrolleable de skills y el bloque Live, con Live debajo de la lista. El panel de Rules MUST NOT incluir ese bloque ni ese contenedor. Ocultar Skills, u ocultar el área Live, MUST ocultar el bloque Live. El scroll de la lista de skills MUST NOT desplazarse con el bloque Live.

#### Scenario: Live stays under the scrolling skill list
- **WHEN** la sección Skills está visible y la lista de skills desborda
- **THEN** la lista MUST hacer scroll en su propio hueco
- **AND** el bloque Live MUST permanecer debajo de ese hueco, fuera del scroll

#### Scenario: Rules panel has no Live container
- **WHEN** se muestra la sección Rules
- **THEN** el panel MUST NOT incluir el contenedor que agrupa la lista de skills con Live
