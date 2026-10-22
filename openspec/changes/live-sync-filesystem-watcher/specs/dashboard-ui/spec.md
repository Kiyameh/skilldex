# Spec Delta

## ADDED Requirements

### Requirement: Re-render on catalog push
The dashboard SHALL replace its rendered Skills and Rules lists when it receives a Host catalog update push.

#### Scenario: UI reflects pushed catalog
- **WHEN** the Webview receives a catalog update message
- **THEN** both sections MUST re-render to match the new payload
