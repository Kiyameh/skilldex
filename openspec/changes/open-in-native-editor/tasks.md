# Tasks

## 1. Host open handler

- [ ] 1.1 Implement Host handler that resolves catalog item path to `vscode.Uri` and calls `vscode.window.showTextDocument`
- [ ] 1.2 Handle missing file with non-crashing error path

## 2. Contract and UI

- [ ] 2.1 Add open-document message to shared contract
- [ ] 2.2 Add accessible Open action on Skill and Rule cards that posts the message

## 3. Verify vertical slice

- [ ] 3.1 From a Skill card, Open opens that `SKILL.md` in the native editor
- [ ] 3.2 From a Rule card, Open opens the rule file in the native editor
