# Spec Delta

## ADDED Requirements

### Requirement: Open document message
The shared contract SHALL define a Webview→Host message carrying the catalog item identity or filesystem path to open.

#### Scenario: Open request is typed
- **WHEN** the Webview requests opening an item
- **THEN** it MUST send the typed open message from the shared contract
