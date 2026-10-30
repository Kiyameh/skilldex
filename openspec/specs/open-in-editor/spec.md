# open-in-editor Specification

## Purpose

Abrir Rules y Skills en el editor nativo de VS Code desde las cards del dashboard.

## Requirements

### Requirement: Open action opens native editor
Choosing Open on a Skill or Rule card SHALL open the corresponding file in the native VS Code editor via `vscode.window.showTextDocument`.

#### Scenario: Open skill file
- **WHEN** the user chooses Open on a Skill card
- **THEN** the Host MUST open that skill’s `SKILL.md` path with `showTextDocument`

#### Scenario: Open rule file
- **WHEN** the user chooses Open on a Rule card
- **THEN** the Host MUST open that rule file path with `showTextDocument`

### Requirement: No Webview WYSIWYG editor
The system SHALL NOT provide an in-Webview rich Markdown editor for editing Rule/Skill bodies.

#### Scenario: Editing stays native
- **WHEN** the user wants to edit content after Open
- **THEN** editing MUST occur in the native VS Code text editor, not a WYSIWYG surface inside the Webview

### Requirement: Open resolves against the selected workspace folder
The Host SHALL resolve an open item id against the selected workspace folder. The native editor MUST open that folder's file and MUST NOT open a file with the same relative id from another open workspace folder.

#### Scenario: Open shows the selected copy
- **WHEN** two open workspace folders each contain `.cursor/rules/sample.mdc`, folder B is selected, and the user chooses Open on that rule
- **THEN** the Host MUST open folder B's `sample.mdc` with `showTextDocument`
- **AND** the Host MUST NOT open folder A's `sample.mdc` for that request
