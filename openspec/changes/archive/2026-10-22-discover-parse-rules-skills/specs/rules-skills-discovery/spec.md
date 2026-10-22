# Spec Delta

## Purpose

Descubrir y parsear Rules y Skills bajo `.cursor/` y exponer un catálogo tipado al Webview (Skills como foco principal).

## ADDED Requirements

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
The Host SHALL parse YAML frontmatter using `gray-matter` and map habitual metadata into catalog items.

#### Scenario: Skill habitual metadata is mapped
- **WHEN** a `SKILL.md` has frontmatter `name` and `description`
- **THEN** the catalog item MUST expose those values as the skill’s primary display metadata

#### Scenario: Rule habitual metadata is mapped
- **WHEN** a rule file has frontmatter description/title fields and optional `globs`
- **THEN** the catalog item MUST expose display title/description and `globs` (empty list if absent)

### Requirement: Enabled defaults to true when omitted
An item SHALL be considered enabled when `enabled` is absent or not `false`. An item SHALL be considered disabled when frontmatter has `enabled: false`.

#### Scenario: Missing enabled means active
- **WHEN** a Rule or Skill frontmatter omits `enabled`
- **THEN** the catalog item `enabled` MUST be `true`

#### Scenario: enabled false means disabled
- **WHEN** a Rule or Skill frontmatter sets `enabled: false`
- **THEN** the catalog item `enabled` MUST be `false`

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
