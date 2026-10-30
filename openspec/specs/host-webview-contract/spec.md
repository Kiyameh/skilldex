# host-webview-contract Specification

## Purpose

Congelar el contrato tipado de mensajes Host↔Webview y tipos de dominio compartidos para que los slices posteriores no diverjan.

## Requirements

### Requirement: Shared message discriminated union
The system SHALL define shared TypeScript types for Host→Webview and Webview→Host messages using a discriminant field (e.g. `type`) and typed payloads. The use of `any` for message payloads is forbidden.

#### Scenario: Messages are typed with discriminant
- **WHEN** a developer inspects the shared contract module
- **THEN** Host→Webview and Webview→Host messages MUST be expressible as discriminated unions with typed payloads

### Requirement: Bidirectional handshake stub
The Host and Webview SHALL exchange a verifiable handshake (e.g. ping/pong) using the shared contract over `postMessage` / `onDidReceiveMessage`.

#### Scenario: Webview receives host ping and replies
- **WHEN** the SkillDex panel loads and the Host sends a handshake message
- **THEN** the Webview MUST respond with the matching handshake reply defined in the contract
- **AND** the Host MUST receive that reply without runtime type errors in the shared adapters

### Requirement: Domain item type placeholders
The shared contract SHALL include domain types for Rules and Skills: identifiers, path, kind discriminant `rule` | `skill`, `enabled: boolean` (UI active state), optional `title`, `description`, `globs`, `sections` (rule heading titles), `version` (skill), and `category` (skill first-level folder under `.cursor/skills/`).

#### Scenario: Catalog item shape exists in shared types
- **WHEN** a later change imports shared domain types
- **THEN** it MUST be able to reference a catalog item kind (`rule` or `skill`), filesystem path, display fields including `sections`, `version`, and `category`, and `enabled` boolean without inventing a parallel type system

### Requirement: Catalog payload carries presentation fields
The Host→Webview catalog payload SHALL include, on each item, the fields needed to render this change without a second round-trip: rules expose `sections`; skills expose optional `version` and optional `category`. Toggle request/result messages MAY keep using `enabled` as the UI active boolean; they MUST NOT introduce a second conflicting active-state field in this change.

#### Scenario: Rule item includes sections
- **WHEN** the Host sends a catalog payload containing a rule
- **THEN** that item MUST include a `sections` array of strings

#### Scenario: Skill item includes optional version and category
- **WHEN** the Host sends a catalog payload containing a skill
- **THEN** the item MAY include `version` and `category` as strings when discovery mapped them
- **AND** omitted `version` or `category` MUST be valid

### Requirement: Catalog skill items include characterCount
The shared catalog item type SHALL include an optional `characterCount` number. Host→Webview catalog payloads (including refresh pushes and toggle success items) MUST include `characterCount` on every skill item as a non-negative integer. Rule items MUST omit `characterCount`. The contract MUST NOT include a token-estimate field; the Webview derives tokens from `characterCount`.

#### Scenario: Skill item carries characterCount
- **WHEN** the Host sends a catalog payload containing a skill
- **THEN** that item MUST include `characterCount` as a non-negative integer

#### Scenario: Rule item omits characterCount
- **WHEN** the Host sends a catalog payload containing a rule
- **THEN** that item MUST NOT include `characterCount`

#### Scenario: Toggle success skill keeps characterCount
- **WHEN** the Host replies with a successful toggle result for a skill
- **THEN** the updated item MUST include `characterCount` as a non-negative integer

### Requirement: Catalog request and response messages
The shared contract SHALL define a Webview→Host message to request the catalog and a Host→Webview message that carries the parsed Rules and Skills lists.

#### Scenario: Request catalog message exists
- **WHEN** the Webview needs the current catalog
- **THEN** it MUST send the typed request message defined by the contract
- **AND** the Host MUST respond with a typed catalog payload containing `skills` and `rules` arrays

### Requirement: Toggle request and result messages
The shared contract SHALL define a Webview→Host toggle request (item identity + target enabled state) and a Host→Webview result (success with updated item, or failure with error).

#### Scenario: Toggle round-trip
- **WHEN** the Webview sends a toggle request for a known catalog item
- **THEN** the Host MUST respond with a typed success or failure result message

### Requirement: Open document message
The shared contract SHALL define a Webview→Host message carrying the catalog item identity or filesystem path to open.

#### Scenario: Open request is typed
- **WHEN** the Webview requests opening an item
- **THEN** it MUST send the typed open message from the shared contract

### Requirement: Catalog push on filesystem change
The shared contract SHALL support a Host→Webview catalog update message that can be pushed without an explicit Webview request (reuse or extend the existing catalog payload type).

#### Scenario: Host pushes updated catalog
- **WHEN** the Host finishes refreshing after a filesystem event
- **THEN** it MUST send the typed catalog update message to the Webview

### Requirement: Settings snapshot message
The shared contract SHALL define a Host→Webview message whose discriminant identifies a settings snapshot and whose payload is `showSkills` (boolean), `showRules` (boolean), and `showLiveArea` (boolean). The use of `any` for this payload is forbidden.

#### Scenario: Snapshot fields are typed
- **WHEN** the Host sends the current SkillDex preferences
- **THEN** the message MUST be the settings snapshot defined by the shared contract
- **AND** it MUST include `showSkills`, `showRules`, and `showLiveArea` as booleans

### Requirement: Open settings request message
The shared contract SHALL define a Webview→Host message that asks the Host to open the native settings page. The message MUST NOT carry setting values.

#### Scenario: Open settings request is typed
- **WHEN** the Webview asks to open settings
- **THEN** it MUST send the open-settings message defined by the shared contract

### Requirement: Host pushes a settings snapshot
The Host SHALL send a settings snapshot when the dashboard Webview session starts and whenever a `skilldex` configuration value changes.

#### Scenario: Snapshot when the session starts
- **WHEN** the dashboard Webview session starts
- **THEN** the Host MUST send a settings snapshot with the effective values

#### Scenario: Snapshot after a configuration change
- **WHEN** a `skilldex` configuration value changes while the dashboard Webview session is active
- **THEN** the Host MUST send a new settings snapshot with the effective values

### Requirement: Workspace folder snapshot message
The shared contract SHALL define a Host→Webview message whose discriminant identifies a workspace-folder snapshot. The payload MUST be `folders`, an array of `{ id: string, name: string, path: string }` in workspace order, and `selectedId`, a string equal to one folder `id` or `null` when there are no folders. `id` MUST be the folder URI. `name` MUST be the workspace folder name. `path` MUST be the folder filesystem path. The use of `any` for this payload is forbidden.

#### Scenario: Snapshot fields are typed
- **WHEN** the Host sends the open workspace folders
- **THEN** the message MUST be the workspace-folder snapshot defined by the shared contract
- **AND** each folder MUST include `id`, `name`, and `path` as strings
- **AND** `selectedId` MUST be the `id` of one of those folders or `null`

### Requirement: Select workspace folder message
The shared contract SHALL define a Webview→Host message that asks the Host to select a workspace folder. The payload MUST be the folder `id` string. The message MUST NOT carry catalog items.

#### Scenario: Select request is typed
- **WHEN** the Webview asks to analyze another workspace folder
- **THEN** it MUST send the select-workspace-folder message defined by the shared contract
- **AND** the message MUST include that folder `id`
- **AND** the message MUST NOT include skills or rules

### Requirement: Host pushes a workspace folder snapshot
The Host SHALL send a workspace-folder snapshot when the dashboard Webview session starts, when the set of open workspace folders changes, and when the selected folder changes. On session start, `selectedId` MUST be the last selection stored for that window when that folder is still open; otherwise it MUST be the first open folder, or `null` when none are open. An `id` that is not in `folders` MUST NOT change `selectedId` and MUST NOT replace the catalog.

#### Scenario: Snapshot when the session starts
- **WHEN** the dashboard Webview session starts
- **THEN** the Host MUST send a workspace-folder snapshot for the open workspace folders

#### Scenario: Stored selection is restored
- **WHEN** the session starts, a previous selection was stored for that window, and that folder is still open
- **THEN** `selectedId` MUST be that folder's `id`

#### Scenario: Missing stored selection uses the first folder
- **WHEN** the session starts, there is no stored selection that still matches an open folder, and at least one folder is open
- **THEN** `selectedId` MUST be the `id` of the first workspace folder

#### Scenario: No folder sends a null selection
- **WHEN** the session starts and no workspace folder is open
- **THEN** `folders` MUST be empty
- **AND** `selectedId` MUST be `null`

#### Scenario: Adding a folder keeps the current selection
- **WHEN** a workspace folder is added and the current selection is still open
- **THEN** the Host MUST send a new snapshot that includes the added folder
- **AND** `selectedId` MUST stay the current folder's `id`

#### Scenario: Removing the selected folder falls back to the first
- **WHEN** the selected folder is removed and at least one other folder remains open
- **THEN** the Host MUST send a snapshot whose `selectedId` is the `id` of the first remaining folder

#### Scenario: Unknown id does not switch the catalog
- **WHEN** the Webview sends a select request whose `id` is not one of the open folders
- **THEN** the Host MUST keep the current `selectedId`
- **AND** the Host MUST NOT replace the catalog with items from another folder

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
