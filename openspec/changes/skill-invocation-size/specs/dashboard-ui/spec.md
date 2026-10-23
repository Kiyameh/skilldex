# Spec Delta

## ADDED Requirements

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
