# Tasks

## 1. Settings y contrato

- [ ] 1.1 Declarar `skilldex.localSkillsRepositoryPath` y `skilldex.updateCommand` en `package.json` (tipos, defaults `.cursor` y `""`, ámbito `window`, descripciones y orden del diseño). Ampliar el snapshot de settings en `src/shared/messages.ts` con esos dos strings. Verificar en el test de type guards que un snapshot sin esos campos se rechaza y que path/comando no string se rechazan.
- [ ] 1.2 Añadir `host/remoteRepoStatus`, `webview/pullRemoteRepo` y `host/pullRemoteRepoResult` al contrato y a los type guards. Verificar en `src/shared/type-guards.test.ts` los ocho `status`, un pull request sin payload y un resultado `ok: false` con `error`.
- [ ] 1.3 Extraer la lectura coercida de path y comando (no string → default, trim, path vacío → `.cursor`) junto a la de URL. Verificar con un test unitario colocated que no llama a `discoverCatalog`.

## 2. Git y pipeline en el host

- [ ] 2.1 Implementar la validación del path (relativo, sin `..`, dentro del workspace, no subir al padre) y la equivalencia de remotes (`.git` opcional, `git@host:path` = `https://host/path`). Verificar con tests unitarios los rechazos `../` y absoluto, y dos URLs equivalentes / no equivalentes.
- [ ] 2.2 Implementar el cálculo de status con un `git` inyectable: `unconfigured` sin URL, `notGit` sin raíz, `originMismatch`, `checking`, `dirty`, `behind`, `upToDate`, `error`. Verificar con un repo git temporal en tests unitarios (nunca el `.cursor` del repo SkillDex) los casos unconfigured, notGit, dirty, behind y upToDate.
- [ ] 2.3 Implementar pull `--ff-only` y, solo si HEAD avanza, el comando con cwd = workspace. Verificar con tests unitarios que un pull fallido no lanza el comando, que un pull sin avance no lo lanza, y que un fast-forward sí lo lanza.

## 3. Host ↔ webview

- [ ] 3.1 Al resolver la vista, enviar status (con fetch si hay URL) y volver a enviarlo al cambiar las tres claves de sync y tras un pull. Verificar en el test del adapter/provider que la sesión arranca con un `host/remoteRepoStatus` y que un cambio de URL provoca otro sin llamar a `discoverCatalog`.
- [ ] 3.2 Al recibir `webview/pullRemoteRepo`, ejecutar el pipeline en un terminal visible y responder `host/pullRemoteRepoResult` más un status nuevo. Verificar en el test del adapter que, si el status no es `behind`, no se invoca git pull ni el comando.

## 4. Pie del panel

- [ ] 4.1 En `src/webview/App.tsx`, pie fijo debajo del catálogo y del estado mapache. Con URL vacía: `No hay un repo configurado` y `Ir a la config` sin botón `Pull`. Verificar en `src/webview/App.test.tsx` ese texto, el `postMessage` de open-settings y la ausencia de `Pull`.
- [ ] 4.2 Con URL presente, pintar la URL, el copy de status y `Pull` solo habilitado en `behind`. Verificar en `App.test.tsx` `Hay actualizaciones` con `Pull` enabled, `Al día` con `Pull` disabled, y que activar `Pull` envía `webview/pullRemoteRepo`.

## 5. Corte completo

- [ ] 5.1 Verificar `npm run test:unit` y `npm run test:integration` en verde, incluida la comprobación de que un path git `.ai-config` no cambia los ítems que devuelve `discoverCatalog`.
