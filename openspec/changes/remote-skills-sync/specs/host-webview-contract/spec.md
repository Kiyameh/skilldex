# Spec Delta

## ADDED Requirements

### Requirement: Settings snapshot includes sync fields
The settings snapshot payload SHALL include `localSkillsRepositoryPath` (string) and `updateCommand` (string) in addition to `showSkills`, `showRules`, and `remoteSkillsRepositoryUrl`. The use of `any` for this payload is forbidden.

#### Scenario: Snapshot carries the five preference fields
- **WHEN** the Host sends the current SkillDex preferences
- **THEN** the message MUST include `showSkills` and `showRules` as booleans
- **AND** it MUST include `remoteSkillsRepositoryUrl`, `localSkillsRepositoryPath`, and `updateCommand` as strings

### Requirement: Remote status message
The shared contract SHALL define a Host→Webview message whose discriminant identifies remote-repository status. The payload MUST include `status` as one of `unconfigured`, `checking`, `upToDate`, `behind`, `dirty`, `notGit`, `originMismatch`, `error`, plus `remoteUrl` (string) and optional `error` (string). The use of `any` for this payload is forbidden.

#### Scenario: Behind status is typed
- **WHEN** the Host reports that the local checkout is behind the remote
- **THEN** the message MUST use `status` `behind`
- **AND** `remoteUrl` MUST be the effective configured URL

#### Scenario: Unconfigured status is typed
- **WHEN** the effective remote URL is empty
- **THEN** the message MUST use `status` `unconfigured`

### Requirement: Pull request and result messages
The shared contract SHALL define a Webview→Host pull request with no payload and a Host→Webview pull result that is success (`ok: true`) or failure (`ok: false` and `error` string). The use of `any` for these payloads is forbidden.

#### Scenario: Pull request is typed
- **WHEN** the Webview asks to pull
- **THEN** it MUST send the pull request defined by the shared contract

#### Scenario: Pull failure is typed
- **WHEN** the Host cannot complete a pull
- **THEN** it MUST send a pull result with `ok` false and a non-empty `error` string

### Requirement: Host pushes remote status
The Host SHALL send a remote status message when the dashboard Webview session starts, whenever a `skilldex` configuration value that affects sync changes, and after a pull result.

#### Scenario: Status when the session starts
- **WHEN** the dashboard Webview session starts
- **THEN** the Host MUST send a remote status message

#### Scenario: Status after a configuration change
- **WHEN** `skilldex.remoteSkillsRepositoryUrl`, `skilldex.localSkillsRepositoryPath`, or `skilldex.updateCommand` changes while the session is active
- **THEN** the Host MUST send a new remote status message
