# Design

## Context

El webview no ejecuta git. Hoy el host empuja handshake, catálogo y resultados de toggle/open; el change `extension-settings` añade snapshot de preferencias y `webview/openSettings`, y declara `skilldex.remoteSkillsRepositoryUrl` sin usarla. El catálogo se descubre y vigila bajo `.cursor/` de la primera carpeta del workspace. Ver proposal.md para el motivo.

## Goals / Non-Goals

**Goals:**

- Un corte vertical: claves, git en el host, status al webview, pie, pull + comando opcional en terminal.
- Defaults útiles (path `.cursor`, comando vacío) y override por workspace para checkouts como `.ai-config`.

**Non-Goals:**

- Clonar, elegir rama, rebase, push o resolver conflictos.
- Cambiar la raíz de descubrimiento del catálogo.
- Dependencia `simple-git` o API Git de VS Code como requisito.
- Detectar LKWeb por nombre de carpeta.

## Decisions

- El catálogo y el checkout git son paths distintos. Discovery y watchers no leen `localSkillsRepositoryPath`. El live sync existente refresca las cards cuando el comando (o el pull, si el clone es `.cursor`) escribe bajo `.cursor/`.
- Git por CLI (`git -C <abs>`) en el directorio resuelto. Alternativa descartada: Git extension API, porque un nested repo como `.ai-config` puede no estar en el modelo de repos de Cursor. Alternativa descartada: subir al padre si no hay `.git`; en LKWeb eso haría pull de `lkweb`.
- Equivalencia de remotes: parsear scp-like y https, quitar `.git` final, comparar host+path en minúsculas. No hace falta que coincida el usuario de la URL (`git@` vs `https://user@`).
- Fetch al arrancar la sesión del webview (y al cambiar las tres claves de sync), no en intervalo. El primer status puede ser `checking` hasta que termine el fetch.
- Pull y comando en un terminal visible (`createTerminal` o Task). Cubren passphrase SSH y `yarn generate` (Node 22). `child_process` oculto se bloquea en el prompt.
- Pipeline fijo: `pull --ff-only` y, solo si avanzó HEAD, el comando con cwd = workspace root. El comando no sustituye al pull. En LKWeb el valor esperado es `bash .ai-config/scripts/sync-local.sh --skip-pull`.
- Snapshot: el change `extension-settings` define tres campos; este añade `localSkillsRepositoryPath` y `updateCommand` al mismo mensaje. Si settings aún no está aplicado, este change asume ese mensaje y lo amplía (no se inventa un segundo canal de preferencias).
- Discriminantes nuevos, mismo prefijo: `host/remoteRepoStatus`, `webview/pullRemoteRepo`, `host/pullRemoteRepoResult`.
- `localSkillsRepositoryPath` se resuelve con `path.resolve(workspaceRoot, path)` tras rechazar absoluto y `..`. Separadores `\` se normalizan a posix antes de validar.

## Risks / Trade-offs

- [`extension-settings` no está implementado] → Aplicar settings antes o en el mismo corte; este change no reabre visibilidad de secciones ni el mapache.
- [Toggle `enabled` sucia `.cursor` mientras el git está en `.ai-config`] → El status `dirty` mira el checkout git, no el catálogo. El generate posterior puede pisar toggles locales; el pie no avisa de sucio en `.cursor` en v1.
- [Comando arbitrario de workspace] → Mismo modelo que `tasks.json`; se muestra en terminal; no se interpola en un shell más allá del string de settings.
- [Fetch necesita red y credenciales] → Si fetch falla, status `error` con el texto; no se finge `upToDate` con datos cacheados sin haber intentado fetch en esa sesión.
- [Multi-root] → Misma primera carpeta que el catálogo.

## Migration Plan

Defaults dejan el pie en aviso de URL vacía, igual que un panel sin remoto. Quien ya tenga `skilldex.remoteSkillsRepositoryUrl` pasa a usar path `.cursor` sin comando. Revertir deja las dos claves huérfanas que Cursor ignora.

## Open Questions

Ninguna que altere la spec: el texto de error de git/comando se reenvía tal cual al pie.
