# Spec Delta

## Purpose

Proveer el scaffold mínimo de la extensión SkillDex con Host TypeScript y Webview React+Vite+Tailwind listo para slices posteriores.

## ADDED Requirements

### Requirement: Extension package identity
The extension SHALL identify itself as publisher `andoni`, name `skilldex`, and displayName `SkillDex` in its VS Code manifest.

#### Scenario: Manifest exposes SkillDex identity
- **WHEN** the extension `package.json` is inspected
- **THEN** it MUST declare `publisher` as `andoni`, `name` as `skilldex`, and `displayName` as `SkillDex`

### Requirement: Extension Host opens SkillDex Activity Bar webview
The extension SHALL contribute an Activity Bar container with a Webview view titled SkillDex, and SHALL expose a command that reveals that view.

#### Scenario: User runs open SkillDex command
- **WHEN** the user invokes the SkillDex open-dashboard command in VS Code
- **THEN** the SkillDex Webview view in the Activity Bar container MUST be revealed and remain associated with the extension Host

#### Scenario: User opens SkillDex from Activity Bar
- **WHEN** the user selects the SkillDex Activity Bar container
- **THEN** the SkillDex Webview view MUST load and remain associated with the extension Host

### Requirement: Webview shell uses React Vite and Tailwind
The Webview application SHALL be built with React, Vite, and Tailwind CSS and SHALL render a SkillDex-branded empty shell.

#### Scenario: View shows branded shell
- **WHEN** the SkillDex Webview view loads successfully
- **THEN** the UI MUST display the SkillDex brand/title and MUST be produced by the React+Vite+Tailwind build pipeline

### Requirement: TypeScript strict on Extension Host
The Extension Host source SHALL compile under TypeScript `strict: true` without using `any`.

#### Scenario: Host project enables strict mode
- **WHEN** the Extension Host TypeScript configuration is read
- **THEN** `strict` MUST be `true`
