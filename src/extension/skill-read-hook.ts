import { chmod, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export const SKILL_READ_HOOK_EVENT = "beforeReadFile";
export const SKILL_READ_HOOK_COMMAND = "./hooks/skilldex-skill-read.sh";
const HOOKS_CONFIG_FILE_NAME = "hooks.json";
const SHELL_SCRIPT_FILE_NAME = "skilldex-skill-read.sh";
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

export function mergeSkillReadHookConfig(currentText: string | undefined): HookConfigMergeResult {
  const config =
    currentText === undefined
      ? { version: HOOKS_CONFIG_VERSION, hooks: {} }
      : parseHookConfig(currentText);
  if (config === undefined) return { status: "invalid" };

  const hooks = config["hooks"] ?? {};
  if (!isRecord(hooks)) return { status: "invalid" };
  const eventEntries = hooks[SKILL_READ_HOOK_EVENT] ?? [];
  if (!Array.isArray(eventEntries)) return { status: "invalid" };

  const alreadyInstalled = eventEntries.some(
    (entry: unknown) => isRecord(entry) && entry["command"] === SKILL_READ_HOOK_COMMAND,
  );
  if (alreadyInstalled) return { status: "unchanged" };

  const merged = {
    ...config,
    version: config["version"] ?? HOOKS_CONFIG_VERSION,
    hooks: {
      ...hooks,
      [SKILL_READ_HOOK_EVENT]: [...eventEntries, { command: SKILL_READ_HOOK_COMMAND }],
    },
  };
  return { status: "updated", content: `${JSON.stringify(merged, null, 2)}\n` };
}

function quoteForShell(value: string): string {
  return `'${value.replaceAll("'", `'\\''`)}'`;
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

export const SKILL_READ_PARSER_SCRIPT = `"use strict";
const fs = require("node:fs");
const path = require("node:path");

try {
  const spoolPath = process.argv[2];
  const event = JSON.parse(fs.readFileSync(0, "utf8"));
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
  const hooksDirectory = path.join(options.cursorDirectory, "hooks");
  const parserScriptPath = path.join(hooksDirectory, PARSER_SCRIPT_FILE_NAME);
  const shellScriptPath = path.join(hooksDirectory, SHELL_SCRIPT_FILE_NAME);

  await mkdir(hooksDirectory, { recursive: true });
  await mkdir(path.dirname(options.spoolPath), { recursive: true });
  await writeFile(parserScriptPath, SKILL_READ_PARSER_SCRIPT);
  await writeFile(
    shellScriptPath,
    renderSkillReadShellScript({
      nodeExecutable: options.nodeExecutable,
      parserScriptPath,
      spoolPath: options.spoolPath,
    }),
  );
  await chmod(shellScriptPath, EXECUTABLE_FILE_MODE);

  const hooksConfigPath = path.join(options.cursorDirectory, HOOKS_CONFIG_FILE_NAME);
  const result = mergeSkillReadHookConfig(await readOptionalFile(hooksConfigPath));
  if (result.status === "updated") await writeFile(hooksConfigPath, result.content);
  return result;
}
