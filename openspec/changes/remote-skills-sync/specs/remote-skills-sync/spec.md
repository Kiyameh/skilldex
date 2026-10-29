# Spec Delta

## Purpose

Sincronizar un checkout git de skills, distinto del catálogo, con un remoto configurado y un comando opcional posterior al pull.

## ADDED Requirements

### Requirement: Sync settings keys
The extension SHALL contribute two SkillDex properties, after `skilldex.remoteSkillsRepositoryUrl`, in this order: `skilldex.localSkillsRepositoryPath` (string, default `.cursor`, scope `window`, description `Directorio del checkout git de skills, relativo a la raíz del workspace.`) and `skilldex.updateCommand` (string, default `""`, scope `window`, description `Comando que se ejecuta en la raíz del workspace después de un pull con avance. Vacío: solo git.`). A non-string value for either property MUST be treated as its default. Surrounding whitespace on either string MUST be trimmed before use. An empty `skilldex.localSkillsRepositoryPath` after trim MUST be treated as `.cursor`.

#### Scenario: Defaults when unset
- **WHEN** the two properties have no user or workspace value
- **THEN** `skilldex.localSkillsRepositoryPath` MUST be `.cursor`
- **AND** `skilldex.updateCommand` MUST be an empty string

#### Scenario: Workspace values apply
- **WHEN** the user sets both properties in workspace settings
- **THEN** the effective values MUST be those workspace strings after trim

#### Scenario: Invalid types fall back
- **WHEN** the stored value of `skilldex.localSkillsRepositoryPath` is not a string
- **THEN** the effective path MUST be `.cursor`
- **WHEN** the stored value of `skilldex.updateCommand` is not a string
- **THEN** the effective command MUST be an empty string

### Requirement: Local path stays inside the workspace
The effective local path SHALL be relative to the workspace root. The Host MUST reject a path that is absolute, that contains `..` after normalization, or that resolves outside the workspace root. A rejected path MUST produce the not-a-git-repository status and MUST NOT walk up to a parent Git repository.

#### Scenario: Parent segments are rejected
- **WHEN** `skilldex.localSkillsRepositoryPath` is `../other`
- **THEN** the Host MUST NOT run git against a directory outside the workspace
- **AND** the remote status MUST be that the directory is not a git repository

#### Scenario: Nested git root is used as-is
- **WHEN** the effective path is `.ai-config` and that directory is a git root inside the workspace
- **THEN** git operations MUST use that directory
- **AND** they MUST NOT use the workspace root repository

### Requirement: Empty remote URL skips git
When the effective `skilldex.remoteSkillsRepositoryUrl` is empty, the Host MUST NOT run git or the update command. The remote status MUST be that no repository is configured.

#### Scenario: Empty URL does not touch git
- **WHEN** `skilldex.remoteSkillsRepositoryUrl` is `""` or only whitespace
- **THEN** the Host MUST NOT execute git
- **AND** the Host MUST NOT execute the update command
- **AND** the remote status MUST indicate that no repository is configured

### Requirement: Catalog discovery ignores sync settings
Changing `skilldex.remoteSkillsRepositoryUrl`, `skilldex.localSkillsRepositoryPath`, or `skilldex.updateCommand` MUST NOT change which files `discoverCatalog` reads. Discovery MUST remain the workspace `.cursor/rules` and `.cursor/skills` trees.

#### Scenario: Sync settings leave the catalog source unchanged
- **WHEN** the local git path is `.ai-config` and the remote URL is set
- **THEN** discovered skills and rules MUST still come from the workspace `.cursor/` tree
- **AND** the Host MUST NOT clone or read catalog files from the remote URL

### Requirement: Remote status from the local git checkout
When the remote URL is non-empty, the Host SHALL compute status from the git checkout at the effective local path, not from catalog file contents. After a successful `fetch` of `origin`, it MUST compare `HEAD` with the upstream of the current branch. Status values SHALL be exactly one of: no repository configured; not a git repository; origin mismatch; checking; up to date; behind; dirty; error. Origin mismatch MUST use URL equivalence that ignores a trailing `.git` and treats `git@host:path` as equal to `https://host/path`. The Host MUST fetch when the dashboard session starts if the URL is non-empty, and MUST NOT fetch in a polling loop.

#### Scenario: Missing git root
- **WHEN** the remote URL is set and the local path has no git root
- **THEN** the status MUST be that the directory is not a git repository

#### Scenario: Origin does not match the configured URL
- **WHEN** the checkout `origin` fetch URL is not equivalent to `skilldex.remoteSkillsRepositoryUrl`
- **THEN** the status MUST be origin mismatch
- **AND** the Host MUST NOT pull

#### Scenario: Behind after fetch
- **WHEN** the current branch is clean and its upstream is strictly ahead of `HEAD`
- **THEN** the status MUST be behind

#### Scenario: Up to date after fetch
- **WHEN** the current branch is clean and `HEAD` matches its upstream
- **THEN** the status MUST be up to date

#### Scenario: Local uncommitted changes
- **WHEN** the git checkout has uncommitted changes
- **THEN** the status MUST be dirty
- **AND** the Host MUST NOT pull

#### Scenario: Fetch once on session start
- **WHEN** the dashboard Webview session starts and the remote URL is non-empty
- **THEN** the Host MUST fetch `origin` once before reporting behind or up to date
- **AND** it MUST NOT start a periodic fetch timer

### Requirement: Pull fast-forwards then runs the update command
When the Webview requests a pull and the status is behind, the Host SHALL run `git pull --ff-only` in the local git path. If that pull advances the current branch and `skilldex.updateCommand` is non-empty, the Host SHALL then run that command with the workspace root as the working directory. If the pull does not advance, the Host MUST NOT run the command. If the pull fails, the Host MUST NOT run the command and the status MUST be error. Git and the command MUST run in a visible terminal. The Host MUST NOT clone, change branch, rebase, push, or resolve conflicts.

#### Scenario: Pull when behind without a command
- **WHEN** the status is behind, the update command is empty, and the Webview requests a pull
- **THEN** the Host MUST fast-forward the local checkout
- **AND** it MUST NOT run any extra command
- **AND** a later status MUST be up to date when fetch shows no remaining upstream commits

#### Scenario: Command runs only after a fast-forward
- **WHEN** the status is behind, the update command is `bash .ai-config/scripts/sync-local.sh --skip-pull`, and the pull advances the branch
- **THEN** the Host MUST run that command with the workspace root as cwd
- **AND** it MUST run it after the pull, not instead of the pull

#### Scenario: Failed pull skips the command
- **WHEN** `git pull --ff-only` exits non-zero
- **THEN** the Host MUST NOT run the update command
- **AND** the status MUST be error

#### Scenario: Pull refused unless behind
- **WHEN** the status is up to date, dirty, origin mismatch, not a git repository, or no repository configured
- **THEN** a pull request MUST NOT change the git checkout
- **AND** the Host MUST NOT run the update command
