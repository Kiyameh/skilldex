import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { discoverCatalog } from "./discover-catalog.js";

suite("SkillDex catalog discovery", () => {
  test("discovers rules and skills from a temporary workspace including disabled items", async () => {
    const workspaceRoot = await mkdtemp(path.join(os.tmpdir(), "skilldex-integration-catalog-"));

    try {
      await mkdir(path.join(workspaceRoot, ".cursor", "rules"), { recursive: true });
      await mkdir(path.join(workspaceRoot, ".cursor", "skills", "temp-skill"), { recursive: true });
      await mkdir(path.join(workspaceRoot, ".vscode", "rules"), { recursive: true });

      await writeFile(
        path.join(workspaceRoot, ".cursor", "rules", "sample.mdc"),
        ["---", "title: Sample Rule", 'globs: "**/*.ts"', "---", "body"].join("\n"),
      );
      await writeFile(
        path.join(workspaceRoot, ".cursor", "skills", "temp-skill", "SKILL.md"),
        [
          "---",
          "name: temp-skill",
          "description: Temporary skill",
          "enabled: false",
          "---",
          "body",
        ].join("\n"),
      );
      await writeFile(
        path.join(workspaceRoot, ".vscode", "rules", "ignored.mdc"),
        ["---", "title: Ignored", "---", "body"].join("\n"),
      );

      const catalog = await discoverCatalog(workspaceRoot);

      assert.equal(catalog.rules.length, 1);
      assert.equal(catalog.skills.length, 1);
      assert.equal(catalog.rules[0]?.title, "Sample Rule");
      assert.equal(catalog.rules[0]?.enabled, true);
      assert.deepEqual(catalog.rules[0]?.globs, ["**/*.ts"]);
      assert.equal(catalog.skills[0]?.title, "temp-skill");
      assert.equal(catalog.skills[0]?.enabled, false);
      assert.equal(
        catalog.rules.some((item) => item.id.includes(".vscode")),
        false,
      );
    } finally {
      await rm(workspaceRoot, { recursive: true, force: true });
    }
  });
});
