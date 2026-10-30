# Spec Delta

## ADDED Requirements

### Requirement: AI tool directory setting
The extension SHALL contribute `skilldex.ai-tool-directory` as a string setting with default `.cursor` and scope `window`. The value MUST be a directory relative to the selected workspace folder. Rules and skills MUST be discovered, watched, toggled, and opened under that directory. An empty value, an absolute path, or a path that contains `..` MUST be treated as `.cursor`. Changing the setting MUST retarget the watchers to the new directory.

#### Scenario: Default directory is .cursor
- **WHEN** `skilldex.ai-tool-directory` has no user or workspace value
- **THEN** the effective value MUST be `.cursor`

#### Scenario: A relative directory replaces .cursor
- **WHEN** the setting is `.agents` and that folder contains `skills/kept/SKILL.md`
- **THEN** the catalog MUST include that skill
- **AND** a skill that exists only under `.cursor/skills/` MUST NOT be included

#### Scenario: An escaping value falls back
- **WHEN** the stored value is empty, absolute, or contains `..`
- **THEN** the effective directory MUST be `.cursor`
