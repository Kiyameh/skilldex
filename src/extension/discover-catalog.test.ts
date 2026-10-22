import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { discoverCatalog } from "./discover-catalog.js";

const temporaryRoots: string[] = [];

async function createTempWorkspace(): Promise<string> {
  const root = await mkdtemp(path.join(os.tmpdir(), "skilldex-catalog-"));
  temporaryRoots.push(root);
  return root;
}

afterEach(async () => {
  await Promise.all(
    temporaryRoots.splice(0).map((root) => rm(root, { recursive: true, force: true })),
  );
});

describe("discoverCatalog", () => {
  it("discovers nested rules and skills with mapped metadata", async () => {
    const root = await createTempWorkspace();
    await mkdir(path.join(root, ".cursor", "rules", "nested"), { recursive: true });
    await mkdir(path.join(root, ".cursor", "skills", "nested", "demo-skill"), { recursive: true });

    await writeFile(
      path.join(root, ".cursor", "rules", "root-rule.mdc"),
      [
        "---",
        "title: Root Rule",
        "description: A root rule",
        'globs: "**/*.ts"',
        "---",
        "body",
      ].join("\n"),
    );
    await writeFile(
      path.join(root, ".cursor", "rules", "nested", "nested-rule.md"),
      [
        "---",
        "description: Nested rule",
        "globs:",
        "  - src/**",
        "  - test/**",
        "---",
        "body",
      ].join("\n"),
    );
    await writeFile(
      path.join(root, ".cursor", "skills", "nested", "demo-skill", "SKILL.md"),
      ["---", "name: demo-skill", "description: Nested skill", "---", "body"].join("\n"),
    );

    const catalog = await discoverCatalog(root);

    expect(catalog.rules).toHaveLength(2);
    expect(catalog.skills).toHaveLength(1);

    const rootRule = catalog.rules.find((item) => item.id === ".cursor/rules/root-rule.mdc");
    expect(rootRule).toMatchObject({
      kind: "rule",
      enabled: true,
      title: "Root Rule",
      description: "A root rule",
      globs: ["**/*.ts"],
    });
    expect(rootRule?.path).toBe(path.join(root, ".cursor", "rules", "root-rule.mdc"));

    const nestedRule = catalog.rules.find(
      (item) => item.id === ".cursor/rules/nested/nested-rule.md",
    );
    expect(nestedRule).toMatchObject({
      kind: "rule",
      enabled: true,
      title: "nested-rule",
      description: "Nested rule",
      globs: ["src/**", "test/**"],
    });

    expect(catalog.skills[0]).toMatchObject({
      id: ".cursor/skills/nested/demo-skill/SKILL.md",
      kind: "skill",
      enabled: true,
      title: "demo-skill",
      description: "Nested skill",
    });
  });

  it("maps enabled false and ignores vscode rules", async () => {
    const root = await createTempWorkspace();
    await mkdir(path.join(root, ".cursor", "rules"), { recursive: true });
    await mkdir(path.join(root, ".cursor", "skills", "disabled-skill"), { recursive: true });
    await mkdir(path.join(root, ".vscode", "rules"), { recursive: true });

    await writeFile(
      path.join(root, ".cursor", "rules", "disabled.mdc"),
      ["---", "enabled: false", "title: Disabled Rule", "---", "body"].join("\n"),
    );
    await writeFile(
      path.join(root, ".cursor", "skills", "disabled-skill", "SKILL.md"),
      ["---", "enabled: false", "description: Disabled skill", "---", "body"].join("\n"),
    );
    await writeFile(
      path.join(root, ".vscode", "rules", "ignored.mdc"),
      ["---", "title: Should Be Ignored", "---", "body"].join("\n"),
    );

    const catalog = await discoverCatalog(root);

    expect(catalog.rules).toHaveLength(1);
    expect(catalog.rules[0]).toMatchObject({
      id: ".cursor/rules/disabled.mdc",
      enabled: false,
      title: "Disabled Rule",
      globs: [],
    });
    expect(catalog.skills).toHaveLength(1);
    expect(catalog.skills[0]).toMatchObject({
      id: ".cursor/skills/disabled-skill/SKILL.md",
      enabled: false,
      title: "disabled-skill",
      description: "Disabled skill",
    });
  });

  it("treats non-boolean enabled values as true and uses folder name when skill name is missing", async () => {
    const root = await createTempWorkspace();
    await mkdir(path.join(root, ".cursor", "rules"), { recursive: true });
    await mkdir(path.join(root, ".cursor", "skills", "folder-named"), { recursive: true });

    await writeFile(
      path.join(root, ".cursor", "rules", "string-enabled.mdc"),
      ["---", 'enabled: "false"', "title: Still Enabled", "---", "body"].join("\n"),
    );
    await writeFile(
      path.join(root, ".cursor", "skills", "folder-named", "SKILL.md"),
      ["---", "description: No name field", "---", "body"].join("\n"),
    );

    const catalog = await discoverCatalog(root);

    expect(catalog.rules[0]?.enabled).toBe(true);
    expect(catalog.skills[0]).toMatchObject({
      title: "folder-named",
      description: "No name field",
      enabled: true,
    });
  });

  it("skips unreadable or broken files without failing the catalog", async () => {
    const root = await createTempWorkspace();
    await mkdir(path.join(root, ".cursor", "rules"), { recursive: true });
    await mkdir(path.join(root, ".cursor", "skills", "good-skill"), { recursive: true });

    await writeFile(
      path.join(root, ".cursor", "rules", "broken.mdc"),
      ["---", "title: [unclosed", "---", "body"].join("\n"),
    );
    await writeFile(
      path.join(root, ".cursor", "rules", "good.mdc"),
      ["---", "title: Good Rule", "---", "body"].join("\n"),
    );
    await writeFile(
      path.join(root, ".cursor", "skills", "good-skill", "SKILL.md"),
      ["---", "name: good-skill", "---", "body"].join("\n"),
    );

    const catalog = await discoverCatalog(root);

    expect(catalog.rules.some((item) => item.title === "Good Rule")).toBe(true);
    expect(catalog.skills).toHaveLength(1);
  });

  it("returns empty arrays when .cursor trees are missing", async () => {
    const root = await createTempWorkspace();
    await expect(discoverCatalog(root)).resolves.toEqual({ skills: [], rules: [] });
  });
});
