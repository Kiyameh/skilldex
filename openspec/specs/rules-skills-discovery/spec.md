# rules-skills-discovery Specification

## Purpose

Descubrir y parsear Rules y Skills bajo `.cursor/` y exponer un catálogo tipado al Webview (Skills como foco principal).

## Requirements

### Requirement: Discover Rules under .cursor/rules
The Host SHALL discover rule files with extensions `.mdc` or `.md` located under the workspace `.cursor/rules/` directory (non-recursive or recursive as documented in design; default: files directly in that folder and nested if present).

#### Scenario: Rule files are listed
- **WHEN** the workspace contains `.cursor/rules/example.mdc`
- **THEN** the discovery result MUST include a catalog item of kind `rule` for that file

### Requirement: Discover Skills via SKILL.md
The Host SHALL discover Skills by locating `SKILL.md` files under `.cursor/skills/` (including nested skill folders).

#### Scenario: Skill file is listed
- **WHEN** the workspace contains `.cursor/skills/my-skill/SKILL.md`
- **THEN** the discovery result MUST include a catalog item of kind `skill` for that file

### Requirement: Parse frontmatter with gray-matter
The Host SHALL parse YAML frontmatter using `gray-matter` and map habitual metadata into catalog items, including rule `sections` from the Markdown body, skill `version` from `metadata.version`, and skill `category` from the path under `.cursor/skills/`.

#### Scenario: Skill habitual metadata is mapped
- **WHEN** a `SKILL.md` has frontmatter `name` and `description`
- **THEN** the catalog item MUST expose those values as the skill’s primary display metadata

#### Scenario: Rule habitual metadata is mapped
- **WHEN** a rule file has frontmatter description/title fields and optional `globs`
- **THEN** the catalog item MUST expose display title and `globs` (empty list if absent)
- **AND** the catalog item MUST expose `sections` parsed from the body

### Requirement: Extract rule sections from ATX h2 headings
The Host SHALL parse the Markdown body of each rule file (after frontmatter) and expose as `sections` the text of ATX headings that start with exactly `##`. Headings inside fenced code blocks MUST be ignored. Headings at other levels (`#`, `###`, and deeper) MUST NOT be included.

#### Scenario: H2 headings become sections
- **WHEN** a rule body contains `## Alpha` and `## Beta` outside code fences
- **THEN** the catalog item `sections` MUST be `["Alpha", "Beta"]` in document order

#### Scenario: Headings inside fences are ignored
- **WHEN** a rule body contains an h2 only inside a fenced code block
- **THEN** that heading MUST NOT appear in `sections`

#### Scenario: Only exact h2 counts
- **WHEN** a rule body contains `# Title` and `### Nested` and no `##` headings
- **THEN** the catalog item `sections` MUST be an empty list

### Requirement: Skill version comes from metadata.version
The Host SHALL map a skill’s display version only from frontmatter `metadata.version` when that value is a string. Top-level `version` MUST be ignored. If `metadata.version` is absent or not a string, the catalog item MUST omit `version`.

#### Scenario: Nested metadata version is mapped
- **WHEN** a `SKILL.md` has frontmatter `metadata.version` set to the string `1.0.0`
- **THEN** the catalog item MUST expose `version` as `1.0.0`

#### Scenario: Top-level version is ignored
- **WHEN** a `SKILL.md` has top-level `version` and no string `metadata.version`
- **THEN** the catalog item MUST omit `version`

### Requirement: Skill category from first skills subdirectory
The Host SHALL set a skill’s `category` to the first path segment under `.cursor/skills/` when the `SKILL.md` lives at least one directory deeper than that segment. A skill whose folder sits directly under `.cursor/skills/` MUST omit `category` (uncategorized). Discovery MUST NOT sort files; order MUST follow the filesystem walk.

#### Scenario: Nested skill is categorized
- **WHEN** a skill exists at `.cursor/skills/stack/react/react-conventions/SKILL.md`
- **THEN** the catalog item `category` MUST be `stack`

#### Scenario: Root skill is uncategorized
- **WHEN** a skill exists at `.cursor/skills/openspec-explore/SKILL.md`
- **THEN** the catalog item MUST omit `category`

### Requirement: Catalog enabled maps from Cursor-native keys
Catalog `enabled` SHALL be derived from Cursor-native keys, not from frontmatter `enabled` (that key MUST be ignored if present).

A Rule SHALL be enabled only when `alwaysApply` is exactly `true`. If `alwaysApply` is omitted, `false`, or any non-`true` value, the Rule MUST be disabled.

A Skill SHALL be disabled only when `disable-model-invocation` is exactly `true`. If that key is omitted, `false`, or any non-`true` value, the Skill MUST be enabled.

#### Scenario: Missing alwaysApply means inactive rule
- **WHEN** a Rule frontmatter omits `alwaysApply`
- **THEN** the catalog item `enabled` MUST be `false`

#### Scenario: alwaysApply true means active rule
- **WHEN** a Rule frontmatter sets `alwaysApply: true`
- **THEN** the catalog item `enabled` MUST be `true`

#### Scenario: Missing disable-model-invocation means active skill
- **WHEN** a Skill frontmatter omits `disable-model-invocation`
- **THEN** the catalog item `enabled` MUST be `true`

#### Scenario: disable-model-invocation true means inactive skill
- **WHEN** a Skill frontmatter sets `disable-model-invocation: true`
- **THEN** the catalog item `enabled` MUST be `false`

#### Scenario: Legacy enabled key is ignored
- **WHEN** a Rule or Skill frontmatter sets `enabled: true` and the native activation key does not make the item active
- **THEN** the catalog item `enabled` MUST follow the native key rules above, not `enabled`

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

### Requirement: Catalog delivered to Webview via contract
The Host SHALL deliver the parsed catalog to the Webview using the shared Host↔Webview message contract.

#### Scenario: Webview can request catalog
- **WHEN** the Webview sends the contract message to request the catalog
- **THEN** the Host MUST reply with Rules and Skills catalog payloads typed by the shared contract

### Requirement: Ignore non-.cursor locations in MVP
The Host SHALL NOT scan `.vscode/rules/` or other tool formats in this MVP capability.

#### Scenario: vscode rules are ignored
- **WHEN** rule-like files exist only under `.vscode/rules/`
- **THEN** those files MUST NOT appear in the MVP catalog

### Requirement: Discovery reusable for refresh
Discovery and parse logic SHALL be invokable as a refresh operation triggered by filesystem events, producing the same catalog shape as an on-demand request.

#### Scenario: Refresh returns same shape
- **WHEN** discovery runs due to a watcher event
- **THEN** the resulting catalog MUST use the same typed shape as a Webview-initiated catalog request
