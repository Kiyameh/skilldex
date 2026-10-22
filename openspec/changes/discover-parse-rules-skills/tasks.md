# Tasks

## 1. Filesystem discovery

- [ ] 1.1 Add `gray-matter` dependency to the extension Host package
- [ ] 1.2 Implement Rules discovery for `.cursor/rules/**/*.{mdc,md}` → `kind: 'rule'`
- [ ] 1.3 Implement Skills discovery for `.cursor/skills/**/SKILL.md` → `kind: 'skill'`

## 2. Parse and map metadata

- [ ] 2.1 Parse frontmatter with gray-matter; map Rules title/description + `globs` → `string[]`
- [ ] 2.2 Map Skills `name` + `description` (folder name fallback for name)
- [ ] 2.3 Map `enabled`: missing/other → `true`; `enabled: false` → `false`
- [ ] 2.4 Do not scan `.vscode/rules/`

## 3. Expose via contract

- [ ] 3.1 Extend shared messages with catalog request/response (`skills` + `rules` arrays)
- [ ] 3.2 Host handler: on request, run discovery/parse and reply with typed catalog
- [ ] 3.3 Webview: on load, request catalog (temporary dump or state store OK until dashboard change)

## 4. Verify vertical slice

- [ ] 4.1 Place sample Rule and Skill under `.cursor/` and confirm both appear in the Host response
- [ ] 4.2 Confirm `enabled: false` items parse as disabled
