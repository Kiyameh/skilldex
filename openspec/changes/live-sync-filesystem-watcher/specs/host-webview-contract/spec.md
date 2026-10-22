# Spec Delta

## ADDED Requirements

### Requirement: Catalog push on filesystem change
The shared contract SHALL support a Host→Webview catalog update message that can be pushed without an explicit Webview request (reuse or extend the existing catalog payload type).

#### Scenario: Host pushes updated catalog
- **WHEN** the Host finishes refreshing after a filesystem event
- **THEN** it MUST send the typed catalog update message to the Webview
