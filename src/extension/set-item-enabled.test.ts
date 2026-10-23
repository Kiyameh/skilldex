import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { setItemEnabled } from "./set-item-enabled.js";

const BODY_MARKER = "Preserve this Markdown body exactly.";

describe("setItemEnabled", () => {
  let workspaceRoot: string | undefined;

  afterEach(async () => {
    if (workspaceRoot === undefined) return;
    await rm(workspaceRoot, { recursive: true, force: true });
    workspaceRoot = undefined;
  });

  async function createWorkspace(): Promise<string> {
    workspaceRoot = await mkdtemp(path.join(os.tmpdir(), "skilldex-set-enabled-"));
    return workspaceRoot;
  }

  it("writes disable-model-invocation true on a skill off and preserves the Markdown body", async () => {
    const root = await createWorkspace();
    const skillDir = path.join(root, ".cursor", "skills", "temp-skill");
    await mkdir(skillDir, { recursive: true });
    const skillPath = path.join(skillDir, "SKILL.md");
    await writeFile(
      skillPath,
      ["---", "name: temp-skill", "description: Temporary", "---", BODY_MARKER, ""].join("\n"),
    );

    const result = await setItemEnabled(root, ".cursor/skills/temp-skill/SKILL.md", false);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.item.enabled).toBe(false);
    expect(result.item.title).toBe("temp-skill");

    const written = await readFile(skillPath, "utf8");
    expect(written).toContain("disable-model-invocation: true");
    expect(written).not.toContain("enabled:");
    expect(written).toContain(BODY_MARKER);
    expect(result.item.characterCount).toBe(Array.from(written).length);
  });

  it("omits characterCount when toggling a rule", async () => {
    const root = await createWorkspace();
    const rulesDir = path.join(root, ".cursor", "rules");
    await mkdir(rulesDir, { recursive: true });
    const rulePath = path.join(rulesDir, "sample.mdc");
    await writeFile(
      rulePath,
      ["---", "title: Sample", "alwaysApply: false", "---", BODY_MARKER, ""].join("\n"),
    );

    const result = await setItemEnabled(root, ".cursor/rules/sample.mdc", true);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.item.characterCount).toBeUndefined();
  });

  it("writes alwaysApply true on a rule on and preserves the body", async () => {
    const root = await createWorkspace();
    const rulesDir = path.join(root, ".cursor", "rules");
    await mkdir(rulesDir, { recursive: true });
    const rulePath = path.join(rulesDir, "sample.mdc");
    await writeFile(
      rulePath,
      [
        "---",
        "title: Sample Rule",
        'globs: "**/*.ts"',
        "alwaysApply: false",
        "---",
        BODY_MARKER,
        "",
      ].join("\n"),
    );

    const result = await setItemEnabled(root, ".cursor/rules/sample.mdc", true);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.item.enabled).toBe(true);
    expect(result.item.globs).toEqual(["**/*.ts"]);

    const written = await readFile(rulePath, "utf8");
    expect(written).toMatch(/alwaysApply:\s*true/);
    expect(written).toContain(BODY_MARKER);
    expect(written).not.toContain("alwaysApply: false");
  });

  it("leaves a residual enabled key unchanged when toggling", async () => {
    const root = await createWorkspace();
    const skillDir = path.join(root, ".cursor", "skills", "legacy");
    await mkdir(skillDir, { recursive: true });
    const skillPath = path.join(skillDir, "SKILL.md");
    await writeFile(
      skillPath,
      [
        "---",
        "name: legacy",
        "enabled: true",
        "---",
        BODY_MARKER,
        "",
      ].join("\n"),
    );

    const result = await setItemEnabled(root, ".cursor/skills/legacy/SKILL.md", false);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const written = await readFile(skillPath, "utf8");
    expect(written).toMatch(/enabled:\s*true/);
    expect(written).toContain("disable-model-invocation: true");
    expect(written).toContain(BODY_MARKER);
  });

  it("writes disable-model-invocation false when enabling a skill", async () => {
    const root = await createWorkspace();
    const skillDir = path.join(root, ".cursor", "skills", "temp-skill");
    await mkdir(skillDir, { recursive: true });
    const skillPath = path.join(skillDir, "SKILL.md");
    await writeFile(
      skillPath,
      [
        "---",
        "name: temp-skill",
        "disable-model-invocation: true",
        "---",
        BODY_MARKER,
        "",
      ].join("\n"),
    );

    const result = await setItemEnabled(root, ".cursor/skills/temp-skill/SKILL.md", true);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.item.enabled).toBe(true);

    const written = await readFile(skillPath, "utf8");
    expect(written).toMatch(/disable-model-invocation:\s*false/);
  });

  it("rejects ids outside the catalog directories", async () => {
    const root = await createWorkspace();
    const result = await setItemEnabled(root, ".vscode/rules/ignored.mdc", false);

    expect(result).toEqual({
      ok: false,
      error: "Unknown or invalid catalog item id: .vscode/rules/ignored.mdc",
    });
  });

  it("rejects path traversal ids", async () => {
    const root = await createWorkspace();
    const result = await setItemEnabled(root, "../outside.mdc", false);

    expect(result.ok).toBe(false);
  });
});
