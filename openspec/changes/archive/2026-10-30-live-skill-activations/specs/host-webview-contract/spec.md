# Spec Delta

## ADDED Requirements

### Requirement: Live feed snapshot message
El contrato compartido SHALL definir un mensaje Host→Webview cuyo discriminante identifique la instantánea del feed Live. El payload MUST ser `watching` (boolean) y `chips`, un array ordenado del más reciente al más antiguo. Cada chip MUST ser `{ id: string, name: string, workspaceName: string, activatedAt: string }`. `id` MUST identificar esa activación y MUST NOT reutilizarse para otra. `name` MUST ser el texto visible del chip. `workspaceName` MUST ser el nombre de la carpeta de trabajo, sin la ruta. `activatedAt` MUST ser el instante de esa activación en ISO 8601. El uso de `any` en este payload está prohibido. El mensaje MUST NOT incluir el cuerpo de la skill ni la ruta del fichero.

#### Scenario: Snapshot shape
- **WHEN** el Host publica el feed Live
- **THEN** el mensaje MUST incluir `watching` y `chips`
- **AND** cada elemento de `chips` MUST incluir `id`, `name`, `workspaceName` y `activatedAt`
- **AND** el primer elemento MUST ser el chip más reciente

### Requirement: Live feed control messages
El contrato compartido SHALL definir tres mensajes Webview→Host. Uno MUST pedir el estado del watcher con payload `watching` (boolean). Otro MUST pedir vaciar el feed y MUST NOT llevar payload. Otro MUST pedir abrir el `SKILL.md` de una activación con payload `id` (string), el id del chip, y MUST NOT llevar la ruta. Ninguno de los tres MUST incluir chips ni ítems de catálogo. El uso de `any` está prohibido.

#### Scenario: Watching request
- **WHEN** el Webview pide parar o reanudar el watcher
- **THEN** el mensaje MUST llevar `watching` con el estado pedido

#### Scenario: Reset request
- **WHEN** el Webview pide reiniciar el feed
- **THEN** el mensaje MUST NOT llevar payload

#### Scenario: Open request
- **WHEN** el Webview pide abrir el documento de una activación
- **THEN** el mensaje MUST llevar el `id` de ese chip
- **AND** MUST NOT llevar la ruta del fichero

### Requirement: Host publishes the live feed on session start and on change
El Host SHALL enviar la instantánea del feed Live al empezar la sesión del Webview, al cambiar `watching` y al cambiar la lista de chips. En el arranque de la sesión `watching` MUST ser `true` y `chips` MUST ser un array vacío. Tras un reinicio, `chips` MUST ser un array vacío y `watching` MUST conservar el valor anterior.

#### Scenario: Session start snapshot
- **WHEN** empieza la sesión del Webview
- **THEN** el Host MUST enviar una instantánea con `watching` verdadero y `chips` vacío

#### Scenario: Reset snapshot keeps watching
- **WHEN** el Webview pide reiniciar el feed con el watcher en marcha
- **THEN** el Host MUST responder con `chips` vacío y `watching` verdadero
