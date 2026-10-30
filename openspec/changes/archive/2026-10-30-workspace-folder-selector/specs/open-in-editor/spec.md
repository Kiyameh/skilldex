# Spec Delta

## ADDED Requirements

### Requirement: Open resolves against the selected workspace folder
The Host SHALL resolve an open item id against the selected workspace folder. The native editor MUST open that folder's file and MUST NOT open a file with the same relative id from another open workspace folder.

#### Scenario: Open shows the selected copy
- **WHEN** two open workspace folders each contain `.cursor/rules/sample.mdc`, folder B is selected, and the user chooses Open on that rule
- **THEN** the Host MUST open folder B's `sample.mdc` with `showTextDocument`
- **AND** the Host MUST NOT open folder A's `sample.mdc` for that request
