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
The shared contract SHALL include domain types sufficient for later catalog slices (at least identifiers for Rules and Skills, path, kind discriminant `rule` | `skill`, and `enabled: boolean`), even if discovery is not yet implemented.

#### Scenario: Catalog item shape exists in shared types
- **WHEN** a later change imports shared domain types
- **THEN** it MUST be able to reference a catalog item kind (`rule` or `skill`), filesystem path, display fields placeholders, and `enabled` boolean without inventing a parallel type system
