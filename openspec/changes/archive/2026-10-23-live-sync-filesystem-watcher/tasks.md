# Tasks

## 1. Watchers and debounce

- [x] 1.1 Register `createFileSystemWatcher` for `.cursor/rules/**` and `.cursor/skills/**` using workspace `RelativePattern`
- [x] 1.2 Debounce create/change/delete events with a named constant (~150–300ms) then re-run discovery
- [x] 1.3 Dispose watchers in `deactivate` (and panel dispose if owned there)

## 2. Push catalog updates

- [x] 2.1 Ensure Host→Webview catalog push message exists (reuse/extend discovery response type)
- [x] 2.2 After refresh, push catalog to Webview; dashboard replaces Skills/Rules lists
- [x] 2.3 Confirm toggle/create still behave correctly with watchers active (no crash loops)
  - Toggle/open verified via existing unit + integration suites with live-sync wired; create-from-template deferred (not in this change)

## 3. Verify vertical slice

- [x] 3.1 Edit a Skill description in native editor, save; dashboard updates without manual reload
- [x] 3.2 Delete a Rule on disk; card disappears after refresh
- [x] 3.3 Deactivate extension / dispose and confirm watchers are disposed (no lingering listeners in logs)

## 4. Tests

- [x] 4.1 Integration test: mutate a file in a temporary workspace and observe a catalog refresh after debounce; verify with `npm run test:integration`
