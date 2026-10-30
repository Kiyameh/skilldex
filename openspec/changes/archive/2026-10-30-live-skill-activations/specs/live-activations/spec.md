# Spec Delta

## Purpose

Mostrar, dentro del panel de Skills, un feed de chips que nace en el instante en que el agente local activa una skill y que no vuelve a actualizar ese chip.

## ADDED Requirements

### Requirement: Live block appears only with Skills
Cuando la sección Skills está visible y `skilldex.showLiveArea` está activa, el dashboard SHALL mostrar el bloque Live debajo de la lista scrolleable de skills y dentro del mismo contenedor. La sección Rules MUST NOT incluir ese bloque. Si la preferencia de Skills está desactivada, o si `skilldex.showLiveArea` está desactivada, el bloque Live MUST NOT renderizarse. Ocultar el área MUST NOT vaciar los chips ni parar el watcher.

#### Scenario: Skills tab shows Live under the list
- **WHEN** ambas secciones están visibles y la pestaña activa es Skills
- **THEN** el bloque Live MUST aparecer debajo de la lista scrolleable de skills
- **AND** la lista y Live MUST compartir un contenedor

#### Scenario: Rules tab hides Live
- **WHEN** la pestaña activa es Rules
- **THEN** el bloque Live MUST NOT renderizarse

#### Scenario: Skills-only view still shows Live
- **WHEN** solo la preferencia de Skills está activa
- **THEN** el bloque Live MUST aparecer debajo de la lista de skills
- **AND** MUST NOT haber una pestaña de Rules

#### Scenario: Hidden Skills hides Live
- **WHEN** la preferencia de Skills está desactivada
- **THEN** el bloque Live MUST NOT renderizarse

#### Scenario: Show live area off hides Live
- **WHEN** `skilldex.showLiveArea` está desactivada y la sección Skills está visible
- **THEN** el bloque Live MUST NOT renderizarse
- **AND** la lista de skills MUST seguir visible

### Requirement: Live header controls
El bloque Live SHALL mostrar el título `Live`, un led inmediatamente a la derecha de ese título, y dos botones de icono. Esos controles MUST NOT modificar el badge de conexión de la cabecera. Con el watcher en marcha el led MUST estar verde y pulsante, y el botón de reproducción MUST mostrar el icono de `player-stop.svg` con nombre accesible `Parar Live`. Con el watcher parado el led MUST estar rojo y fijo, y ese botón MUST mostrar el icono de `player-play.svg` con nombre accesible `Reanudar Live`. El segundo botón MUST mostrar el icono de `refresh.svg` con nombre accesible `Reiniciar Live`. El led MUST exponer el estado con el texto `Live en marcha` o `Live parado`.

#### Scenario: Running state
- **WHEN** el watcher acepta activaciones
- **THEN** el led MUST mostrarse verde y pulsante a la derecha de `Live`
- **AND** el botón de reproducción MUST usar el icono de parada y el nombre `Parar Live`

#### Scenario: Stopped state
- **WHEN** la persona para el watcher
- **THEN** el led MUST mostrarse rojo y fijo
- **AND** el botón de reproducción MUST usar el icono de play y el nombre `Reanudar Live`
- **AND** el badge de conexión de la cabecera MUST NOT cambiar por ese gesto

### Requirement: Activation chips
Cada activación SHALL añadir una fila nueva en la parte superior de la lista, aunque el nombre ya esté en otra fila. La fila MUST leerse `He usado [chip] de [directorio]`, con el icono de pokeball delante. Después de esa frase MUST mostrarse la hora y la fecha de la activación, en un tamaño menor y un color atenuado. El chip MUST mostrar la varita y el nombre visible de la skill, con `border-radius` completo. El chip más reciente, incluida su varita, MUST usar el teal de las tarjetas de skill; los anteriores, incluida su varita, MUST permanecer en el color neutro del panel. Al insertarse, la fila MUST crecer de arriba abajo, empujando a las de debajo, y MUST pasar de opacidad 0 a opacidad completa una sola vez. Después MUST permanecer estática. El nombre visible MUST ser el de la tarjeta del catálogo cuando la ruta coincide; si no hay tarjeta, MUST ser el nombre de la carpeta que contiene ese `SKILL.md`. El directorio MUST ser el nombre de la carpeta de trabajo de esa activación. El chip MUST ser un botón que abre el `SKILL.md` de esa activación de la misma forma que Editar abre un ítem del catálogo. El aspecto del chip MUST NOT cambiar, y al pasar el puntero MUST mostrar `cursor: pointer`. El hueco MUST tener altura fija y overflow oculto, MUST mostrar 7 filas completas y MUST ocultar la fila que ocupe la posición 8 o posterior. Las filas ocultas por el recorte MUST seguir en la lista.

#### Scenario: Newest chip stacks on top
- **WHEN** llega una activación mientras ya hay chips
- **THEN** el chip nuevo MUST ser el primero de la lista
- **AND** los anteriores MUST conservar su orden relativo

#### Scenario: Repeated skill adds another chip
- **WHEN** la misma skill se activa dos veces
- **THEN** la lista MUST contener dos chips con ese nombre

#### Scenario: New row enters from the top
- **WHEN** una fila acaba de insertarse
- **THEN** esa fila MUST crecer de arriba abajo y empujar a las de debajo
- **AND** MUST pasar de oculta a opacidad completa
- **AND** al terminar MUST permanecer estática

#### Scenario: Eighth chip is clipped
- **WHEN** la lista contiene 8 chips
- **THEN** 7 chips MUST verse completos
- **AND** el chip de la posición 8 MUST NOT verse
- **AND** ese chip MUST seguir en la lista

#### Scenario: Name falls back to the skill folder
- **WHEN** la activación apunta a un `SKILL.md` que no está en el catálogo
- **THEN** el chip MUST mostrar el nombre de la carpeta de ese fichero

### Requirement: One chip per activation instant
El feed SHALL añadir un chip cuando el agente lee un fichero llamado `SKILL.md` en un workspace que comparte una carpeta abierta con esta ventana, y otro cuando el mensaje de la persona adjunta una skill en un chat de esas carpetas. Una lectura o un adjunto de un workspace que no comparte carpetas con esta ventana MUST NOT añadir un chip. Cada skill adjunta en el mensaje MUST producir su propio chip. Una misma lectura MUST producir un solo chip aunque dos canales la observen. Leer un `SKILL.md` para editarlo MUST contar como activación. Una skill que solo figura como disponible, o un turno siguiente que ni la adjunta ni la vuelve a leer, MUST NOT añadir un chip. El chip MUST aparecer en el instante de esa activación y MUST NOT actualizarse después.

#### Scenario: Agent read adds one chip
- **WHEN** el watcher está en marcha y el agente lee un `SKILL.md` en un workspace que comparte una carpeta abierta con esta ventana
- **THEN** la lista MUST ganar un chip de esa skill
- **AND** MUST NOT ganar un segundo chip por la misma lectura

#### Scenario: Other workspace is ignored
- **WHEN** el agente lee un `SKILL.md` en un workspace que no comparte carpetas con esta ventana
- **THEN** la lista MUST NOT ganar un chip por esa lectura

#### Scenario: Attached skills add one chip each
- **WHEN** el mensaje de la persona adjunta dos skills
- **THEN** la lista MUST ganar dos chips, uno por cada skill adjunta

#### Scenario: Read after attach is a second activation
- **WHEN** el mensaje adjunta una skill y, en ese mismo turno, el agente lee su `SKILL.md`
- **THEN** la lista MUST contener dos chips de esa skill

#### Scenario: Edit read still counts
- **WHEN** el agente lee un `SKILL.md` para modificarlo
- **THEN** la lista MUST ganar un chip de esa skill

#### Scenario: Listed skill is not an activation
- **WHEN** una skill solo está disponible para el agente y ese turno no la adjunta ni lee su `SKILL.md`
- **THEN** la lista MUST NOT ganar un chip de esa skill

#### Scenario: Follow-up turn does not repeat the chip
- **WHEN** un turno anterior adjuntó una skill y el turno siguiente no la adjunta ni lee su `SKILL.md`
- **THEN** ese turno siguiente MUST NOT añadir otro chip de esa skill

### Requirement: Watcher starts empty and running
Al empezar la sesión del panel, el watcher SHALL estar en marcha y la lista MUST estar vacía. La lista MUST vivir en memoria de esa sesión. Ocultar el panel MUST conservar la lista y el estado del watcher. Cerrar la sesión del host MUST descartar la lista. Cambiar la carpeta de análisis MUST NOT vaciar la lista.

#### Scenario: Fresh session
- **WHEN** el panel inicia una sesión
- **THEN** el watcher MUST estar en marcha
- **AND** la lista de chips MUST estar vacía

#### Scenario: Hiding the panel keeps the feed
- **WHEN** hay chips y la persona oculta el panel
- **THEN** al volver a mostrarlo la lista y el estado del watcher MUST ser los mismos

#### Scenario: Folder change keeps chips
- **WHEN** hay chips y la persona elige otra carpeta de análisis
- **THEN** la lista de chips MUST NOT vaciarse por ese cambio

### Requirement: Stop discards the gap and reset clears the list
Parar el watcher SHALL dejar de añadir chips y MUST conservar los ya presentes. Las activaciones ocurridas durante la pausa MUST descartarse y MUST NOT aparecer al reanudar. Reanudar MUST volver a aceptar activaciones desde ese momento. Reiniciar MUST vaciar toda la lista, incluidos los chips ocultos por el recorte, y MUST NOT volver a insertar activaciones ya vistas. Reiniciar MUST NOT cambiar por sí solo si el watcher está en marcha o parado.

#### Scenario: Stop keeps current chips
- **WHEN** hay chips y la persona para el watcher
- **THEN** esos chips MUST seguir en la lista
- **AND** una activación posterior MUST NOT añadir un chip

#### Scenario: Resume does not backfill
- **WHEN** el watcher estuvo parado mientras ocurría una activación y la persona lo reanuda
- **THEN** esa activación de la pausa MUST NOT aparecer
- **AND** una activación posterior a la reanudación MUST añadir un chip

#### Scenario: Reset clears hidden chips
- **WHEN** la lista tiene más chips de los que caben en el hueco y la persona pulsa reiniciar
- **THEN** la lista MUST quedar vacía
- **AND** el estado en marcha o parado del watcher MUST ser el mismo que antes del reinicio
