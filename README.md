# SkillDex

Panel visual (extensión de VS Code) para Rules y Skills de IA locales bajo `.cursor/`.

**Identidad:** `publisher` `andoni` · `name` `skilldex` · `displayName` `SkillDex`

## Arrancar la extensión

```bash
npm install
npm run build
```

1. Abre este repositorio en VS Code / Cursor.
2. Pulsa **F5** (o _Run and Debug_ → **Run SkillDex Extension**) para lanzar el Extension Development Host.
3. En la ventana nueva:
   - Usa el icono **SkillDex** de la Activity Bar, o
   - Ejecuta el comando de paleta **SkillDex: Abrir SkillDex**.

Deberías ver el shell branded con el título **SkillDex**.

## Scripts de desarrollo

```bash
npm run build          # Host (tsc) + Webview (Vite)
npm run watch          # Watch Host + Webview
npm run compile        # Solo Extension Host
npm run build:webview  # Solo Webview
npm run typecheck      # TypeScript strict (Host + Webview)
npm run lint
npm run lint:fix
npm run format
npm run format:check
```

## Estructura

- `src/extension/` — Extension Host (TypeScript strict)
- `src/webview/` — UI React + Vite + Tailwind
- `out/extension/` — salida compilada del Host
- `dist/webview/` — assets estáticos del Webview
