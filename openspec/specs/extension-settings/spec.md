# extension-settings Specification

## Purpose

Declarar las preferencias de SkillDex en la configuración nativa de Cursor y abrir esa página desde el panel.

## Requirements

### Requirement: Native SkillDex settings
The extension SHALL contribute a SkillDex configuration group with three visibility properties, in this order: `skilldex.showSkills` (boolean, default `true`, scope `application`, description `Muestra la sección de Skills en el panel de SkillDex.`), `skilldex.showRules` (boolean, default `true`, scope `application`, description `Muestra la sección de Rules en el panel de SkillDex.`), and `skilldex.showLiveArea` (boolean, default `true`, scope `application`, description `Muestra el área Live en el panel de Skills de SkillDex.`).

#### Scenario: Defaults when unset
- **WHEN** the three properties have no user or workspace value
- **THEN** `skilldex.showSkills` MUST be `true`
- **AND** `skilldex.showRules` MUST be `true`
- **AND** `skilldex.showLiveArea` MUST be `true`

#### Scenario: Visibility settings ignore workspace values
- **WHEN** a workspace settings file sets `skilldex.showSkills`, `skilldex.showRules`, or `skilldex.showLiveArea`
- **THEN** the effective value MUST remain the user-level value
- **AND** the workspace value MUST NOT hide or show a section

### Requirement: Invalid setting values fall back to defaults
A non-boolean value for `skilldex.showSkills`, `skilldex.showRules`, or `skilldex.showLiveArea` MUST be treated as `true`.

#### Scenario: Non-boolean visibility falls back to shown
- **WHEN** the stored value of `skilldex.showSkills` is not a boolean
- **THEN** the effective value MUST be `true`

### Requirement: Open the native settings page
When the Webview requests it, the extension SHALL open the editor Settings UI filtered with the query `@ext:andoni.skilldex`.

#### Scenario: Settings open filtered to SkillDex
- **WHEN** the Webview sends the open-settings request
- **THEN** the native Settings UI MUST open with the query `@ext:andoni.skilldex`

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
