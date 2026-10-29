# Spec Delta

## MODIFIED Requirements

### Requirement: Two differentiated sections
When both section preferences are enabled, the Webview SHALL present two clearly differentiated sections: Skills and Rules. The Skills section SHALL be visually primary (appears first / emphasized) and a tab list MUST be present. When only one section preference is enabled, the Webview SHALL present only that section and MUST NOT show a tab list. A section whose preference is disabled MUST NOT be rendered.

#### Scenario: Skills section appears before Rules
- **WHEN** both section preferences are enabled and the dashboard renders a catalog
- **THEN** the Skills section MUST be distinguishable from the Rules section
- **AND** the Skills section MUST appear before the Rules section
- **AND** a tab list MUST be present

#### Scenario: Only the skills section is visible
- **WHEN** the skills preference is enabled, the rules preference is disabled, and a catalog is available
- **THEN** the Skills section MUST be shown
- **AND** the Rules section MUST NOT be rendered
- **AND** a tab list MUST NOT be shown

#### Scenario: Only the rules section is visible
- **WHEN** the rules preference is enabled, the skills preference is disabled, and a catalog is available
- **THEN** the Rules section MUST be shown
- **AND** the Skills section MUST NOT be rendered
- **AND** a tab list MUST NOT be shown

### Requirement: Empty states per section
Each visible section SHALL show an empty state when its list is empty. A hidden section MUST NOT show its empty state.

#### Scenario: No skills yet
- **WHEN** the Skills section is visible and the catalog contains zero skills
- **THEN** the Skills section MUST show an empty-state message (not a blank void)

#### Scenario: Hidden skills section skips its empty state
- **WHEN** the Skills section is hidden and the catalog contains zero skills
- **THEN** the Skills empty-state message MUST NOT be rendered

## ADDED Requirements

### Requirement: Settings button in the header
The dashboard header SHALL include a button that shows the settings-2 icon and requests opening settings. Its accessible name MUST be `Configuración`. The button MUST stay available when both sections are hidden.

#### Scenario: Header button requests settings
- **WHEN** the user activates the header settings button
- **THEN** the Webview MUST send the open-settings request

#### Scenario: Header button remains when both sections are hidden
- **WHEN** both section preferences are disabled
- **THEN** the header settings button MUST still be present

### Requirement: Empty state when both sections are hidden
When both section preferences are disabled and a settings snapshot has been received, the dashboard MUST NOT render the Skills or Rules sections. It SHALL show the text `No tienes ningún panel seleccionado, así que toma un mapache :D`, the raccoon image at 160 CSS pixels wide with accessible name `Mapache`, and a button labeled `Ir a la config` that requests opening settings.

#### Scenario: Both hidden shows the raccoon empty state
- **WHEN** both section preferences are disabled and a settings snapshot has been received
- **THEN** the dashboard MUST show the text `No tienes ningún panel seleccionado, así que toma un mapache :D`
- **AND** it MUST show the raccoon image with accessible name `Mapache` at 160 CSS pixels wide
- **AND** it MUST show a button named `Ir a la config`
- **AND** it MUST NOT render the Skills or Rules sections

#### Scenario: Empty-state button requests settings
- **WHEN** the user activates `Ir a la config`
- **THEN** the Webview MUST send the open-settings request

### Requirement: Sections render only after a settings snapshot
The dashboard MUST NOT render the Skills or Rules sections until it has received a settings snapshot. A later snapshot MUST update which sections are visible without reloading the panel.

#### Scenario: Catalog before settings does not show sections
- **WHEN** a catalog arrives and no settings snapshot has arrived
- **THEN** the Skills and Rules sections MUST NOT be rendered

#### Scenario: A later snapshot hides Rules
- **WHEN** both sections are visible and a later settings snapshot disables Rules
- **THEN** the Rules section MUST no longer be rendered
- **AND** the Skills section MUST remain visible
- **AND** a tab list MUST NOT be shown
