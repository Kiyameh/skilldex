# Tasks

## 1. Manifest and Extension Host skeleton

- [x] 1.1 Create extension `package.json` with `publisher: andoni`, `name: skilldex`, `displayName: SkillDex`, `viewsContainers`/`views` (Activity Bar webview), and `skilldex.openDashboard` command contribution
- [x] 1.2 Add Host TypeScript config with `strict: true` and entry `src/extension/extension.ts` (or agreed path) exporting `activate`/`deactivate`
- [x] 1.3 Implement `WebviewViewProvider` for SkillDex and command that reveals the Activity Bar view

## 2. Webview React Vite Tailwind pipeline

- [x] 2.1 Scaffold Webview app under `src/webview/` with React + Vite + Tailwind and a SkillDex-branded empty shell component
- [x] 2.2 Wire Vite build output so the Host loads scripts/styles via `webview.asWebviewUri` with a correct CSP
- [x] 2.3 Add npm scripts to build Host + Webview for Extension Development Host

## 3. Verify vertical slice

- [x] 3.1 Run Extension Development Host, open SkillDex view (Activity Bar and/or command), confirm branded shell renders
- [x] 3.2 Confirm Host compiles under strict TypeScript without `any`
