# Tasks

## 1. Watchers and debounce

- [ ] 1.1 Register `createFileSystemWatcher` for `.cursor/rules/**` and `.cursor/skills/**` using workspace `RelativePattern`
- [ ] 1.2 Debounce create/change/delete events with a named constant (~150–300ms) then re-run discovery
- [ ] 1.3 Dispose watchers in `deactivate` (and panel dispose if owned there)

## 2. Push catalog updates

- [ ] 2.1 Ensure Host→Webview catalog push message exists (reuse/extend discovery response type)
- [ ] 2.2 After refresh, push catalog to Webview; dashboard replaces Skills/Rules lists
- [ ] 2.3 Confirm toggle/create still behave correctly with watchers active (no crash loops)

## 3. Verify vertical slice

- [ ] 3.1 Edit a Skill description in native editor, save; dashboard updates without manual reload
- [ ] 3.2 Delete a Rule on disk; card disappears after refresh
- [ ] 3.3 Deactivate extension / dispose and confirm watchers are disposed (no lingering listeners in logs)
