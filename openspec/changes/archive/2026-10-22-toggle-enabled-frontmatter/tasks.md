# Tasks

## 1. Host persistence

- [x] 1.1 Implement Host service to read file, gray-matter parse, set `enabled` target, stringify, write; preserve Markdown body
- [x] 1.2 Choose and document enable semantics consistently (`enabled: true` vs remove key) — use `enabled: true` for MVP
- [x] 1.3 Return typed success (updated item) or failure

## 2. Contract and UI wiring

- [x] 2.1 Add toggle request/result messages to shared contract (item id/path + target `enabled`)
- [x] 2.2 Add accessible toggle control on `SkillCard` and `RuleCard`
- [x] 2.3 On success, update local catalog state; on failure, show error and revert optimistic UI if used

## 3. Verify vertical slice

- [x] 3.1 Toggle a Skill off; confirm `SKILL.md` contains `enabled: false` and card updates
- [x] 3.2 Toggle a Rule on/off; confirm body text unchanged aside from frontmatter

## 4. Tests

- [x] 4.1 Unit tests for frontmatter `enabled` read/write preserving Markdown body; verify with `npm run test:unit`
- [x] 4.2 Integration test that toggles a file in a temporary workspace; verify with `npm run test:integration`
