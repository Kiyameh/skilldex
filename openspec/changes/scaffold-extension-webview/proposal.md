# Proposal

## Why

SkillDex necesita una base de extensión VS Code ejecutable con Webview React+Vite+Tailwind antes de cualquier feature de Rules/Skills. Sin este scaffold no hay Host, panel ni pipeline de build donde apoyar el resto de slices verticales.

## What Changes

- Crear el proyecto de extensión VS Code (`publisher: andoni`, `name: skilldex`, `displayName: SkillDex`)
- Configurar TypeScript strict en Extension Host
- Scaffold de Webview con React + Vite + Tailwind CSS
- Comando y contribución para abrir el panel SkillDex
- Shell vacío verificable que muestre la marca SkillDex en la Webview

## Capabilities

### New Capabilities
- `extension-scaffold`: Scaffold de extensión VS Code + shell Webview React/Vite/Tailwind

### Modified Capabilities
- (ninguno)

## Impact

- Archivos nuevos de extensión (`package.json`, `tsconfig`, `src/extension.ts`, webview app)
- Dependencias: `@types/vscode`, Vite, React, Tailwind, tooling de build de extensión
- No implementa discovery, cards, toggle, create, open ni live sync
