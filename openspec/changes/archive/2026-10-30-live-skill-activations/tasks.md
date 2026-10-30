# Tasks

## 1. Contrato del feed

- [x] 1.1 Añadir `host/liveFeed`, `webview/setLiveWatching` y `webview/resetLiveFeed` al contrato compartido, con `watching` y `chips` de `{ id, name }`, y verificar que los type guards aceptan esos mensajes y rechazan `any` implícito, payload de reinicio y chips dentro de los mensajes de control

## 2. Lista y relojes puros

- [x] 2.1 Implementar el reducer del feed (prepend, nombres repetidos, pausa que descarta, reanudación sin relleno, reinicio que vacía y conserva `watching`) y verificar los casos con tests unitarios
- [x] 2.2 Resolver el nombre visible por ruta absoluta contra el catálogo, y por el directorio padre si no hay tarjeta, y verificar ambos con tests unitarios
- [x] 2.3 Extraer solo los `Path` de un bloque de skills adjuntas, ignorar el cuerpo y las líneas `Read` del transcript, y verificarlo con tests unitarios sobre fixtures de texto
- [x] 2.4 Interpretar una línea de hook: aceptar basename `SKILL.md` y descartar el resto, y verificarlo con tests unitarios

## 3. Hook de usuario

- [x] 3.1 Fusionar la entrada `beforeReadFile` en un `hooks.json` temporal, conservando las demás entradas y sin duplicar la propia al repetir la fusión, y verificarlo con un test que use un directorio temporal
- [x] 3.2 Hacer que el script responda `{"permission":"allow"}` y salga 0 tanto si el fichero es `SKILL.md` como si no lo es o el stdin no es JSON; solo el caso `SKILL.md` añade una línea al spool. Verificarlo ejecutando el script contra un spool temporal

## 4. Intake en el host

- [x] 4.1 Aceptar líneas del spool solo cuando `workspace_roots` corta con las carpetas abiertas de la ventana, y verificar con tests unitarios que otra ventana no añade chip
- [x] 4.2 Hacer tail del transcript del slug de cada carpeta abierta, añadir un chip por `Path` adjunto y no añadir nada ante un `Read` del mismo `.jsonl`, y verificarlo con un jsonl temporal
- [x] 4.3 Al pausar, dejar el offset al final y no reinyectar lo ocurrido en la pausa; al reiniciar, vaciar chips sin rebobinar. Verificar ambos con tests del intake
- [x] 4.4 Publicar `host/liveFeed` al arrancar la sesión del webview con `watching: true` y `chips: []`, y tras parar, reanudar o reiniciar, y verificarlo en el adaptador de mensajes del host

## 5. Bloque Live en el panel de Skills

- [x] 5.1 Montar Live debajo de la lista scrolleable, dentro del mismo contenedor, solo cuando Skills está visible, y verificar con tests de UI que Rules y Skills oculto no lo muestran y que la lista conserva su scroll
- [x] 5.2 Pintar título, led (`Live en marcha` / `Live parado`), botones con los SVG y nombres accesibles, chips en píldora con `WandIcon`, el más nuevo arriba, parpadeo solo al insertarse, y un hueco que muestra 7 chips y oculta el octavo. Verificarlo con tests de UI
- [x] 5.3 Hacer que parar/reanudar envíe `webview/setLiveWatching` y que reiniciar envíe `webview/resetLiveFeed`, y verificarlo con tests de UI
