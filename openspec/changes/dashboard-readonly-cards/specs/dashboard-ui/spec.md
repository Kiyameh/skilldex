# Spec Delta

## Purpose

Renderizar el dashboard de solo lectura con dos secciones diferenciadas (Skills primaria, Rules secundaria) y cards de metadatos habituales.

## ADDED Requirements

### Requirement: Two differentiated sections
The Webview SHALL present two clearly differentiated sections: Skills and Rules. The Skills section SHALL be visually primary (appears first / emphasized).

#### Scenario: Skills section appears before Rules
- **WHEN** the dashboard renders a non-empty catalog
- **THEN** the Skills section MUST be distinguishable from the Rules section
- **AND** the Skills section MUST appear before the Rules section

### Requirement: Skill cards show habitual metadata
Each Skill card SHALL show at least `name`, `description`, and enabled/disabled state.

#### Scenario: Skill card content
- **WHEN** a skill catalog item is rendered
- **THEN** the card MUST display its name, description, and enabled state

### Requirement: Rule cards show habitual metadata including globs
Each Rule card SHALL show at least title/description, globs, and enabled/disabled state.

#### Scenario: Rule card content
- **WHEN** a rule catalog item is rendered
- **THEN** the card MUST display title or description, its globs (or an empty-state indication), and enabled state

### Requirement: Empty states per section
Each section SHALL show an empty state when its list is empty.

#### Scenario: No skills yet
- **WHEN** the catalog contains zero skills
- **THEN** the Skills section MUST show an empty-state message (not a blank void)

### Requirement: Read-only in this change
This capability SHALL NOT require mutation controls to be functional; display of state is sufficient. Mutation actions belong to later changes.

#### Scenario: Dashboard loads catalog for display
- **WHEN** the Webview receives a catalog payload
- **THEN** it MUST render sections and cards without requiring toggle/create/open to work yet
