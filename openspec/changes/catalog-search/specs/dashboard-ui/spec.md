# Spec Delta

## ADDED Requirements

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

### Requirement: Active search text is orange
Cuando la consulta está activa, el texto escrito en el campo MUST mostrarse en naranja. Cuando la consulta no está activa, el texto del campo MUST NOT mostrarse en naranja. Las cards MUST NOT resaltar el fragmento coincidente.

#### Scenario: Orange while searching
- **WHEN** el campo contiene `react`
- **THEN** ese texto escrito MUST mostrarse en naranja

#### Scenario: Cards do not highlight matches
- **WHEN** una card permanece visible por una consulta activa
- **THEN** la card MUST NOT marcar visualmente el fragmento que coincidió

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
