# Proposal

## Why

El dashboard muestra las skills del disco, pero no el momento en que el agente del chat las activa. Hace falta un feed local, dentro del panel de Skills, que añada un chip en ese instante y no vuelva a ocuparse de él.

## What Changes

- Un bloque Live debajo de la lista scrolleable de Skills. Ambos van en el mismo contenedor. En Rules no se muestra. Si Skills está oculto, Live tampoco.
- Cabecera `Live` con un led pegado al título: verde y pulsante mientras el watcher acepta eventos, rojo y fijo cuando está parado. Dos botones de icono, aparte del badge de conexión: parar/reanudar (`player-stop.svg` / `player-play.svg`) y reiniciar (`refresh.svg`).
- Lista de chips en un hueco de altura fija, unas 6 o 7 filas, con overflow oculto. El más reciente entra arriba, con la varita de las tarjetas, forma de píldora y un parpadeo al aparecer. Lo que no cabe queda tapado por abajo y sigue en la lista hasta el reinicio.
- Cada activación es un chip nuevo, aunque el nombre se repita. Después de entrar, el chip no cambia.
- Dos relojes, uno por tipo de activación: la lectura de un `SKILL.md` por el agente, y la skill adjuntada en el mensaje de ese turno. Una misma lectura no genera dos chips.
- Parar deja de añadir chips y descarta lo que ocurra durante la pausa. Reanudar escucha desde ese momento, sin rellenar el hueco. Reiniciar vacía la lista y no rebobina lo ya visto.
- El feed vive en memoria mientras el panel está abierto. Al abrir, el watcher arranca en marcha y la lista está vacía.

## Capabilities

### New Capabilities

- `live-activations`: feed de activaciones, relojes, controles de parar/reanudar y reiniciar, y presentación del bloque Live

### Modified Capabilities

- `dashboard-ui`: el panel de Skills agrupa la lista scrolleable y el bloque Live; Rules no lo incluye
- `host-webview-contract`: mensajes para publicar el feed y para parar, reanudar y reiniciar

## Impact

- Webview: panel de Skills, iconos ya presentes (`WandIcon`, `media/player-play.svg`, `media/player-stop.svg`, `media/refresh.svg`)
- Host: observación del chat local y fusión de un hook de usuario en `~/.cursor/hooks.json`
- Contrato Host↔Webview
- Tests de UI y del host, con fixtures temporales; el árbol `.cursor/` del repo no es fixture
- Fuera de este change: contadores históricos, estado «dentro de la skill», telemetría Enterprise, y persistir el feed al cerrar el panel
