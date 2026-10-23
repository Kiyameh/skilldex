# Spec Delta

## ADDED Requirements

### Requirement: Skill characterCount from primary SKILL.md
The Host SHALL set `characterCount` on each skill catalog item to the number of Unicode code points in the entire primary `SKILL.md` file contents (YAML frontmatter and Markdown body). The Host MUST NOT include bytes or characters from auxiliary files in the skill folder. The Host MUST NOT set `characterCount` on rule catalog items.

#### Scenario: Full SKILL.md is counted
- **WHEN** a skill’s `SKILL.md` contains frontmatter and a Markdown body whose combined Unicode code-point length is 1024
- **THEN** the catalog item `characterCount` MUST be `1024`

#### Scenario: Empty file still counts
- **WHEN** a skill’s `SKILL.md` has a Unicode code-point length of 0
- **THEN** the catalog item `characterCount` MUST be `0`

#### Scenario: Auxiliary files are excluded
- **WHEN** a skill folder contains `SKILL.md` and additional files
- **THEN** `characterCount` MUST equal the code-point length of `SKILL.md` only

#### Scenario: Rules omit characterCount
- **WHEN** the Host maps a rule catalog item
- **THEN** that item MUST NOT include `characterCount`
