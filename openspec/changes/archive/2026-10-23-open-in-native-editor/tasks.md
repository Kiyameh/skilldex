# Tasks

## 1. Host open handler

- [x] 1.1 Implement Host handler that resolves catalog item path to `vscode.Uri` and calls `vscode.window.showTextDocument`
- [x] 1.2 Handle missing file with non-crashing error path

## 2. Contract and UI

- [x] 2.1 Add open-document message to shared contract
- [x] 2.2 Add accessible Open action on Skill and Rule cards that posts the message

## 3. Verify vertical slice

- [x] 3.1 From a Skill card, Open opens that `SKILL.md` in the native editor
- [x] 3.2 From a Rule card, Open opens the rule file in the native editor

## 4. Tests

- [x] 4.1 Integration test that Open on a temp-workspace item calls `showTextDocument` for that path; verify with `npm run test:integration`
