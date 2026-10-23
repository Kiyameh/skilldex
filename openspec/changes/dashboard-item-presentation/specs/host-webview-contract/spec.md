# Spec Delta

## MODIFIED Requirements

### Requirement: Domain item type placeholders
The shared contract SHALL include domain types for Rules and Skills: identifiers, path, kind discriminant `rule` | `skill`, `enabled: boolean` (UI active state), optional `title`, `description`, `globs`, `sections` (rule heading titles), `version` (skill), and `category` (skill first-level folder under `.cursor/skills/`).

#### Scenario: Catalog item shape exists in shared types
- **WHEN** a later change imports shared domain types
- **THEN** it MUST be able to reference a catalog item kind (`rule` or `skill`), filesystem path, display fields including `sections`, `version`, and `category`, and `enabled` boolean without inventing a parallel type system

## ADDED Requirements

### Requirement: Catalog payload carries presentation fields
The Host→Webview catalog payload SHALL include, on each item, the fields needed to render this change without a second round-trip: rules expose `sections`; skills expose optional `version` and optional `category`. Toggle request/result messages MAY keep using `enabled` as the UI active boolean; they MUST NOT introduce a second conflicting active-state field in this change.

#### Scenario: Rule item includes sections
- **WHEN** the Host sends a catalog payload containing a rule
- **THEN** that item MUST include a `sections` array of strings

#### Scenario: Skill item includes optional version and category
- **WHEN** the Host sends a catalog payload containing a skill
- **THEN** the item MAY include `version` and `category` as strings when discovery mapped them
- **AND** omitted `version` or `category` MUST be valid
