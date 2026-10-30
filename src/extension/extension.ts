import os from "node:os";
import type { ExtensionContext } from "vscode";
import { commands, ExtensionMode, RelativePattern, window, workspace } from "vscode";
import { startCatalogLiveSync, type CatalogLiveSync } from "./catalog-live-sync.js";
import { AI_TOOL_DIRECTORY_SETTING } from "./catalog-paths.js";
import {
  DASHBOARD_VIEW_ID,
  OPEN_DASHBOARD_COMMAND,
  SKILLDEX_CONFIGURATION_SECTION,
} from "./constants.js";
import { readAiToolDirectory } from "./read-skilldex-settings.js";
import { DashboardViewProvider } from "./dashboard-view-provider.js";
import { resolveLiveActivationPaths, type LiveActivationPaths } from "./live-activation-paths.js";
import { installSkillReadHook } from "./skill-read-hook.js";
import {
  createSelectedWorkspaceFolder,
  type SelectedWorkspaceFolder,
} from "./selected-workspace-folder.js";

let catalogLiveSync: CatalogLiveSync | undefined;
let selectedWorkspaceFolder: SelectedWorkspaceFolder | undefined;

/** Integration tests run in Test mode and must not edit the developer's real ~/.cursor/hooks.json. */
function installSkillReadHookOutsideTests(
  context: ExtensionContext,
  liveActivationPaths: LiveActivationPaths,
): void {
  if (context.extensionMode === ExtensionMode.Test) return;
  installSkillReadHook({
    cursorDirectory: liveActivationPaths.cursorDirectory,
    spoolPath: liveActivationPaths.spoolPath,
    nodeExecutable: process.execPath,
  })
    .then((result) => {
      if (result.status === "invalid") {
        console.warn(
          "SkillDex could not register its skill read hook: ~/.cursor/hooks.json is not valid",
        );
      }
    })
    .catch((error: unknown) => {
      console.warn("SkillDex could not install its skill read hook", error);
    });
}

export function activate(context: ExtensionContext): void {
  const liveActivationPaths = resolveLiveActivationPaths(
    os.homedir(),
    context.globalStorageUri.fsPath,
  );
  installSkillReadHookOutsideTests(context, liveActivationPaths);

  selectedWorkspaceFolder = createSelectedWorkspaceFolder({
    getWorkspaceFolders: () => workspace.workspaceFolders ?? [],
    workspaceState: context.workspaceState,
    onDidChangeWorkspaceFolders: (listener) => workspace.onDidChangeWorkspaceFolders(listener),
  });
  catalogLiveSync = startCatalogLiveSync({
    getWorkspaceFolder: () => selectedWorkspaceFolder?.getSelectedFolder(),
    getAiToolDirectory: () =>
      readAiToolDirectory(workspace.getConfiguration(SKILLDEX_CONFIGURATION_SECTION)),
    createFileSystemWatcher: (base, globPattern) =>
      workspace.createFileSystemWatcher(new RelativePattern(base, globPattern)),
  });
  const selectionChanges = selectedWorkspaceFolder.onDidChange((change) => {
    if (!change.selectionChanged) return;
    catalogLiveSync?.reattach();
  });
  const toolDirectoryChanges = workspace.onDidChangeConfiguration((event) => {
    if (
      !event.affectsConfiguration(`${SKILLDEX_CONFIGURATION_SECTION}.${AI_TOOL_DIRECTORY_SETTING}`)
    )
      return;
    catalogLiveSync?.reattach();
  });
  context.subscriptions.push(
    selectedWorkspaceFolder,
    catalogLiveSync,
    selectionChanges,
    toolDirectoryChanges,
  );

  const dashboardViewProvider = new DashboardViewProvider(
    context,
    catalogLiveSync,
    selectedWorkspaceFolder,
    liveActivationPaths,
  );

  context.subscriptions.push(
    window.registerWebviewViewProvider(DASHBOARD_VIEW_ID, dashboardViewProvider, {
      webviewOptions: {
        retainContextWhenHidden: true,
      },
    }),
  );

  context.subscriptions.push(
    commands.registerCommand(OPEN_DASHBOARD_COMMAND, async () => {
      await commands.executeCommand(`${DASHBOARD_VIEW_ID}.focus`);
    }),
  );
}

export function deactivate(): void {
  catalogLiveSync?.dispose();
  catalogLiveSync = undefined;
  selectedWorkspaceFolder?.dispose();
  selectedWorkspaceFolder = undefined;
}
