# Design

## Context

El panel de Skills ya es una lista con scroll propio (`SkillsSection`) dentro de `CatalogTabs`. El host habla con el webview por mensajes discriminados en `src/shared/messages.ts`. No hay API de extensión para el chat. Ver `proposal.md` para el motivo.

Cursor deja ver dos instantes distintos, y no un evento de skill:

- `beforeReadFile` recibe `file_path` justo antes de que el agente lea un fichero. Es el reloj de la lectura.
- El `.jsonl` de `~/.cursor/projects/<slug>/agent-transcripts/` escribe el mensaje de la persona al empezar el turno. Si adjuntó skills, el texto trae un bloque con `Skill Name` y `Path`. Es el reloj del adjunto. Las líneas `Read` de ese fichero llegan más tarde y no se usan.

El slug observado es la ruta del workspace con las barras sustituidas por guiones (`/Users/a/Code/lkweb-working` → `Users-a-Code-lkweb-working`).

## Goals / Non-Goals

**Goals:**

- Un chip por activación, en el instante del reloj que le corresponde, sin duplicar una lectura.
- Parar, reanudar y reiniciar sin rellenar huecos ni rebobinar.
- El hook no puede frenar ni bloquear la lectura del agente.

**Non-Goals:**

- Aislar dos ventanas que tienen abierta la misma carpeta. Cursor no da un id de ventana al hook.
- Detectar el trigger `skill_name_in_prompt`.
- Cloud agents. El hook de usuario no corre allí.
- Persistir chips al terminar la sesión del host.

## Decisions

### 1. Cada tipo de activación tiene un solo reloj

Las lecturas entran solo por `beforeReadFile` cuando el basename es `SKILL.md`. Los adjuntos entran solo parseando el bloque del mensaje de usuario en el transcript. Una lectura que también aparezca como `tool_use` en el `.jsonl` se ignora.

Así el deduplicado no depende de una ventana de tiempo. Adjuntar y luego leer el mismo fichero en el turno son dos activaciones, como pide la spec.

Alternativa descartada: tail único del transcript para las dos cosas. El `Read` del `.jsonl` se vuelca al cerrar el paso del modelo, no en el instante de la lectura.

### 2. El hook escribe una línea y siempre permite la lectura

En `activate`, Skilldex escribe `~/.cursor/hooks/skilldex-skill-read.sh` y `skilldex-skill-read.cjs`, y asegura una entrada `beforeReadFile` en `~/.cursor/hooks.json` con `command: "./hooks/skilldex-skill-read.sh"`. Es la convención documentada de hooks de usuario, y evita meter en `command` la ruta del `globalStorage`, que en macOS lleva espacios. La entrada se reconoce por ese `command`. No se borran el resto de hooks. No se pone `failClosed`. En modo `Test` no se instala nada, para que las pruebas de integración no toquen el `hooks.json` real.

El script de shell lee el stdin y, solo si contiene `SKILL.md"`, se lo pasa en primer plano al parser `.cjs`, que corre con el ejecutable del host (`process.execPath` con `ELECTRON_RUN_AS_NODE=1`) para no depender de `node` en el `PATH`. El parser comprueba que el basename de `file_path` es `SKILL.md` y añade una línea al spool del `globalStorage`: ruta, `conversation_id` y `workspace_roots`. En cualquier caso el script escribe `{"permission":"allow"}` y sale 0. Un JSON inválido de hooks.json no se sobrescribe ni tira la extensión: se deja el intake en marcha y las lecturas no llegan.

Alternativa descartada: `postToolUse`. Ocurre después de la lectura.

### 3. El host filtra por las carpetas de esta ventana

El spool es de la máquina. Cada ventana acepta una línea solo si `workspace_roots` corta con sus carpetas abiertas. Dos ventanas con la misma carpeta muestran las dos el chip. Una ventana de otro proyecto no.

El tail del transcript usa el slug de cada carpeta abierta. Si ese directorio no existe, los adjuntos de esa carpeta no entran y las lecturas siguen entrando por el hook.

El parser extrae `Path` del bloque adjunto y descarta el resto de la línea. No guarda el cuerpo de la skill.

### 4. Pausa y reinicio mueven el cursor, no el historial

La lista y el flag `watching` viven en el host. Al pausar, el host marca el flag, descarta lo que ya esté en el spool y en los transcripts, y deja los offsets al final. Al reanudar, solo cuenta lo que llegue después. Reiniciar vacía `chips` y no mueve el offset hacia atrás.

El id del chip lo genera el host al insertarlo. El nombre sale de `CatalogItem.title` si la ruta absoluta coincide con `path`; si no, del directorio padre del `SKILL.md`.

Cambiar la carpeta de análisis no vacía la lista. Ocultar el panel tampoco: el view ya usa `retainContextWhenHidden`.

### 5. El bloque Live es hermano de la lista, no de su scroll

En la vista de Skills, un contenedor en columna lleva `SkillsSection` (sigue con `flex-1` y `overflow-y-auto`) y debajo el bloque Live (`shrink-0`). Rules no monta ese contenedor. La altura del hueco es la de 7 filas; `overflow-hidden` tapa la octava. Cada fila dice `He usado [chip] de [carpeta]`, y a continuación la hora y la fecha de esa activación, más pequeñas y atenuadas. La varita de los chips anteriores va en gris. El chip más reciente, incluida su varita, usa el teal de las skills. Al montarse, la fila crece de arriba abajo (`grid-template-rows` de `0fr` a `1fr`) y pasa de opacidad 0 a opacidad completa, una vez.

Los iconos de los botones son los SVG de `media/`. La varita es `WandIcon`.

Mensajes nuevos, alineados con el contrato:

- Host→Webview `host/liveFeed`: `{ watching, chips: { id, name }[] }`
- Webview→Host `webview/setLiveWatching`: `{ watching }`
- Webview→Host `webview/resetLiveFeed`: sin payload

El host publica la instantánea al arrancar la sesión del webview, al cambiar el flag y al cambiar la lista.

## Risks / Trade-offs

- [El script del hook tarda o sale distinto de 0] → Solo añade una línea, imprime `allow` y sale 0. Sin `failClosed`, un fallo abre la lectura y se pierde ese chip.
- [El bloque adjunto cambia de formato] → Esos chips dejan de nacer. Las lecturas no dependen de ese texto.
- [El tail lee mensajes que contienen el cuerpo de la skill] → Se extraen las rutas y se descarta la línea. El spool y el mensaje al webview no llevan el cuerpo ni la ruta.
- [`hooks.json` del usuario se edita al activar] → La fusión solo inserta la entrada propia. Desinstalar el cambio es quitar esa entrada y los dos scripts de `~/.cursor/hooks/`.
- [Dos ventanas, misma carpeta] → Las dos muestran el chip. No hay id de ventana en el hook.
- [Slug de workspace multi-raíz no sigue la sustitución de barras] → Los adjuntos de esa ventana no entran hasta conocer el directorio. Las lecturas siguen por el hook.
- [Led verde con el hook sin instalar] → El led indica el flag `watching`, no la salud del hook. Si la fusión falla, las lecturas no aparecen y el led puede seguir verde.

## Migration Plan

1. Al activar, escribir el script y fusionar `hooks.json`.
2. Si hay que retirar la función, borrar la entrada cuyo `command` es ese script y borrar el script. Los chips no están en disco.

## Open Questions

Ninguna. La altura queda fijada en 7 chips completos, dentro del «6 o 7» pedido.
