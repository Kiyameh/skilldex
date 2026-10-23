import type { ExtensionContext, WebviewView, WebviewViewProvider } from "vscode";
import { Uri, workspace } from "vscode";
import type { CatalogLiveSync } from "./catalog-live-sync.js";
import { getWebviewHtml } from "./get-webview-html.js";
import { postCatalog, startHostMessageHandling } from "./host-message-adapter.js";

export class DashboardViewProvider implements WebviewViewProvider {
  public constructor(
    private readonly extensionContext: ExtensionContext,
    private readonly catalogLiveSync: CatalogLiveSync,
  ) {}

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

    this.catalogLiveSync.setCatalogSink((catalog) => {
      postCatalog(webviewView.webview, catalog);
    });

    webviewView.onDidDispose(() => {
      this.catalogLiveSync.clearCatalogSink();
      messageHandling.dispose();
    });
  }
}
