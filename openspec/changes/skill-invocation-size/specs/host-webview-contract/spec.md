# Spec Delta

## ADDED Requirements

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
