# Spec Delta

## ADDED Requirements

### Requirement: Workspace folder snapshot message
The shared contract SHALL define a Host→Webview message whose discriminant identifies a workspace-folder snapshot. The payload MUST be `folders`, an array of `{ id: string, name: string, path: string }` in workspace order, and `selectedId`, a string equal to one folder `id` or `null` when there are no folders. `id` MUST be the folder URI. `name` MUST be the workspace folder name. `path` MUST be the folder filesystem path. The use of `any` for this payload is forbidden.

#### Scenario: Snapshot fields are typed
- **WHEN** the Host sends the open workspace folders
- **THEN** the message MUST be the workspace-folder snapshot defined by the shared contract
- **AND** each folder MUST include `id`, `name`, and `path` as strings
- **AND** `selectedId` MUST be the `id` of one of those folders or `null`

### Requirement: Select workspace folder message
The shared contract SHALL define a Webview→Host message that asks the Host to select a workspace folder. The payload MUST be the folder `id` string. The message MUST NOT carry catalog items.

#### Scenario: Select request is typed
- **WHEN** the Webview asks to analyze another workspace folder
- **THEN** it MUST send the select-workspace-folder message defined by the shared contract
- **AND** the message MUST include that folder `id`
- **AND** the message MUST NOT include skills or rules

### Requirement: Host pushes a workspace folder snapshot
The Host SHALL send a workspace-folder snapshot when the dashboard Webview session starts, when the set of open workspace folders changes, and when the selected folder changes. On session start, `selectedId` MUST be the last selection stored for that window when that folder is still open; otherwise it MUST be the first open folder, or `null` when none are open. An `id` that is not in `folders` MUST NOT change `selectedId` and MUST NOT replace the catalog.

#### Scenario: Snapshot when the session starts
- **WHEN** the dashboard Webview session starts
- **THEN** the Host MUST send a workspace-folder snapshot for the open workspace folders

#### Scenario: Stored selection is restored
- **WHEN** the session starts, a previous selection was stored for that window, and that folder is still open
- **THEN** `selectedId` MUST be that folder's `id`

#### Scenario: Missing stored selection uses the first folder
- **WHEN** the session starts, there is no stored selection that still matches an open folder, and at least one folder is open
- **THEN** `selectedId` MUST be the `id` of the first workspace folder

#### Scenario: No folder sends a null selection
- **WHEN** the session starts and no workspace folder is open
- **THEN** `folders` MUST be empty
- **AND** `selectedId` MUST be `null`

#### Scenario: Adding a folder keeps the current selection
- **WHEN** a workspace folder is added and the current selection is still open
- **THEN** the Host MUST send a new snapshot that includes the added folder
- **AND** `selectedId` MUST stay the current folder's `id`

#### Scenario: Removing the selected folder falls back to the first
- **WHEN** the selected folder is removed and at least one other folder remains open
- **THEN** the Host MUST send a snapshot whose `selectedId` is the `id` of the first remaining folder

#### Scenario: Unknown id does not switch the catalog
- **WHEN** the Webview sends a select request whose `id` is not one of the open folders
- **THEN** the Host MUST keep the current `selectedId`
- **AND** the Host MUST NOT replace the catalog with items from another folder
