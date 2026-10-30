import assert from "node:assert/strict";
import * as vscode from "vscode";
import { OPEN_DASHBOARD_COMMAND } from "./constants.js";

const SKILLDEX_EXTENSION_ID = "andoni.skilldex";

suite("SkillDex extension scaffold", () => {
  test("activates and registers the open dashboard command", async () => {
    const extension = vscode.extensions.getExtension(SKILLDEX_EXTENSION_ID);
    assert.ok(extension, "SkillDex extension should be installed in the test host");

    await extension.activate();
    assert.equal(extension.isActive, true);

    const commands = await vscode.commands.getCommands(true);
    assert.ok(
      commands.includes(OPEN_DASHBOARD_COMMAND),
      `${OPEN_DASHBOARD_COMMAND} should be registered`,
    );
  });

  test("exposes SkillDex setting defaults after activation", async () => {
    const extension = vscode.extensions.getExtension(SKILLDEX_EXTENSION_ID);
    assert.ok(extension, "SkillDex extension should be installed in the test host");

    await extension.activate();

    const configuration = vscode.workspace.getConfiguration("skilldex");
    assert.equal(configuration.get("showSkills"), true);
    assert.equal(configuration.get("showRules"), true);
    assert.equal(configuration.get("showLiveArea"), true);
    assert.equal(configuration.get("ai-tool-directory"), ".cursor");
    assert.equal(configuration.get("remoteSkillsRepositoryUrl"), undefined);
  });
});
