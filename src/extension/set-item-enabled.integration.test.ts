import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { setItemEnabled } from "./set-item-enabled.js";

const SKILL_BODY = "Skill body line that must survive toggle.";
const RULE_BODY = "Rule body line that must survive toggle.";

suite("SkillDex setItemEnabled", () => {
  test("toggles a skill and a rule in a temporary workspace preserving bodies", async () => {
    const workspaceRoot = await mkdtemp(path.join(os.tmpdir(), "skilldex-integration-toggle-"));

    try {
      const skillDir = path.join(workspaceRoot, ".cursor", "skills", "temp-skill");
      const rulesDir = path.join(workspaceRoot, ".cursor", "rules");
      await mkdir(skillDir, { recursive: true });
      await mkdir(rulesDir, { recursive: true });

      const skillPath = path.join(skillDir, "SKILL.md");
      const rulePath = path.join(rulesDir, "sample.mdc");

      await writeFile(
        skillPath,
        ["---", "name: temp-skill", "description: Temporary skill", "---", SKILL_BODY, ""].join(
          "\n",
        ),
      );
      await writeFile(
        rulePath,
        [
          "---",
          "title: Sample Rule",
          'globs: "**/*.ts"',
          "enabled: false",
          "---",
          RULE_BODY,
          "",
        ].join("\n"),
      );

      const skillOff = await setItemEnabled(
        workspaceRoot,
        ".cursor/skills/temp-skill/SKILL.md",
        false,
      );
      assert.equal(skillOff.ok, true);
      if (!skillOff.ok) return;
      assert.equal(skillOff.item.enabled, false);

      const skillContents = await readFile(skillPath, "utf8");
      assert.match(skillContents, /enabled:\s*false/);
      assert.ok(skillContents.includes(SKILL_BODY));

      const ruleOn = await setItemEnabled(workspaceRoot, ".cursor/rules/sample.mdc", true);
      assert.equal(ruleOn.ok, true);
      if (!ruleOn.ok) return;
      assert.equal(ruleOn.item.enabled, true);

      const ruleContents = await readFile(rulePath, "utf8");
      assert.match(ruleContents, /enabled:\s*true/);
      assert.ok(ruleContents.includes(RULE_BODY));

      const ruleOff = await setItemEnabled(workspaceRoot, ".cursor/rules/sample.mdc", false);
      assert.equal(ruleOff.ok, true);
      if (!ruleOff.ok) return;
      assert.equal(ruleOff.item.enabled, false);

      const ruleContentsAfterOff = await readFile(rulePath, "utf8");
      assert.match(ruleContentsAfterOff, /enabled:\s*false/);
      assert.ok(ruleContentsAfterOff.includes(RULE_BODY));
    } finally {
      await rm(workspaceRoot, { recursive: true, force: true });
    }
  });
});
