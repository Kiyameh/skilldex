import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import * as vscode from "vscode";
import {
  CATALOG_LIVE_SYNC_DEBOUNCE_MS,
  startCatalogLiveSync,
} from "./catalog-live-sync.js";
import type { CatalogPayload } from "../shared/index.js";

const POLL_INTERVAL_MS = 50;
const WAIT_TIMEOUT_MS = 5_000;

async function waitForCatalog(
  getLatest: () => CatalogPayload | undefined,
  predicate: (catalog: CatalogPayload) => boolean,
): Promise<CatalogPayload> {
  const deadline = Date.now() + WAIT_TIMEOUT_MS;

  while (Date.now() < deadline) {
    const catalog = getLatest();
    if (catalog !== undefined && predicate(catalog)) return catalog;
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }

  throw new Error("Timed out waiting for catalog live-sync refresh");
}

suite("SkillDex catalog live sync", () => {
  test("refreshes catalog after skill edit and rule delete, then stops after dispose", async () => {
    const workspaceRoot = await mkdtemp(
      path.join(os.tmpdir(), "skilldex-integration-live-sync-"),
    );
    const skillDir = path.join(workspaceRoot, ".cursor", "skills", "temp-skill");
    const rulesDir = path.join(workspaceRoot, ".cursor", "rules");
    const skillPath = path.join(skillDir, "SKILL.md");
    const rulePath = path.join(rulesDir, "sample.mdc");

    let latestCatalog: CatalogPayload | undefined;
    let pushCount = 0;

    try {
      await mkdir(skillDir, { recursive: true });
      await mkdir(rulesDir, { recursive: true });

      await writeFile(
        skillPath,
        [
          "---",
          "name: temp-skill",
          "description: Temporary skill",
          "---",
          "body",
        ].join("\n"),
      );
      await writeFile(
        rulePath,
        ["---", "title: Sample Rule", 'globs: "**/*.ts"', "---", "body"].join("\n"),
      );

      const workspaceFolder: vscode.WorkspaceFolder = {
        uri: vscode.Uri.file(workspaceRoot),
        name: path.basename(workspaceRoot),
        index: 0,
      };

      const sync = startCatalogLiveSync({
        getWorkspaceFolder: () => workspaceFolder,
        createFileSystemWatcher: (base, globPattern) =>
          vscode.workspace.createFileSystemWatcher(
            new vscode.RelativePattern(base, globPattern),
          ),
        debounceMs: CATALOG_LIVE_SYNC_DEBOUNCE_MS,
      });

      sync.setCatalogSink((catalog) => {
        latestCatalog = catalog;
        pushCount += 1;
      });

      // Give watchers a moment to attach before mutating files.
      await new Promise((resolve) => setTimeout(resolve, 200));

      await writeFile(
        skillPath,
        [
          "---",
          "name: temp-skill",
          "description: Updated skill description",
          "---",
          "body",
        ].join("\n"),
      );

      const afterEdit = await waitForCatalog(
        () => latestCatalog,
        (catalog) =>
          catalog.skills.some((skill) => skill.description === "Updated skill description") &&
          catalog.rules.length === 1,
      );
      assert.equal(afterEdit.skills[0]?.description, "Updated skill description");
      assert.equal(afterEdit.rules.length, 1);

      const pushCountAfterEdit = pushCount;

      await rm(rulePath);

      const afterDelete = await waitForCatalog(
        () => latestCatalog,
        (catalog) => catalog.rules.length === 0,
      );
      assert.equal(afterDelete.rules.length, 0);
      assert.equal(afterDelete.skills.length, 1);
      assert.ok(pushCount > pushCountAfterEdit);

      sync.dispose();
      const pushCountAfterDispose = pushCount;

      await writeFile(
        skillPath,
        [
          "---",
          "name: temp-skill",
          "description: Should not refresh",
          "---",
          "body",
        ].join("\n"),
      );
      await new Promise((resolve) =>
        setTimeout(resolve, CATALOG_LIVE_SYNC_DEBOUNCE_MS + 400),
      );

      assert.equal(pushCount, pushCountAfterDispose);
      assert.notEqual(latestCatalog?.skills[0]?.description, "Should not refresh");
    } finally {
      await rm(workspaceRoot, { recursive: true, force: true });
    }
  });
});
