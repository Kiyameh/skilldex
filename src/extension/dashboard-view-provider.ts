import type { ExtensionContext, WebviewView, WebviewViewProvider } from "vscode";
import { Uri, workspace } from "vscode";
import { getWebviewHtml } from "./get-webview-html.js";
import { startHostMessageHandling } from "./host-message-adapter.js";

export class DashboardViewProvider implements WebviewViewProvider {
  public constructor(private readonly extensionContext: ExtensionContext) {}

  public resolveWebviewView(webviewView: WebviewView): void {
    const webviewDistUri = Uri.joinPath(this.extensionContext.extensionUri, "dist", "webview");

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [webviewDistUri],
    };

    webviewView.webview.html = getWebviewHtml(webviewView.webview, this.extensionContext);

    const messageHandling = startHostMessageHandling(webviewView.webview, {
      getWorkspaceRoot: () => workspace.workspaceFolders?.[0]?.uri.fsPath,
    });
    webviewView.onDidDispose(() => messageHandling.dispose());
  }
}
