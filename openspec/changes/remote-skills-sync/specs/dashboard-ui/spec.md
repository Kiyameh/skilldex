# Spec Delta

## ADDED Requirements

### Requirement: Remote repository footer
The dashboard SHALL show a footer below the catalog (or below the raccoon empty state) that stays pinned to the bottom of the SkillDex panel. The footer MUST remain visible while the catalog is waiting. The footer MUST NOT replace the Skills or Rules sections.

#### Scenario: Footer sits below the catalog
- **WHEN** the dashboard renders a catalog
- **THEN** a remote-repository footer MUST appear below the Skills and Rules content
- **AND** the footer MUST stay visible without scrolling the catalog out of the panel chrome

#### Scenario: Footer remains when both sections are hidden
- **WHEN** both section preferences are disabled and the raccoon empty state is shown
- **THEN** the remote-repository footer MUST still be visible below that empty state

### Requirement: Unconfigured remote warning
When the settings snapshot has an empty `remoteSkillsRepositoryUrl`, the footer SHALL show the text `No hay un repo configurado` and a control named `Ir a la config` that requests opening settings. The footer MUST NOT show a `Pull` button in this state.

#### Scenario: Empty URL shows the warning and settings link
- **WHEN** `remoteSkillsRepositoryUrl` is empty
- **THEN** the footer MUST show `No hay un repo configurado`
- **AND** it MUST show a control named `Ir a la config`
- **AND** it MUST NOT show a button named `Pull`

#### Scenario: Warning control opens settings
- **WHEN** the user activates `Ir a la config` in the footer
- **THEN** the Webview MUST send the open-settings request

### Requirement: Configured remote status and pull
When `remoteSkillsRepositoryUrl` is non-empty, the footer SHALL show that URL, the current remote status in Spanish, and a button named `Pull`. The `Pull` button MUST be enabled only when the status is behind. Activating `Pull` MUST send the pull request. Status copy SHALL be: `Comprobando…`; `Al día`; `Hay actualizaciones`; `Hay cambios locales sin confirmar`; `Este directorio no es un repositorio git`; `El origin no coincide con la URL configurada`; or `Error: ` followed by the host error text.

#### Scenario: Behind enables Pull
- **WHEN** the Host reports behind status
- **THEN** the footer MUST show `Hay actualizaciones`
- **AND** the `Pull` button MUST be enabled

#### Scenario: Pull sends the request
- **WHEN** the user activates `Pull` while it is enabled
- **THEN** the Webview MUST send the pull request defined by the contract

#### Scenario: Up to date disables Pull
- **WHEN** the Host reports up to date status
- **THEN** the footer MUST show `Al día`
- **AND** the `Pull` button MUST be present and disabled

#### Scenario: Checking
- **WHEN** the Host reports checking status
- **THEN** the footer MUST show `Comprobando…`
- **AND** the `Pull` button MUST be disabled
