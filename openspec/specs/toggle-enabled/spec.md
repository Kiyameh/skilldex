# toggle-enabled Specification

## Purpose

Permitir activar/desactivar Rules y Skills en un clic persistiendo las claves nativas de Cursor (`alwaysApply` / `disable-model-invocation`) en el frontmatter del fichero.

## Requirements

### Requirement: Toggle control on Skill and Rule cards
Each Skill and Rule card SHALL expose a one-click control to toggle enabled state. Persistence SHALL use Cursor-native frontmatter keys: Rules write `alwaysApply`; Skills write `disable-model-invocation` (inverted). The Host MUST write the boolean explicitly on both activate and deactivate. Frontmatter `enabled` MUST NOT be written or removed by the toggle.

#### Scenario: User toggles a skill off
- **WHEN** the user activates the toggle on an enabled Skill card
- **THEN** the Host MUST persist `disable-model-invocation: true` in that `SKILL.md` frontmatter
- **AND** the card MUST reflect the disabled state after success

#### Scenario: User toggles a skill on
- **WHEN** the user activates the toggle on a disabled Skill card
- **THEN** the Host MUST persist `disable-model-invocation: false` in that `SKILL.md` frontmatter
- **AND** the card MUST reflect the enabled state after success

#### Scenario: User toggles a rule on
- **WHEN** the user activates the toggle on a disabled Rule card
- **THEN** the Host MUST persist `alwaysApply: true` in that rule file frontmatter
- **AND** the card MUST reflect the enabled state after success

#### Scenario: User toggles a rule off
- **WHEN** the user activates the toggle on an enabled Rule card
- **THEN** the Host MUST persist `alwaysApply: false` in that rule file frontmatter
- **AND** the card MUST reflect the disabled state after success

### Requirement: Persistence uses gray-matter round-trip
The Host SHALL read-modify-write frontmatter via `gray-matter` without destroying the Markdown body. Toggle MUST update only `alwaysApply` (rules) or `disable-model-invocation` (skills) and MUST leave other keys intact, including a leftover `enabled` key if present.

#### Scenario: Body preserved on toggle
- **WHEN** a toggle updates the native activation key on a file that has a Markdown body
- **THEN** the Markdown body content MUST remain intact aside from frontmatter changes

#### Scenario: Leftover enabled key is not rewritten
- **WHEN** a file still contains frontmatter `enabled` and the user toggles the item
- **THEN** the Host MUST NOT add, remove, or change the `enabled` key as part of that write

### Requirement: Failure is visible
If persistence fails, the UI SHALL surface an error and MUST NOT claim the new state succeeded.

#### Scenario: Write failure
- **WHEN** the Host fails to write the file during toggle
- **THEN** the Webview MUST show an error indication
- **AND** the card MUST NOT permanently show the failed target state as if saved

### Requirement: Toggle resolves against the selected workspace folder
The Host SHALL resolve a toggle item id against the selected workspace folder. The write MUST update that folder's file and MUST NOT update a file with the same relative id in another open workspace folder.

#### Scenario: Toggle writes only the selected copy
- **WHEN** two open workspace folders each contain `.cursor/skills/demo/SKILL.md`, folder B is selected, and the user toggles that skill
- **THEN** the Host MUST persist the native activation key in folder B's file
- **AND** folder A's file MUST remain unchanged
