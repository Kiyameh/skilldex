# Tasks

## 1. Templates and Host create services

- [ ] 1.1 Add Rule template (`.mdc` frontmatter + body) and Skill template (`SKILL.md` with `name`/`description`)
- [ ] 1.2 Implement create-Rule: ensure `.cursor/rules/`, slugify name, refuse overwrite, write `.mdc`
- [ ] 1.3 Implement create-Skill: ensure `.cursor/skills/`, create folder + `SKILL.md`, refuse overwrite
- [ ] 1.4 Prompt for name via `vscode.window.showInputBox` (Host) with validation against empty/path traversal

## 2. Contract and UI CTAs

- [ ] 2.1 Add create-rule and create-skill request/result messages to shared contract
- [ ] 2.2 Add “+ Nueva Skill” in Skills section and “+ Nueva Regla” in Rules section
- [ ] 2.3 On success, refresh catalog state (request catalog or merge created item)

## 3. Verify vertical slice

- [ ] 3.1 Create a Skill; confirm folder + `SKILL.md` exist and appear in Skills section enabled
- [ ] 3.2 Create a Rule; confirm `.mdc` exists under `.cursor/rules/` and appears in Rules section
- [ ] 3.3 Creating with an existing slug fails with a visible error and does not overwrite
