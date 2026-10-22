import type { ExtensionContext, WebviewView, WebviewViewProvider } from "vscode";
import { Uri } from "vscode";
import { getWebviewHtml } from "./get-webview-html.js";
import { startHandshake } from "./host-message-adapter.js";

export class DashboardViewProvider implements WebviewViewProvider {
  public constructor(private readonly extensionContext: ExtensionContext) {}

  public resolveWebviewView(webviewView: WebviewView): void {
    const webviewDistUri = Uri.joinPath(this.extensionContext.extensionUri, "dist", "webview");

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [webviewDistUri],
    };

    webviewView.webview.html = getWebviewHtml(webviewView.webview, this.extensionContext);

    const handshake = startHandshake(webviewView.webview);
    webviewView.onDidDispose(() => handshake.dispose());
  }
}
