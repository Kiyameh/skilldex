import { execFileSync } from "node:child_process";
import { mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  installSkillReadHook,
  mergeSkillReadHookConfig,
  SKILL_READ_HOOK_COMMAND,
} from "./skill-read-hook.js";

const ALLOW_OUTPUT = '{"permission":"allow"}\n';

describe("mergeSkillReadHookConfig", () => {
  it("creates a versioned config when hooks.json does not exist", () => {
    const result = mergeSkillReadHookConfig(undefined);

    expect(result.status).toBe("updated");
    if (result.status !== "updated") return;
    expect(JSON.parse(result.content)).toEqual({
      version: 1,
      hooks: { beforeReadFile: [{ command: SKILL_READ_HOOK_COMMAND }] },
    });
  });

  it("keeps the other hooks and entries of the user", () => {
    const current = JSON.stringify({
      version: 1,
      hooks: {
        afterFileEdit: [{ command: "./hooks/format.sh" }],
        beforeReadFile: [{ command: "./hooks/redact.sh", failClosed: true }],
      },
    });

    const result = mergeSkillReadHookConfig(current);

    expect(result.status).toBe("updated");
    if (result.status !== "updated") return;
    expect(JSON.parse(result.content)).toEqual({
      version: 1,
      hooks: {
        afterFileEdit: [{ command: "./hooks/format.sh" }],
        beforeReadFile: [
          { command: "./hooks/redact.sh", failClosed: true },
          { command: SKILL_READ_HOOK_COMMAND },
        ],
      },
    });
  });

  it("does not duplicate its own entry when merged again", () => {
    const first = mergeSkillReadHookConfig(undefined);
    if (first.status !== "updated") throw new Error("expected an update");

    expect(mergeSkillReadHookConfig(first.content)).toEqual({ status: "unchanged" });
  });

  it("leaves an unreadable config untouched", () => {
    expect(mergeSkillReadHookConfig("{ not json")).toEqual({ status: "invalid" });
    expect(mergeSkillReadHookConfig("[]")).toEqual({ status: "invalid" });
    expect(mergeSkillReadHookConfig('{"hooks":[]}')).toEqual({ status: "invalid" });
    expect(mergeSkillReadHookConfig('{"hooks":{"beforeReadFile":{}}}')).toEqual({
      status: "invalid",
    });
  });
});

describe("installSkillReadHook", () => {
  let cursorDirectory = "";
  let spoolPath = "";
  let shellScriptPath = "";

  beforeEach(async () => {
    cursorDirectory = await mkdtemp(path.join(os.tmpdir(), "skilldex hook-"));
    spoolPath = path.join(
      cursorDirectory,
      "global storage",
      "live-activations",
      "skill-reads.jsonl",
    );
    shellScriptPath = path.join(cursorDirectory, "hooks", "skilldex-skill-read.sh");
  });

  afterEach(async () => {
    await rm(cursorDirectory, { recursive: true, force: true });
  });

  function install(): ReturnType<typeof installSkillReadHook> {
    return installSkillReadHook({ cursorDirectory, spoolPath, nodeExecutable: process.execPath });
  }

  function runHook(stdin: string): string {
    return execFileSync(shellScriptPath, { input: stdin, encoding: "utf8" });
  }

  async function readSpool(): Promise<string> {
    return readFile(spoolPath, "utf8");
  }

  it("merges into hooks.json on disk and is idempotent", async () => {
    await writeFile(
      path.join(cursorDirectory, "hooks.json"),
      JSON.stringify({ version: 1, hooks: { stop: [{ command: "./hooks/notify.sh" }] } }),
    );

    await expect(install()).resolves.toMatchObject({ status: "updated" });
    await expect(install()).resolves.toEqual({ status: "unchanged" });

    const config: unknown = JSON.parse(
      await readFile(path.join(cursorDirectory, "hooks.json"), "utf8"),
    );
    expect(config).toEqual({
      version: 1,
      hooks: {
        stop: [{ command: "./hooks/notify.sh" }],
        beforeReadFile: [{ command: SKILL_READ_HOOK_COMMAND }],
      },
    });
  });

  it("does not overwrite an invalid hooks.json", async () => {
    const hooksConfigPath = path.join(cursorDirectory, "hooks.json");
    await writeFile(hooksConfigPath, "{ broken");

    await expect(install()).resolves.toEqual({ status: "invalid" });
    await expect(readFile(hooksConfigPath, "utf8")).resolves.toBe("{ broken");
  });

  it("writes an executable script", async () => {
    await install();

    expect((await stat(shellScriptPath)).mode & 0o111).not.toBe(0);
  });

  it("allows a SKILL.md read and appends one spool line", async () => {
    await install();

    const output = runHook(
      JSON.stringify({
        file_path: "/repo/.cursor/skills/maquetado/SKILL.md",
        content: "# Maquetado",
        conversation_id: "c-1",
        workspace_roots: ["/repo"],
      }),
    );

    expect(output).toBe(ALLOW_OUTPUT);
    const lines = (await readSpool()).trimEnd().split("\n");
    expect(lines.map((line) => JSON.parse(line) as unknown)).toEqual([
      {
        path: "/repo/.cursor/skills/maquetado/SKILL.md",
        conversationId: "c-1",
        workspaceRoots: ["/repo"],
      },
    ]);
  });

  it("allows any other read and invalid stdin without touching the spool", async () => {
    await install();

    expect(runHook(JSON.stringify({ file_path: "/repo/src/App.tsx", workspace_roots: [] }))).toBe(
      ALLOW_OUTPUT,
    );
    expect(runHook(JSON.stringify({ file_path: "/repo/SKILL.md.bak", content: 'SKILL.md"' }))).toBe(
      ALLOW_OUTPUT,
    );
    expect(runHook('not json SKILL.md"')).toBe(ALLOW_OUTPUT);
    expect(runHook("")).toBe(ALLOW_OUTPUT);
    await expect(readSpool()).rejects.toMatchObject({ code: "ENOENT" });
  });
});
