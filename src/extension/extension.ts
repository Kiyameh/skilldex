import type { ExtensionContext } from "vscode";
import { commands, window } from "vscode";
import { DASHBOARD_VIEW_ID, OPEN_DASHBOARD_COMMAND } from "./constants.js";
import { DashboardViewProvider } from "./dashboard-view-provider.js";

export function activate(context: ExtensionContext): void {
  const dashboardViewProvider = new DashboardViewProvider(context);

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

export function deactivate(): void {}
