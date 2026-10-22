# Spec Delta

## ADDED Requirements

### Requirement: Toggle request and result messages
The shared contract SHALL define a Webview→Host toggle request (item identity + target enabled state) and a Host→Webview result (success with updated item, or failure with error).

#### Scenario: Toggle round-trip
- **WHEN** the Webview sends a toggle request for a known catalog item
- **THEN** the Host MUST respond with a typed success or failure result message
