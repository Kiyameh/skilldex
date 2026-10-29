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
The shared contract SHALL define a Host→Webview message whose discriminant identifies a settings snapshot and whose payload is `showSkills` (boolean), `showRules` (boolean), and `remoteSkillsRepositoryUrl` (string). The use of `any` for this payload is forbidden.

#### Scenario: Snapshot fields are typed
- **WHEN** the Host sends the current SkillDex preferences
- **THEN** the message MUST be the settings snapshot defined by the shared contract
- **AND** it MUST include `showSkills` and `showRules` as booleans and `remoteSkillsRepositoryUrl` as a string

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
