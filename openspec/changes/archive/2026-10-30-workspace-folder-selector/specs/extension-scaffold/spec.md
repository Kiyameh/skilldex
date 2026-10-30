# Spec Delta

## MODIFIED Requirements

### Requirement: Webview shell uses React Vite and Tailwind
The Webview application SHALL be built with React, Vite, and Tailwind CSS and SHALL render a shell that shows the SkillDex logo. The header title text is owned by the dashboard: it MUST NOT be required to read `SkillDex` while a workspace folder is selected. The view container title MUST remain SkillDex.

#### Scenario: View shows branded shell
- **WHEN** the SkillDex Webview view loads successfully
- **THEN** the UI MUST display the SkillDex logo
- **AND** the UI MUST be produced by the React+Vite+Tailwind build pipeline
- **AND** the view container title MUST remain SkillDex
