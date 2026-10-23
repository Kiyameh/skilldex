# Cierre MVP SkillDex (1.0.0)

- **Fecha:** 2026-10-23
- **Contexto:** Cierre del MVP: manifiesto final, empaquetado VSIX instalable y README de producto.

## Resumen

Se cerró el MVP en versión `1.0.0` habilitando sideload local (`.vsix`) en Cursor/VS Code. El bloqueo principal era la ausencia de `.vscodeignore`: sin él, vsce hereda `.gitignore` y excluye `out/` y `dist/`. Quedaron listos manifiesto, licencia MIT, script `package`, VSIX verificado y README en castellano. Marketplace / Open VSX quedaron fuera de alcance.

## Objetivo

- Completar `package.json` (versión 1.0.0, author, descripción, etc.).
- Analizar y habilitar build + exportación a paquete instalable.
- Guiar la prueba manual de exportación e instalación (la hace el usuario).
- Redactar un README del proyecto con la información relevante (castellano).

## Decisiones

- **Author + licencia MIT** (`Andoni Gallardo`): acuerdo explícito del usuario; alternativa “sin LICENSE” descartada.
- **Sideload VSIX, no Marketplace**: alcance de cierre; no `repository` público ni publicación.
- **`--allow-missing-repository` en `npm run package`**: evita exigir URL de repo en el manifiesto.
- **React / React DOM en `devDependencies`**: el Webview los empaqueta Vite; el Host solo necesita `gray-matter` en runtime → VSIX más ligero.
- **`.vscodeignore` denylist** (no allowlist con `!node_modules/**`): vsce empaqueta solo deps de producción; un allowlist de `node_modules` hincharía el paquete.
- **Sin `icon` PNG de Marketplace**: basta el SVG de Activity Bar (`media/skilldex-icon.svg`); vsce solo restringe SVG como `package.json.icon` de Marketplace.
- **Enlaces relativos en README**: vsce falla al reescribir links a ficheros locales sin repo detectado; se mencionan como código, no como markdown links.

## Contenido clave

### Manifiesto (`package.json`)

- `version`: `1.0.0`
- `description`: panel para descubrir, activar y editar Rules/Skills bajo `.cursor/`
- `author`: Andoni Gallardo · `license`: MIT
- `keywords`: cursor, skills, rules, ai, dashboard, skilldex
- Identidad intacta: `publisher` `andoni`, `name` `skilldex`, `displayName` `SkillDex`
- Script: `"package": "vsce package --allow-missing-repository"`
- DevDep: `@vscode/vsce`

### Empaquetado

Flujo: `src/extension` → `out/` (tsc); `src/webview` → `dist/webview` (Vite); vsce empaqueta `out/`, `dist/`, `media/`, manifiesto, README, LICENSE y `gray-matter`.

Comprobación útil:

```bash
npx vsce ls
npm run package
```

Resultado típico: `skilldex-1.0.0.vsix` (~298 KB). Id instalado: `andoni.skilldex`. El `.vsix` está en `.gitignore`.

### Guía de prueba manual (usuario)

1. Cerrar Extension Development Host (F5).
2. **Extensions: Install from VSIX…** → `skilldex-1.0.0.vsix`.
3. Workspace con `.cursor/rules/` y `.cursor/skills/`.
4. Humo: categorías de skills, rules planas, hover (`~N`), toggle nativo, abrir en editor, live sync, empty states sin `.cursor/`.
5. Panel en blanco → sospechar VSIX sin `dist/webview`.

### README

Documentación de producto + desarrollo en castellano: qué es, requisitos, instalación VSIX, uso, modelo de datos MVP, desarrollo/scripts, empaquetado y por qué existe `.vscodeignore`, licencia MIT.

## Archivos y referencias

- `package.json`
- `LICENSE`
- `.vscodeignore`
- `README.md`
- `media/screenshot.png` (añadida por el usuario; captura del panel)
- `skilldex-1.0.0.vsix` (generado localmente, no versionado)

## Pendiente / siguientes pasos

- Prueba manual de instalación VSIX en Cursor (usuario).
- Publicación Marketplace / Open VSX: no incluida en este cierre.
- Si se publica más adelante: añadir `repository`, icono PNG ≥128×128 y, si aplica, `galleryBanner`.

## Notas

- `vsce ls` no admite `--allow-missing-repository`; esa flag solo aplica a `vsce package`.
- Tras enlazar `.vscodeignore` en el README, el empaquetado falló hasta quitar el link relativo.
