import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { discoverCatalog } from "./discover-catalog.js";

suite("SkillDex catalog discovery", () => {
  test("discovers rules and skills with native keys, sections, version, and category", async () => {
    const workspaceRoot = await mkdtemp(path.join(os.tmpdir(), "skilldex-integration-catalog-"));

    try {
      await mkdir(path.join(workspaceRoot, ".cursor", "rules"), { recursive: true });
      await mkdir(
        path.join(workspaceRoot, ".cursor", "skills", "stack", "demo", "temp-skill"),
        { recursive: true },
      );
      await mkdir(path.join(workspaceRoot, ".cursor", "skills", "root-skill"), {
        recursive: true,
      });
      await mkdir(path.join(workspaceRoot, ".vscode", "rules"), { recursive: true });

      await writeFile(
        path.join(workspaceRoot, ".cursor", "rules", "sample.mdc"),
        [
          "---",
          "title: Sample Rule",
          'globs: "**/*.ts"',
          "alwaysApply: true",
          "---",
          "## First Section",
          "body",
        ].join("\n"),
      );
      await writeFile(
        path.join(
          workspaceRoot,
          ".cursor",
          "skills",
          "stack",
          "demo",
          "temp-skill",
          "SKILL.md",
        ),
        [
          "---",
          "name: temp-skill",
          "description: Temporary skill",
          "metadata:",
          '  version: "1.0.0"',
          "disable-model-invocation: true",
          "---",
          "body",
        ].join("\n"),
      );
      await writeFile(
        path.join(workspaceRoot, ".cursor", "skills", "root-skill", "SKILL.md"),
        ["---", "name: root-skill", "description: Root skill", "---", "body"].join("\n"),
      );
      await writeFile(
        path.join(workspaceRoot, ".vscode", "rules", "ignored.mdc"),
        ["---", "title: Ignored", "---", "body"].join("\n"),
      );

      const catalog = await discoverCatalog(workspaceRoot);

      assert.equal(catalog.rules.length, 1);
      assert.equal(catalog.skills.length, 2);
      assert.equal(catalog.rules[0]?.title, "Sample Rule");
      assert.equal(catalog.rules[0]?.enabled, true);
      assert.deepEqual(catalog.rules[0]?.globs, ["**/*.ts"]);
      assert.deepEqual(catalog.rules[0]?.sections, ["First Section"]);

      const nestedSkill = catalog.skills.find((item) => item.title === "temp-skill");
      assert.equal(nestedSkill?.enabled, false);
      assert.equal(nestedSkill?.version, "1.0.0");
      assert.equal(nestedSkill?.category, "stack");

      const rootSkill = catalog.skills.find((item) => item.title === "root-skill");
      assert.equal(rootSkill?.enabled, true);
      assert.equal(rootSkill?.category, undefined);

      assert.equal(
        catalog.rules.some((item) => item.id.includes(".vscode")),
        false,
      );
    } finally {
      await rm(workspaceRoot, { recursive: true, force: true });
    }
  });
});
