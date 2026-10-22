# Spec Delta

## ADDED Requirements

### Requirement: Create Rule and Skill messages
The shared contract SHALL define Webview→Host messages to create a Rule and to create a Skill, plus Host→Webview success/failure results including the created item identity/path when successful.

#### Scenario: Create skill request
- **WHEN** the Webview requests creation of a Skill with a name
- **THEN** the Host MUST respond with a typed success (including path) or failure result
