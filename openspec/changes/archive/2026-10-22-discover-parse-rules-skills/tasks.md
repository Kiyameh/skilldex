# Tasks

## 1. Filesystem discovery

- [x] 1.1 Add `gray-matter` dependency to the extension Host package
- [x] 1.2 Implement Rules discovery for `.cursor/rules/**/*.{mdc,md}` → `kind: 'rule'`
- [x] 1.3 Implement Skills discovery for `.cursor/skills/**/SKILL.md` → `kind: 'skill'`

## 2. Parse and map metadata

- [x] 2.1 Parse frontmatter with gray-matter; map Rules title/description + `globs` → `string[]`
- [x] 2.2 Map Skills `name` + `description` (folder name fallback for name)
- [x] 2.3 Map `enabled`: missing/other → `true`; `enabled: false` → `false`
- [x] 2.4 Do not scan `.vscode/rules/`

## 3. Expose via contract

- [x] 3.1 Extend shared messages with catalog request/response (`skills` + `rules` arrays)
- [x] 3.2 Host handler: on request, run discovery/parse and reply with typed catalog
- [x] 3.3 Webview: on load, request catalog (temporary dump or state store OK until dashboard change)

## 4. Verify vertical slice

- [x] 4.1 Place sample Rule and Skill under `.cursor/` and confirm both appear in the Host response
- [x] 4.2 Confirm `enabled: false` items parse as disabled

## 5. Tests

- [x] 5.1 Unit tests for discovery/parse mapping (`enabled`, globs, skip `.vscode/rules/`) with in-memory or `mkdtemp` fixtures; verify with `npm run test:unit`
- [x] 5.2 One integration test over a temporary workspace catalog; verify with `npm run test:integration`
