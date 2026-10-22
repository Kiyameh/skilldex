# Spec Delta

## Purpose

Proveer el scaffold mínimo de la extensión SkillDex con Host TypeScript y Webview React+Vite+Tailwind listo para slices posteriores.

## ADDED Requirements

### Requirement: Extension package identity
The extension SHALL identify itself as publisher `andoni`, name `skilldex`, and displayName `SkillDex` in its VS Code manifest.

#### Scenario: Manifest exposes SkillDex identity
- **WHEN** the extension `package.json` is inspected
- **THEN** it MUST declare `publisher` as `andoni`, `name` as `skilldex`, and `displayName` as `SkillDex`

### Requirement: Extension Host activation opens SkillDex panel
The extension SHALL expose a command that opens a Webview panel for SkillDex.

#### Scenario: User runs open SkillDex command
- **WHEN** the user invokes the SkillDex open-panel command in VS Code
- **THEN** a Webview panel MUST open and remain associated with the extension Host

### Requirement: Webview shell uses React Vite and Tailwind
The Webview application SHALL be built with React, Vite, and Tailwind CSS and SHALL render a SkillDex-branded empty shell.

#### Scenario: Panel shows branded shell
- **WHEN** the SkillDex Webview panel loads successfully
- **THEN** the UI MUST display the SkillDex brand/title and MUST be produced by the React+Vite+Tailwind build pipeline

### Requirement: TypeScript strict on Extension Host
The Extension Host source SHALL compile under TypeScript `strict: true` without using `any`.

#### Scenario: Host project enables strict mode
- **WHEN** the Extension Host TypeScript configuration is read
- **THEN** `strict` MUST be `true`
