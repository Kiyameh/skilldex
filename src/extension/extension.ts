import type { ExtensionContext } from "vscode";
import { commands, RelativePattern, window, workspace } from "vscode";
import { startCatalogLiveSync, type CatalogLiveSync } from "./catalog-live-sync.js";
import { DASHBOARD_VIEW_ID, OPEN_DASHBOARD_COMMAND } from "./constants.js";
import { DashboardViewProvider } from "./dashboard-view-provider.js";

let catalogLiveSync: CatalogLiveSync | undefined;

export function activate(context: ExtensionContext): void {
  catalogLiveSync = startCatalogLiveSync({
    getWorkspaceFolder: () => workspace.workspaceFolders?.[0],
    createFileSystemWatcher: (base, globPattern) =>
      workspace.createFileSystemWatcher(new RelativePattern(base, globPattern)),
  });
  context.subscriptions.push(catalogLiveSync);

  const dashboardViewProvider = new DashboardViewProvider(context, catalogLiveSync);

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
}
