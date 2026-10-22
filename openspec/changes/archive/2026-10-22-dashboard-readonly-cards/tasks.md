# Tasks

## 1. Section layout

- [x] 1.1 Create `SkillsSection` and `RulesSection` with clear headings; Skills rendered first
- [x] 1.2 Add empty states for each section when lists are empty
- [x] 1.3 Style with Tailwind; keep semantic HTML / accessible headings

## 2. Cards

- [x] 2.1 Implement `SkillCard` showing `name`, `description`, enabled state
- [x] 2.2 Implement `RuleCard` showing title/description, globs, enabled state
- [x] 2.3 Wire sections to catalog state from Host request (replace any temporary dump UI)

## 3. Verify vertical slice

- [x] 3.1 Open dashboard with sample Skills and Rules; confirm two sections and card fields
- [x] 3.2 Confirm empty workspace shows empty states without crashing

## 4. Tests

- [x] 4.1 RTL tests for Skills/Rules sections, cards, and empty states (accessible queries); verify with `npm run test:unit`
