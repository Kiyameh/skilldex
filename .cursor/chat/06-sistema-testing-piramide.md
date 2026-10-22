# Sistema de testing en pirámide

- **Fecha:** 2026-10-22
- **Contexto:** Conceptualizar e implementar el arnés de tests de SkillDex (OpenSpec `testing-harness`).
- **Parte:** continúa de [05-host-webview-message-contract.md](./05-host-webview-message-contract.md)

## Resumen

Se diseñó y aplicó una pirámide local (unit + Webview RTL + algo de Extension Host) con dos runners. El change `testing-harness` está implementado, sincronizado a main specs y archivado. Marketplace y GitHub Actions siguen fuera del MVP.

## Objetivo

- Conceptualizar de forma iterativa un framework de testing.
- Tras cerrar decisiones, implementar el arnés, backfill de specs ya en main, y alinear documentación del MVP.

## Decisiones

- **Ambición:** pirámide por capas. Cada change posterior nace con tests. Descartado: solo F5, solo integration Electron, o cobertura caso a caso.
- **Runners:** Vitest (`*.test.ts` / `*.test.tsx`) + `@vscode/test-cli` (`*.integration.test.ts`). Un solo runner o mentía (mocks de `vscode`) o arrastraba Electron a tests de 20 ms.
- **Colocación:** junto al módulo, convención `foo.test.ts`.
- **Fixtures:** unit in-memory/`mkdtemp`; integration workspace temporal. `npm test` no lee el `.cursor/` de este repo. No se commitean `_skilldex-fixture-*`.
- **OpenSpec:** backfill de `extension-scaffold` y `host-webview-contract`; cada `tasks.md` activo (discover → live-sync) exige tests.
- **CI:** solo local (`npm test`). Sin GitHub Actions.
- **MVP:** “testing complejo” deja de ser out-of-scope; queda la pirámide local. Marketplace/CI remoto siguen fuera.

## Contenido clave

### Capas

| Capa | Runner | Qué cubre |
| --- | --- | --- |
| Shared / Host puro | Vitest node | Type guards, parseo, adapters con fake `Webview` |
| Webview | Vitest jsdom + RTL | Comportamiento visible (`getByRole`) |
| Extension Host | Mocha vía `@vscode/test-cli` | Activate, comandos, disco en workspace temp |

Regla: si el test importa el runtime `vscode`, es `.integration.test.ts`.

### Scripts

- `npm run test:unit` / `test:unit:watch` — día a día
- `npm run test:integration` — compile Host + Electron (primera vez descarga VS Code a `.vscode-test/`, gitignored)
- `npm test` — gate local (unit && integration)

### Backfill hecho

- Type-guards del handshake
- `startHandshake` con Webview fake y reintentos
- RTL del shell: `Host: esperando` → `Host: conectado` tras `host/ready`
- Integration: activa `andoni.skilldex` y registra `skilldex.openDashboard`

### Docs alineadas

`openspec/config.yaml`, README, chats 01–03 y 05, prompts 00–05, tasks de changes 3–8.

## Archivos y referencias

- `openspec/specs/testing-harness/spec.md`
- `openspec/changes/archive/2026-10-22-testing-harness/`
- `vitest.config.ts`, `.vscode-test.mjs`, `tsconfig.integration.json`
- `src/shared/type-guards.test.ts`
- `src/extension/host-message-adapter.test.ts`
- `src/extension/extension.integration.test.ts`
- `src/webview/App.test.tsx`

## Pendiente / siguientes pasos

- Aplicar `discover-parse-rules-skills` (tasks 5.1–5.2 de tests).
- No archivar ni abrir el siguiente change de producto sin pedirlo.
- No hay GitHub Actions a propósito.

## Notas

- Imports explícitos de Vitest; Mocha usa globals en integration (importar `suite`/`test` desde `mocha` rompe el runner de VS Code).
- `tsconfig.extension.json` excluye `*.test.ts`; las integration se emiten con `tsconfig.integration.json` porque `*.integration.test.ts` también matchea `*.test.ts`.
