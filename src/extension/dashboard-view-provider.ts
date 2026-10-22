import type { ExtensionContext, WebviewView, WebviewViewProvider } from "vscode";
import { Uri } from "vscode";
import { getWebviewHtml } from "./get-webview-html.js";

export class DashboardViewProvider implements WebviewViewProvider {
  public constructor(private readonly extensionContext: ExtensionContext) {}

  public resolveWebviewView(webviewView: WebviewView): void {
    const webviewDistUri = Uri.joinPath(this.extensionContext.extensionUri, "dist", "webview");

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [webviewDistUri],
    };

    webviewView.webview.html = getWebviewHtml(webviewView.webview, this.extensionContext);
  }
}
