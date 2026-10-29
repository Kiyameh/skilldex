# Spec Delta

## ADDED Requirements

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
