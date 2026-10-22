# Tooling base de desarrollo SkillDex

- **Fecha:** 2026-10-22
- **Contexto:** Ejecución de `.cursor/prompts/02-configurar-tooling-proyecto.md` (fase 2): higiene del repo sin features de producto.
- **Parte:** continúa de [02-plan-openspec-mvp-changes.md](./02-plan-openspec-mvp-changes.md)

## Resumen

Se auditó el repo (solo `.cursor/` + `openspec/`, sin `package.json` ni código de extensión), se propuso un set de tooling y, tras aprobación del plan, se instaló y verificó. Quedó un único `package.json` con identidad SkillDex listo para que el scaffold fusione build Host/Webview. Ajustes posteriores: textos en castellano y schema JSON de `tsconfig` en el workspace.

## Objetivo

- Revisar requisitos del MVP/stack y el estado del repo.
- Proponer tooling (lint, format, typecheck, etc.), esperar OK e instalarlo.
- No aplicar OpenSpec changes ni implementar el dashboard.

## Decisiones

- **Incluir:** TypeScript strict (`tsconfig.base.json` + root), ESLint 9 flat (TS + React/hooks), Prettier + `eslint-config-prettier`, EditorConfig, `.gitignore`, `.vscode/extensions.json` + `settings.json`, README corto, scripts `typecheck` / `lint` / `lint:fix` / `format` / `format:check`.
- **Excluir:** Husky/lint-staged, Vitest/e2e, `@vscode/vsce`/CI Marketplace, Nx/Turborepo, apply de changes OpenSpec 1–8, actualizar `css-conventions` a Tailwind.
- **Un solo `package.json`:** identidad `publisher: andoni`, `name: skilldex`, `displayName: SkillDex`; sin scripts `build`/`watch` reales hasta el scaffold.
- **Stub de typecheck:** `tooling/typecheck-stub.ts` para que `tsc --noEmit` tenga input sin crear `src/extension` ni `src/webview`.
- **Docs y description en castellano:** `package.json` `description` y `README.md` traducidos tras el setup inicial (inglés).
- **Schema de tsconfig:** `"json.schemaDownload.enable": true` en `.vscode/settings.json` para permitir descargar el schema de SchemaStore (el aviso no era un error de TypeScript del proyecto).

## Contenido clave

### Verificación

- `npm install`, `npm run typecheck`, `npm run lint`, `npm run format:check` — OK.

### Alineación con scaffold

- El agente de `.cursor/prompts/03-aplicar-scaffold-extension.md` debe añadir `main`, `contributes`, deps de VS Code/React/Vite/Tailwind y scripts de build **sin** pisar lint/format.
- `tsconfig.base.json` reutilizable por tsconfigs Host/Webview futuros.
- ESLint ya contempla globs `src/extension/**` y `src/webview/**`.

## Archivos y referencias

- `package.json`, `package-lock.json`
- `tsconfig.base.json`, `tsconfig.json`
- `eslint.config.mjs`, `.prettierrc`, `.prettierignore`, `.editorconfig`, `.gitignore`
- `.vscode/extensions.json`, `.vscode/settings.json`
- `tooling/typecheck-stub.ts`
- `README.md`
- `.cursor/prompts/02-configurar-tooling-proyecto.md`
- `openspec/changes/scaffold-extension-webview/`

## Pendiente / siguientes pasos

- Aplicar change OpenSpec `scaffold-extension-webview` (fase scaffold / prompt `03-aplicar-scaffold-extension.md`).
- Actualizar skill `css-conventions` a Tailwind (pendiente histórico, otra sesión).
- Opcionales no instalados: Husky, Vitest, vsce — solo si se aprueban explícitamente.
