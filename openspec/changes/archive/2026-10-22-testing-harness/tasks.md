# Tasks

## 1. Tooling

- [x] 1.1 Añadir Vitest, jsdom, Testing Library, `@vscode/test-cli`, `@vscode/test-electron` y `@types/mocha` como devDependencies; verificar que `npm install` termina sin error
- [x] 1.2 Añadir scripts `test:unit`, `test:unit:watch`, `test:integration` y `test` (unit && integration) en `package.json`; verificar que aparecen en `npm run`
- [x] 1.3 Crear `vitest.config.ts` (projects node + webview, exclude `*.integration.test.ts`) y `.vscode-test.mjs` (`out/**/*.integration.test.js`); verificar que los ficheros existen
- [x] 1.4 Ajustar `tsconfig.extension.json` para emitir `*.integration.test.ts` y excluir `*.test.ts`; ajustar ESLint (globals/archivos de test); verificar `npm run typecheck` y `npm run lint`

## 2. Backfill

- [x] 2.1 Tests unitarios de type-guards del contrato (aceptan handshake válido, rechazan basura); verificar con `npm run test:unit`
- [x] 2.2 Tests unitarios de `startHandshake` / adapters con Webview fake (sin runtime vscode); verificar con `npm run test:unit`
- [x] 2.3 Tests RTL del shell Webview: estado waiting y connected tras `host/ready`; verificar con `npm run test:unit`
- [x] 2.4 Test de integration que activa `andoni.skilldex` y comprueba el comando `skilldex.openDashboard`; verificar con `npm run test:integration`

## 3. Documentación y changes activos

- [x] 3.1 Actualizar `openspec/config.yaml`: pirámide y CI local in-scope; Marketplace/CI remoto out; verificar que el out-of-scope ya no dice “Complex automated testing”
- [x] 3.2 Actualizar README (scripts de test y convenciones de naming/fixtures); verificar que documenta `npm test`
- [x] 3.3 Alinear chats/prompts de MVP (01–05) y `03-tooling-base-desarrollo.md` con la pirámide; verificar que ya no presentan el testing automatizado como out-of-scope del MVP
- [x] 3.4 Añadir a cada `tasks.md` activo (discover → live-sync) una task de tests acorde al slice; verificar que los seis changes listan al menos un ítem de test

## 4. Gate local

- [x] 4.1 Ejecutar `npm test` y verificar que unit e integration pasan; `npm run typecheck` y `npm run lint` siguen verdes
