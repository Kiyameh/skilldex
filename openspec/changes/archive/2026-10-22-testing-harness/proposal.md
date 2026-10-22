# Proposal

## Why

El MVP ya tiene Host, contrato compartido y Webview, pero cero tests automatizados. Los slices siguientes (discovery, cards, toggle, create, watcher) concentran lógica fácil de romper y los agentes no tienen red de seguridad. El out-of-scope original (“testing complejo”) se sustituye por una pirámide acotada y CI local.

## What Changes

- Instalar un arnés de dos runners: Vitest (unit/Webview) y `@vscode/test-cli` (Extension Host)
- Convenciones: tests colocalizados `*.test.ts(x)`; integration `*.integration.test.ts`
- Fixtures de suite: in-memory / workspace temporal; `npm test` no lee el `.cursor/` de este repo
- Backfill de tests para las specs ya en main (`extension-scaffold`, `host-webview-contract`)
- Exigir tests en cada `tasks.md` de changes activos posteriores
- Alinear `openspec/config.yaml`, README y narrativa de chats/prompts: pirámide in-scope; Marketplace/CI remoto siguen fuera
- Script local `npm test` (`test:unit` && `test:integration`); sin GitHub Actions

## Capabilities

### New Capabilities

- `testing-harness`: Arnés local de pirámide (unit shared/host, componentes Webview, integration Extension Host), scripts y convenciones de colocación/fixtures

### Modified Capabilities

- (ninguna) — el comportamiento de producto de `extension-scaffold` y `host-webview-contract` no cambia; este change añade tests que los cubren

## Impact

- `package.json`: devDependencies (Vitest, Testing Library, `@vscode/test-cli`, `@vscode/test-electron`) y scripts `test` / `test:unit` / `test:integration`
- Configs: `vitest.config.ts`, `.vscode-test.mjs`, ESLint/tsconfig para no mezclar Vitest y Mocha
- Código de test colocalizado bajo `src/`
- Documentación OpenSpec y `.cursor` de planificación del MVP
- Changes activos 3–8: nuevas tasks de tests (sin implementar esos slices)
