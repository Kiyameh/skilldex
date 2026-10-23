# dashboard-ui Specification

## Purpose

Renderizar el dashboard con dos secciones diferenciadas (Skills primaria, Rules secundaria), cards de metadatos habituales, controles de toggle de `enabled` y acción Abrir/Editar hacia el editor nativo.

## Requirements

### Requirement: Two differentiated sections
The Webview SHALL present two clearly differentiated sections: Skills and Rules. The Skills section SHALL be visually primary (appears first / emphasized).

#### Scenario: Skills section appears before Rules
- **WHEN** the dashboard renders a non-empty catalog
- **THEN** the Skills section MUST be distinguishable from the Rules section
- **AND** the Skills section MUST appear before the Rules section

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

### Requirement: Skill cards show invocation size on hover
Each Skill card SHALL show, below the description inside the hover/focus reveal, a single line with the skill’s character count and approximate token cost. The line MUST use the format `<chars> caracteres (~<tokens> tokens)`, where both numbers use `es-ES` grouping (e.g. `1.024`). Tokens MUST be `round(characterCount / 2.8)` using half-away-from-zero for positive values (1.5 → 2). The tilde MUST always appear. The line MUST remain visible in that reveal when `characterCount` is `0`. The line MUST use the Tailwind class `text-blue-500`. Rule cards MUST NOT show this line.

#### Scenario: Size line under description on hover
- **WHEN** a skill catalog item with `characterCount` 1024 is revealed by hover or focus
- **THEN** the card MUST show `1.024 caracteres (~366 tokens)` below the description
- **AND** that line MUST use `text-blue-500`

#### Scenario: Size line hidden until hover or focus
- **WHEN** a skill card is rendered without hover or focus on the card
- **THEN** the size line MUST NOT be visible outside the description reveal

#### Scenario: Zero count still shown
- **WHEN** a skill catalog item has `characterCount` 0 and the card is revealed by hover or focus
- **THEN** the card MUST show `0 caracteres (~0 tokens)` below the description

#### Scenario: Tilde always present
- **WHEN** `characterCount` divides evenly by 2.8
- **THEN** the displayed line MUST still include `~` before the token number

#### Scenario: Rule cards omit size line
- **WHEN** a rule catalog item is rendered
- **THEN** the card MUST NOT show a character or token size line

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

### Requirement: Empty states per section
Each section SHALL show an empty state when its list is empty.

#### Scenario: No skills yet
- **WHEN** the catalog contains zero skills
- **THEN** the Skills section MUST show an empty-state message (not a blank void)

### Requirement: Cards expose toggle control
Skill and Rule cards SHALL include an accessible toggle control wired to the toggle message contract.

#### Scenario: Toggle is operable from card
- **WHEN** a catalog card is rendered after this change
- **THEN** it MUST provide a keyboard-accessible control that initiates the toggle request

### Requirement: Open control on cards
Each Skill and Rule card SHALL expose an Open control that sends the open message.

#### Scenario: Open control present
- **WHEN** a catalog card is rendered after this change
- **THEN** it MUST include an accessible Open action

### Requirement: Re-render on catalog push
The dashboard SHALL replace its rendered Skills and Rules lists when it receives a Host catalog update push.

#### Scenario: UI reflects pushed catalog
- **WHEN** the Webview receives a catalog update message
- **THEN** both sections MUST re-render to match the new payload
