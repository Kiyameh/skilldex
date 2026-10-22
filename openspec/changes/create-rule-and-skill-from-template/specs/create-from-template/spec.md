# Spec Delta

## Purpose

Crear Rules y Skills nuevas desde plantillas pre-llenadas desde el dashboard.

## ADDED Requirements

### Requirement: Create new Rule from template
The system SHALL provide a “+ Nueva Regla” action that creates a pre-filled `.mdc` file under `.cursor/rules/`.

#### Scenario: New rule file created
- **WHEN** the user activates “+ Nueva Regla” and provides a valid name (or accepts the default naming scheme from design)
- **THEN** the Host MUST create a `.mdc` file in `.cursor/rules/` with pre-filled frontmatter and body template
- **AND** the new file MUST be discoverable as a `rule` catalog item

### Requirement: Create new Skill from template
The system SHALL provide a “+ Nueva Skill” action that creates a skill folder under `.cursor/skills/` containing a pre-filled `SKILL.md`.

#### Scenario: New skill scaffold created
- **WHEN** the user activates “+ Nueva Skill” and provides a valid name (or accepts the default naming scheme from design)
- **THEN** the Host MUST create `.cursor/skills/<skill-folder>/SKILL.md` with pre-filled habitual frontmatter (`name`, `description`) and body template
- **AND** the new file MUST be discoverable as a `skill` catalog item

### Requirement: Templates include enabled semantics
Created templates SHALL omit `enabled` or set it such that the new item starts enabled by default.

#### Scenario: New items start enabled
- **WHEN** a new Rule or Skill is created from template
- **THEN** its catalog `enabled` value MUST be `true` until the user disables it

### Requirement: Create directories if missing
If `.cursor/rules/` or `.cursor/skills/` does not exist, the Host SHALL create the needed directories when creating the first item of that kind.

#### Scenario: Missing rules directory
- **WHEN** the user creates a Rule and `.cursor/rules/` is absent
- **THEN** the Host MUST create `.cursor/rules/` before writing the file
