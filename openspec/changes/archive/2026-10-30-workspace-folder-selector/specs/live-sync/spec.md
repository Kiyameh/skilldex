# Spec Delta

## ADDED Requirements

### Requirement: Watchers follow the selected workspace folder
The Host SHALL watch `.cursor/rules/` and `.cursor/skills/` of the selected workspace folder only. When the selection changes, the Host MUST stop applying filesystem events from the previous folder and MUST watch the newly selected folder. A create, change, or delete under another open workspace folder MUST NOT change the catalog shown for the selected folder.

#### Scenario: An edit in the selected folder refreshes that catalog
- **WHEN** a watched skill or rule file under the selected folder changes
- **THEN** the Host MUST push a catalog discovered from that same folder

#### Scenario: An edit in another open folder is ignored
- **WHEN** a `.cursor` file changes in an open workspace folder that is not selected
- **THEN** the catalog shown for the selected folder MUST NOT change because of that event

#### Scenario: Switching folder drops the previous watch
- **WHEN** the selected folder changes from A to B and a watched file under A then changes
- **THEN** that change MUST NOT update the catalog
- **AND** a later change under B's `.cursor/rules/` or `.cursor/skills/` MUST refresh the catalog from B
