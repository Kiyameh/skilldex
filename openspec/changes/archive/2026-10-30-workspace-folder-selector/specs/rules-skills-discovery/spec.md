# Spec Delta

## ADDED Requirements

### Requirement: Discovery uses the selected workspace folder
The Host SHALL discover rules and skills only under the selected workspace folder's configured AI tool directory (`skilldex.ai-tool-directory`, default `.cursor`). Other open workspace folders MUST NOT contribute catalog items. A missing `.cursor/rules` or `.cursor/skills` tree under the selected folder MUST yield an empty list for that kind. Catalog item ids MUST stay relative to the selected folder. The Host MUST NOT scan `.cursor` trees nested outside that folder's own `.cursor/` directory.

#### Scenario: Only the selected folder is catalogued
- **WHEN** workspace folder A contains `.cursor/skills/alpha/SKILL.md` and workspace folder B contains `.cursor/skills/beta/SKILL.md`, and B is selected
- **THEN** the catalog MUST include the skill from B
- **AND** the catalog MUST NOT include the skill from A

#### Scenario: A folder without .cursor yields an empty catalog
- **WHEN** the selected workspace folder has neither `.cursor/rules` nor `.cursor/skills`
- **THEN** the catalog `skills` list MUST be empty
- **AND** the catalog `rules` list MUST be empty

#### Scenario: The same relative id stays tied to the selected folder
- **WHEN** two open folders each contain `.cursor/skills/demo/SKILL.md` and one of them is selected
- **THEN** the catalog item id MUST be `.cursor/skills/demo/SKILL.md`
- **AND** the catalog item path MUST be the file inside the selected folder

#### Scenario: Nested .cursor trees are not a choice
- **WHEN** the selected folder's `.cursor/` tree is empty and a descendant directory contains its own `.cursor/skills/other/SKILL.md`
- **THEN** that nested skill MUST NOT appear in the catalog
