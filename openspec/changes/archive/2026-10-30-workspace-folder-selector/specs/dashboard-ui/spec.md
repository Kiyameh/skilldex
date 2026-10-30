# Spec Delta

## ADDED Requirements

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
