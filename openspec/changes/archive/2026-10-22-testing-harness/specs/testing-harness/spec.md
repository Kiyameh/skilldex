# Spec Delta

## Purpose

Define the local automated testing pyramid for SkillDex so Host, shared contract, and Webview slices can be verified without GitHub Actions or Marketplace CI.

## ADDED Requirements

### Requirement: Local test gate
The project SHALL expose a local `npm test` command that runs the unit layer and the Extension Host integration layer sequentially. The unit layer MUST complete without launching VS Code. The integration layer MUST run inside an Extension Development Host. Remote CI (GitHub Actions or equivalent) is not required.

#### Scenario: Developer runs the local gate
- **WHEN** a developer executes `npm test` in the repository root
- **THEN** the unit suite MUST run to completion without starting VS Code
- **AND** the integration suite MUST then run inside an Extension Development Host
- **AND** a failing layer MUST fail the overall command

#### Scenario: Unit watch stays fast
- **WHEN** a developer runs the unit watch script
- **THEN** the process MUST NOT launch an Extension Development Host

### Requirement: Colocated test naming
Unit tests SHALL live next to the module they cover using the suffix `.test.ts` or `.test.tsx`. Tests that import the VS Code runtime API SHALL use the suffix `.integration.test.ts` and MUST NOT be executed by the unit runner.

#### Scenario: Unit file is colocated
- **WHEN** a developer adds a unit test for a source module
- **THEN** the test file MUST sit beside that module and MUST match `*.test.ts` or `*.test.tsx`

#### Scenario: Integration tests skip the unit runner
- **WHEN** a file named `*.integration.test.ts` exists under `src/`
- **THEN** the unit runner MUST ignore it
- **AND** the Extension Host test runner MUST execute the compiled counterpart

### Requirement: Isolated fixtures
Automated tests SHALL NOT read or write the repository's own `.cursor/` tree as fixture data. Unit tests MUST use in-memory content or a temporary directory. Integration tests that need a workspace MUST use a temporary workspace folder that is deleted after the test.

#### Scenario: Unit parse does not touch the repo catalog
- **WHEN** a unit test supplies Rule or Skill frontmatter
- **THEN** it MUST NOT open files under the SkillDex repo `.cursor/` directory to obtain that fixture

#### Scenario: Integration workspace is temporary
- **WHEN** an integration test needs Rules or Skills on disk
- **THEN** it MUST create them under a temporary workspace
- **AND** it MUST NOT depend on `_skilldex-fixture-*` files committed in this repository

### Requirement: Backfill of existing capabilities
The harness SHALL include automated coverage for the already-shipped capabilities `extension-scaffold` and `host-webview-contract` before later product slices rely on the pyramid.

#### Scenario: Scaffold smoke
- **WHEN** the integration suite runs
- **THEN** it MUST activate the SkillDex extension
- **AND** it MUST observe that the open-dashboard command is registered

#### Scenario: Shared contract guards
- **WHEN** the unit suite runs
- **THEN** it MUST accept well-formed handshake messages defined by the shared contract
- **AND** it MUST reject payloads that are not those messages

#### Scenario: Webview handshake UI
- **WHEN** the unit suite renders the SkillDex webview shell
- **THEN** it MUST show a waiting handshake status by default
- **AND** after a valid Host ready message it MUST show a connected handshake status
