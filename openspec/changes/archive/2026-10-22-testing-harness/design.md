# Design

## Context

See proposal.md. Hoy: `typecheck` / `lint` / F5; sin runner. Tres runtimes (`src/extension`, `src/shared`, `src/webview`). Host usa NodeNext e imports `.js`; el módulo `vscode` solo existe dentro del Extension Host. `get-webview-html.ts` importa `Uri` de valor; `host-message-adapter.ts` solo importa tipos de `vscode`.

## Goals / Non-Goals

**Goals:**
- Dos runners con un umbrella `npm test`
- Backfill mínimo de scaffold + contrato
- Convenciones que los changes 3–8 puedan seguir
- Alinear docs de MVP (config, chats, prompts, README, tasks activas)

**Non-Goals:**
- GitHub Actions, coverage gates, Playwright contra el Webview
- Implementar discovery/cards/toggle/create/watcher
- Extraer arquitectura nueva de producto solo para testear
- Fixtures permanentes bajo `.cursor/`

## Decisions

- **Vitest + `@vscode/test-cli` / `@vscode/test-electron`:** unit/RTL en proceso Node; integration en Electron oficial. Alternativa (solo Vitest) no cubre Host real; (solo Mocha) hace lentos los tests de 20 ms.
- **Imports explícitos** (`vitest` vs `assert`/`mocha`): evita choque de globals entre suites colocalizadas.
- **Projects Vitest:** `node` (`src/shared/**/*.test.ts`, `src/extension/**/*.test.ts`) y `webview` (`src/webview/**/*.test.{ts,tsx}`, jsdom + RTL setup). Exclude `**/*.integration.test.ts`.
- **tsconfig.extension.json:** incluir `*.integration.test.ts`; excluir `*.test.ts` para no emitir tests de Vitest a `out/`.
- **`.vscode-test.mjs`:** `files: 'out/**/*.integration.test.js'`; `preLaunchTask` implícito via script `compile`.
- **Mock de `vscode`:** solo en unit tests de módulos que importan valor (`get-webview-html`). Adapters con `import type` se testean con fakes de `Webview`.
- **Fixtures:** in-memory / `mkdtemp` en unit; temp workspace en integration; F5 usa el repo real sin fixtures de suite.
- **CI local:** `typecheck` y `lint` siguen scripts aparte; `npm test` = unit && integration. No Actions.

## Risks / Trade-offs

- [Electron lento o frágil en local] → `test:unit` diario; integration en el gate y al tocar Host.
- [Imports `.js` NodeNext vs Vite] → Vitest `resolve` / `deps` para sufijos; no cambiar el modelo de módulos del Host.
- [Tests de HTML webview leen `dist/webview`] → unit de CSP/nonce con HTML string fake; no exigir build Vite en `test:unit`.
- [Two configs] → documentar naming `.test` vs `.integration.test` en README y spec.

## Migration Plan

1. Instalar deps y configs sin romper `build` / F5
2. Añadir backfill
3. Actualizar docs y tasks de changes activos
4. Rollback: quitar scripts y deps; el producto no depende del arnés en runtime

## Open Questions

Ninguna diferible: runners, colocación, fixtures y CI local están cerrados.
