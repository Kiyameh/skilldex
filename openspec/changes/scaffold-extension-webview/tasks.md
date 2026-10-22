# Tasks

## 1. Manifest and Extension Host skeleton

- [ ] 1.1 Create extension `package.json` with `publisher: andoni`, `name: skilldex`, `displayName: SkillDex`, activation and `skilldex.openDashboard` command contribution
- [ ] 1.2 Add Host TypeScript config with `strict: true` and entry `src/extension/extension.ts` (or agreed path) exporting `activate`/`deactivate`
- [ ] 1.3 Implement command that creates a Webview panel titled SkillDex

## 2. Webview React Vite Tailwind pipeline

- [ ] 2.1 Scaffold Webview app under `src/webview/` with React + Vite + Tailwind and a SkillDex-branded empty shell component
- [ ] 2.2 Wire Vite build output so the Host loads scripts/styles via `webview.asWebviewUri` with a correct CSP
- [ ] 2.3 Add npm scripts to build Host + Webview for Extension Development Host

## 3. Verify vertical slice

- [ ] 3.1 Run Extension Development Host, open SkillDex panel, confirm branded shell renders
- [ ] 3.2 Confirm Host compiles under strict TypeScript without `any`
