# Spec Delta

## ADDED Requirements

### Requirement: Discovery reusable for refresh
Discovery and parse logic SHALL be invokable as a refresh operation triggered by filesystem events, producing the same catalog shape as an on-demand request.

#### Scenario: Refresh returns same shape
- **WHEN** discovery runs due to a watcher event
- **THEN** the resulting catalog MUST use the same typed shape as a Webview-initiated catalog request
