import { chmod, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export const SKILL_READ_HOOK_EVENT = "beforeReadFile";
export const SKILL_READ_HOOK_SHELL_COMMAND = "./hooks/skilldex-skill-read.sh";
export const SKILL_READ_HOOK_WINDOWS_COMMAND =
  "powershell -NoProfile -ExecutionPolicy Bypass -File ./hooks/skilldex-skill-read.ps1";
export const SKILL_READ_HOOK_COMMAND = SKILL_READ_HOOK_SHELL_COMMAND;

const SKILLDEX_HOOK_COMMANDS = new Set<string>([
  SKILL_READ_HOOK_SHELL_COMMAND,
  SKILL_READ_HOOK_WINDOWS_COMMAND,
]);
const HOOKS_CONFIG_FILE_NAME = "hooks.json";
const SHELL_SCRIPT_FILE_NAME = "skilldex-skill-read.sh";
const POWERSHELL_SCRIPT_FILE_NAME = "skilldex-skill-read.ps1";
const PARSER_SCRIPT_FILE_NAME = "skilldex-skill-read.cjs";
const HOOKS_CONFIG_VERSION = 1;
const EXECUTABLE_FILE_MODE = 0o755;

export type HookConfigMergeResult =
  { status: "unchanged" } | { status: "updated"; content: string } | { status: "invalid" };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseHookConfig(text: string): Record<string, unknown> | undefined {
  try {
    const parsed: unknown = JSON.parse(text);
    return isRecord(parsed) ? parsed : undefined;
  } catch {
    return undefined;
  }
}

export function skillReadHookCommand(platform: NodeJS.Platform = process.platform): string {
  if (platform === "win32") return SKILL_READ_HOOK_WINDOWS_COMMAND;
  return SKILL_READ_HOOK_SHELL_COMMAND;
}

function isSkilldexHookEntry(entry: unknown): entry is { command: string } {
  return (
    isRecord(entry) &&
    typeof entry["command"] === "string" &&
    SKILLDEX_HOOK_COMMANDS.has(entry["command"])
  );
}

export function mergeSkillReadHookConfig(
  currentText: string | undefined,
  platform: NodeJS.Platform = process.platform,
): HookConfigMergeResult {
  const config =
    currentText === undefined
      ? { version: HOOKS_CONFIG_VERSION, hooks: {} }
      : parseHookConfig(currentText);
  if (config === undefined) return { status: "invalid" };

  const hooks = config["hooks"] ?? {};
  if (!isRecord(hooks)) return { status: "invalid" };
  const eventEntries = hooks[SKILL_READ_HOOK_EVENT] ?? [];
  if (!Array.isArray(eventEntries)) return { status: "invalid" };

  const command = skillReadHookCommand(platform);
  const hasCurrentCommand = eventEntries.some(
    (entry: unknown) => isRecord(entry) && entry["command"] === command,
  );
  const hasRetiredCommand = eventEntries.some(
    (entry: unknown) => isSkilldexHookEntry(entry) && entry.command !== command,
  );
  if (hasCurrentCommand && !hasRetiredCommand) return { status: "unchanged" };

  const keptEntries = eventEntries.filter((entry: unknown) => !isSkilldexHookEntry(entry));
  const merged = {
    ...config,
    version: config["version"] ?? HOOKS_CONFIG_VERSION,
    hooks: {
      ...hooks,
      [SKILL_READ_HOOK_EVENT]: [...keptEntries, { command }],
    },
  };
  return { status: "updated", content: `${JSON.stringify(merged, null, 2)}\n` };
}

function quoteForShell(value: string): string {
  return `'${value.replaceAll("'", `'\\''`)}'`;
}

function quoteForPowerShell(value: string): string {
  return `'${value.replaceAll("'", "''")}'`;
}

export interface SkillReadHookScriptPaths {
  nodeExecutable: string;
  parserScriptPath: string;
  spoolPath: string;
}

/**
 * The cheap `case` prefilter avoids starting a Node process on every file the agent reads.
 * The parser runs in the foreground because Cursor may kill the hook's process group on exit.
 */
export function renderSkillReadShellScript(paths: SkillReadHookScriptPaths): string {
  const parserCommand = [
    "ELECTRON_RUN_AS_NODE=1",
    quoteForShell(paths.nodeExecutable),
    quoteForShell(paths.parserScriptPath),
    quoteForShell(paths.spoolPath),
  ].join(" ");

  return [
    "#!/bin/sh",
    "input=$(cat)",
    'case "$input" in',
    `  *'SKILL.md"'*) printf '%s' "$input" | ${parserCommand} >/dev/null 2>&1 ;;`,
    "esac",
    `printf '%s\\n' '{"permission":"allow"}'`,
    "exit 0",
    "",
  ].join("\n");
}

/**
 * The cheap prefilter avoids starting a Node process on every file the agent reads.
 * The parser runs in the foreground because Cursor may kill the hook's process group on exit.
 * Cursor runs user hooks through PowerShell, which cannot pipe stdin into a `.sh`.
 */
export function renderSkillReadPowerShellScript(paths: SkillReadHookScriptPaths): string {
  const nodeExecutable = quoteForPowerShell(paths.nodeExecutable);
  const parserScriptPath = quoteForPowerShell(paths.parserScriptPath);
  const spoolPath = quoteForPowerShell(paths.spoolPath);

  return [
    "$ErrorActionPreference = 'Continue'",
    "$hookInput = ''",
    "if ([Console]::IsInputRedirected) { $hookInput = [Console]::In.ReadToEnd() }",
    "if ([string]::IsNullOrEmpty($hookInput)) { $hookInput = @($input) -join '' }",
    "try {",
    "  if ($hookInput.Contains('SKILL.md\"')) {",
    "    $env:ELECTRON_RUN_AS_NODE = '1'",
    `    $hookInput | & ${nodeExecutable} ${parserScriptPath} ${spoolPath} > $null 2>&1`,
    "  }",
    "} catch {}",
    '[Console]::Out.WriteLine(\'{"permission":"allow"}\')',
    "exit 0",
    "",
  ].join("\n");
}

export const SKILL_READ_PARSER_SCRIPT = `"use strict";
const fs = require("node:fs");
const path = require("node:path");

try {
  const spoolPath = process.argv[2];
  let raw = fs.readFileSync(0, "utf8");
  if (raw.charCodeAt(0) === 0xfeff) raw = raw.slice(1);
  const event = JSON.parse(raw);
  const filePath = event.file_path;
  if (typeof spoolPath === "string" && typeof filePath === "string" && path.basename(filePath) === "SKILL.md") {
    const line = JSON.stringify({
      path: filePath,
      conversationId: typeof event.conversation_id === "string" ? event.conversation_id : null,
      workspaceRoots: Array.isArray(event.workspace_roots) ? event.workspace_roots : [],
    });
    fs.mkdirSync(path.dirname(spoolPath), { recursive: true });
    fs.appendFileSync(spoolPath, line + "\\n");
  }
} catch {}
`;

export interface InstallSkillReadHookOptions {
  cursorDirectory: string;
  spoolPath: string;
  nodeExecutable: string;
  platform?: NodeJS.Platform;
}

async function readOptionalFile(filePath: string): Promise<string | undefined> {
  try {
    return await readFile(filePath, "utf8");
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") return undefined;
    throw error;
  }
}

export async function installSkillReadHook(
  options: InstallSkillReadHookOptions,
): Promise<HookConfigMergeResult> {
  const platform = options.platform ?? process.platform;
  const hooksDirectory = path.join(options.cursorDirectory, "hooks");
  const parserScriptPath = path.join(hooksDirectory, PARSER_SCRIPT_FILE_NAME);
  const scriptPaths = {
    nodeExecutable: options.nodeExecutable,
    parserScriptPath,
    spoolPath: options.spoolPath,
  };

  await mkdir(hooksDirectory, { recursive: true });
  await mkdir(path.dirname(options.spoolPath), { recursive: true });
  await writeFile(parserScriptPath, SKILL_READ_PARSER_SCRIPT);
  if (platform === "win32") {
    await writeFile(
      path.join(hooksDirectory, POWERSHELL_SCRIPT_FILE_NAME),
      renderSkillReadPowerShellScript(scriptPaths),
    );
  } else {
    const shellScriptPath = path.join(hooksDirectory, SHELL_SCRIPT_FILE_NAME);
    await writeFile(shellScriptPath, renderSkillReadShellScript(scriptPaths));
    await chmod(shellScriptPath, EXECUTABLE_FILE_MODE);
  }

  const hooksConfigPath = path.join(options.cursorDirectory, HOOKS_CONFIG_FILE_NAME);
  const result = mergeSkillReadHookConfig(await readOptionalFile(hooksConfigPath), platform);
  if (result.status === "updated") await writeFile(hooksConfigPath, result.content);
  return result;
}
