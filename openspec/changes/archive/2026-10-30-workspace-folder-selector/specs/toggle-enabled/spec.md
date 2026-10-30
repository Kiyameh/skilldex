# Spec Delta

## ADDED Requirements

### Requirement: Toggle resolves against the selected workspace folder
The Host SHALL resolve a toggle item id against the selected workspace folder. The write MUST update that folder's file and MUST NOT update a file with the same relative id in another open workspace folder.

#### Scenario: Toggle writes only the selected copy
- **WHEN** two open workspace folders each contain `.cursor/skills/demo/SKILL.md`, folder B is selected, and the user toggles that skill
- **THEN** the Host MUST persist the native activation key in folder B's file
- **AND** folder A's file MUST remain unchanged
