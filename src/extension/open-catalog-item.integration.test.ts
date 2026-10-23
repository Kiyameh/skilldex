import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import * as vscode from "vscode";
import { openCatalogItem } from "./open-catalog-item.js";

suite("SkillDex openCatalogItem", () => {
  test("opens skill and rule files via showTextDocument and fails safely for missing files", async () => {
    const workspaceRoot = await mkdtemp(path.join(os.tmpdir(), "skilldex-integration-open-"));
    const openedPaths: string[] = [];
    const originalShowTextDocument = vscode.window.showTextDocument;

    try {
      const skillDir = path.join(workspaceRoot, ".cursor", "skills", "temp-skill");
      const rulesDir = path.join(workspaceRoot, ".cursor", "rules");
      await mkdir(skillDir, { recursive: true });
      await mkdir(rulesDir, { recursive: true });

      const skillPath = path.join(skillDir, "SKILL.md");
      const rulePath = path.join(rulesDir, "sample.mdc");
      const skillId = ".cursor/skills/temp-skill/SKILL.md";
      const ruleId = ".cursor/rules/sample.mdc";
      const missingId = ".cursor/skills/missing/SKILL.md";

      await writeFile(
        skillPath,
        ["---", "name: temp-skill", "description: Temporary skill", "---", "Skill body", ""].join(
          "\n",
        ),
      );
      await writeFile(
        rulePath,
        ["---", "title: Sample Rule", 'globs: "**/*.ts"', "---", "Rule body", ""].join("\n"),
      );

      (
        vscode.window as { showTextDocument: typeof vscode.window.showTextDocument }
      ).showTextDocument = (async (document: vscode.Uri | vscode.TextDocument) => {
        const uri = document instanceof vscode.Uri ? document : document.uri;
        openedPaths.push(uri.fsPath);
        return {} as vscode.TextEditor;
      }) as typeof vscode.window.showTextDocument;

      const skillResult = await openCatalogItem(workspaceRoot, skillId);
      assert.equal(skillResult.ok, true);
      if (!skillResult.ok) return;
      assert.equal(skillResult.id, skillId);
      assert.ok(openedPaths.includes(skillPath));

      const ruleResult = await openCatalogItem(workspaceRoot, ruleId);
      assert.equal(ruleResult.ok, true);
      if (!ruleResult.ok) return;
      assert.equal(ruleResult.id, ruleId);
      assert.ok(openedPaths.includes(rulePath));

      const missingResult = await openCatalogItem(workspaceRoot, missingId);
      assert.equal(missingResult.ok, false);
      if (missingResult.ok) return;
      assert.equal(missingResult.id, missingId);
      assert.ok(missingResult.error.length > 0);
      assert.equal(openedPaths.filter((entry) => entry.includes("missing")).length, 0);
    } finally {
      (
        vscode.window as { showTextDocument: typeof vscode.window.showTextDocument }
      ).showTextDocument = originalShowTextDocument;
      await rm(workspaceRoot, { recursive: true, force: true });
    }
  });
});
