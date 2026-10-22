# Spec Delta

## ADDED Requirements

### Requirement: Catalog request and response messages
The shared contract SHALL define a Webview→Host message to request the catalog and a Host→Webview message that carries the parsed Rules and Skills lists.

#### Scenario: Request catalog message exists
- **WHEN** the Webview needs the current catalog
- **THEN** it MUST send the typed request message defined by the contract
- **AND** the Host MUST respond with a typed catalog payload containing `skills` and `rules` arrays
