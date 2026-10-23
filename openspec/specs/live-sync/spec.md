# live-sync Specification

## Purpose

Mantener el dashboard sincronizado con cambios en disco bajo `.cursor/rules/` y `.cursor/skills/` mediante FileSystemWatcher.

## Requirements

### Requirement: Watch rules and skills paths
The Host SHALL register filesystem watchers covering `.cursor/rules/` and `.cursor/skills/` (including nested skill `SKILL.md` paths).

#### Scenario: Watchers registered on activate
- **WHEN** the SkillDex extension is active with a workspace folder
- **THEN** FileSystemWatchers MUST be registered for the Rules and Skills roots under `.cursor/`

### Requirement: External changes refresh catalog
When watched files are created, changed, or deleted, the Host SHALL refresh discovery/parse and push an updated catalog to the Webview.

#### Scenario: External edit updates card
- **WHEN** a user edits a Skill `description` in the native editor and saves
- **THEN** the Webview Skills section MUST update to show the new description without requiring a manual panel reload

#### Scenario: External delete removes card
- **WHEN** a watched Rule file is deleted on disk
- **THEN** that Rule MUST disappear from the Rules section after the Host processes the event

### Requirement: Debounce rapid events
The Host SHALL debounce or coalesce rapid watcher events to avoid UI thrashing.

#### Scenario: Burst of events yields stable refresh
- **WHEN** multiple filesystem events fire in quick succession for the watched trees
- **THEN** the Host MUST still deliver a coherent catalog update to the Webview (not unbounded per-event storms)

### Requirement: Dispose watchers on deactivate
Watchers SHALL be disposed when the extension deactivates or the panel lifecycle requires cleanup per design.

#### Scenario: Deactivate cleans watchers
- **WHEN** the extension deactivates
- **THEN** registered FileSystemWatchers MUST be disposed
