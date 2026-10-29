# extension-settings Specification

## Purpose

Declarar las preferencias de SkillDex en la configuración nativa de Cursor, abrir esa página desde el panel y guardar la URL del repositorio remoto sin usarla en el descubrimiento.

## Requirements

### Requirement: Native SkillDex settings
The extension SHALL contribute a SkillDex configuration group with three properties, in this order: `skilldex.showSkills` (boolean, default `true`, scope `application`, description `Muestra la sección de Skills en el panel de SkillDex.`), `skilldex.showRules` (boolean, default `true`, scope `application`, description `Muestra la sección de Rules en el panel de SkillDex.`), and `skilldex.remoteSkillsRepositoryUrl` (string, default `""`, scope `window`, description `URL del repositorio remoto de skills. SkillDex la guarda y todavía no la usa.`).

#### Scenario: Defaults when unset
- **WHEN** the three properties have no user or workspace value
- **THEN** `skilldex.showSkills` MUST be `true`
- **AND** `skilldex.showRules` MUST be `true`
- **AND** `skilldex.remoteSkillsRepositoryUrl` MUST be an empty string

#### Scenario: Visibility settings ignore workspace values
- **WHEN** a workspace settings file sets `skilldex.showSkills` or `skilldex.showRules`
- **THEN** the effective value MUST remain the user-level value
- **AND** the workspace value MUST NOT hide or show a section

#### Scenario: URL accepts a workspace value
- **WHEN** the user sets `skilldex.remoteSkillsRepositoryUrl` in workspace settings
- **THEN** the effective value MUST be that workspace string

### Requirement: Invalid setting values fall back to defaults
A non-boolean value for `skilldex.showSkills` or `skilldex.showRules` MUST be treated as `true`. A non-string value for `skilldex.remoteSkillsRepositoryUrl` MUST be treated as `""`.

#### Scenario: Non-boolean visibility falls back to shown
- **WHEN** the stored value of `skilldex.showSkills` is not a boolean
- **THEN** the effective value MUST be `true`

#### Scenario: Non-string URL falls back to empty
- **WHEN** the stored value of `skilldex.remoteSkillsRepositoryUrl` is not a string
- **THEN** the effective value MUST be `""`

### Requirement: Open the native settings page
When the Webview requests it, the extension SHALL open the editor Settings UI filtered with the query `@ext:andoni.skilldex`.

#### Scenario: Settings open filtered to SkillDex
- **WHEN** the Webview sends the open-settings request
- **THEN** the native Settings UI MUST open with the query `@ext:andoni.skilldex`

### Requirement: Remote URL does not affect discovery
The extension SHALL persist `skilldex.remoteSkillsRepositoryUrl` and MUST NOT use it when discovering the local `.cursor/` catalog.

#### Scenario: Changing the URL leaves the catalog unchanged
- **WHEN** `skilldex.remoteSkillsRepositoryUrl` changes
- **THEN** the discovered skills and rules MUST stay those of the local `.cursor/` tree
- **AND** reading the property back MUST return the stored string
