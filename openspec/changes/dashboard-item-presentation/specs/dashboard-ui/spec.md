# Spec Delta

## ADDED Requirements

### Requirement: Rule cards list document sections
Each Rule card SHALL replace the description field with a read-only list of section titles extracted from the rule document. Section items MUST NOT be interactive (no click-to-open).

#### Scenario: Sections replace description
- **WHEN** a rule catalog item with one or more sections is rendered
- **THEN** the card MUST show those section titles as a list
- **AND** the card MUST NOT show the frontmatter description in that slot

#### Scenario: No sections empty copy
- **WHEN** a rule catalog item has zero sections
- **THEN** the card MUST show the text `No hay secciones`

### Requirement: Skill cards show version beside the name
When a skill catalog item includes a version, the Skill card SHALL display it with a muted tone immediately to the right of the skill name. When version is absent, the card MUST NOT reserve empty space for it.

#### Scenario: Version present
- **WHEN** a skill catalog item has a version string
- **THEN** the card MUST show that version to the right of the name in a muted style

#### Scenario: Version absent
- **WHEN** a skill catalog item has no version
- **THEN** the card MUST show the name without a version placeholder

### Requirement: Skills grouped by category
The Skills section SHALL group skill cards by category. Category headers SHALL use Title Case. Groups MUST NOT be collapsible. The Rules section MUST remain a flat list.

#### Scenario: Categorized skills render under headers
- **WHEN** the catalog contains skills with distinct categories
- **THEN** the Skills section MUST render a Title Case header per category
- **AND** each skill card MUST appear under its category header
- **AND** group headers MUST NOT provide a collapse control

#### Scenario: Root skills use Sin categoría
- **WHEN** the catalog contains skills with no category
- **THEN** those skills MUST appear under a header labeled `Sin categoría`

#### Scenario: Rules stay ungrouped
- **WHEN** the dashboard renders rules whose files live in nested folders
- **THEN** the Rules section MUST list rule cards without category headers

## MODIFIED Requirements

### Requirement: Skill cards show habitual metadata
Each Skill card SHALL show at least `name`, `description` (revealed on hover/focus), and enabled/disabled state. When version is present it SHALL appear muted to the right of the name.

#### Scenario: Skill card content
- **WHEN** a skill catalog item is rendered
- **THEN** the card MUST display its name and enabled state
- **AND** the description MUST remain available on hover or focus

### Requirement: Rule cards show habitual metadata including globs
Each Rule card SHALL show at least the title, a sections list (or `No hay secciones`), globs, and enabled/disabled state. Globs SHALL appear below the sections list.

#### Scenario: Rule card content
- **WHEN** a rule catalog item is rendered
- **THEN** the card MUST display its title, sections list or `No hay secciones`, its globs (or an empty-state indication), and enabled state
- **AND** globs MUST appear below the sections list
