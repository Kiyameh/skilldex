# toggle-enabled Specification

## Purpose

Permitir activar/desactivar Rules y Skills en un clic persistiendo `enabled` en el frontmatter del fichero.

## Requirements

### Requirement: Toggle control on Skill and Rule cards
Each Skill and Rule card SHALL expose a one-click control to toggle enabled state.

#### Scenario: User toggles a skill off
- **WHEN** the user activates the toggle on an enabled Skill card
- **THEN** the Host MUST persist `enabled: false` in that `SKILL.md` frontmatter
- **AND** the card MUST reflect the disabled state after success

#### Scenario: User toggles a rule on
- **WHEN** the user activates the toggle on a disabled Rule card (`enabled: false`)
- **THEN** the Host MUST update the rule file frontmatter so the item is enabled with `enabled: true`
- **AND** the card MUST reflect the enabled state after success

### Requirement: Persistence uses gray-matter round-trip
The Host SHALL read-modify-write frontmatter via `gray-matter` without destroying the Markdown body.

#### Scenario: Body preserved on toggle
- **WHEN** a toggle updates `enabled` on a file that has a Markdown body
- **THEN** the Markdown body content MUST remain intact aside from frontmatter changes

### Requirement: Failure is visible
If persistence fails, the UI SHALL surface an error and MUST NOT claim the new state succeeded.

#### Scenario: Write failure
- **WHEN** the Host fails to write the file during toggle
- **THEN** the Webview MUST show an error indication
- **AND** the card MUST NOT permanently show the failed target state as if saved
