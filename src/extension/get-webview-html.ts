import { randomBytes } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { ExtensionContext, Webview } from "vscode";
import { Uri } from "vscode";

const NONCE_BYTE_LENGTH = 16;

export function createNonce(): string {
  return randomBytes(NONCE_BYTE_LENGTH).toString("base64");
}

export function getWebviewHtml(webview: Webview, extensionContext: ExtensionContext): string {
  const webviewDistRoot = join(extensionContext.extensionPath, "dist", "webview");
  const indexHtmlPath = join(webviewDistRoot, "index.html");
  const indexHtml = readFileSync(indexHtmlPath, "utf8");
  const nonce = createNonce();
  const cspSource = webview.cspSource;

  const htmlWithoutCrossorigin = stripCrossoriginAttributes(indexHtml);
  const htmlWithUris = rewriteAssetUris(htmlWithoutCrossorigin, webview, webviewDistRoot);
  const htmlWithNonce = injectScriptNonces(htmlWithUris, nonce);
  return injectContentSecurityPolicy(htmlWithNonce, cspSource, nonce);
}

function stripCrossoriginAttributes(html: string): string {
  return html.replace(/\s+crossorigin(?:="[^"]*")?/gi, "");
}

function rewriteAssetUris(html: string, webview: Webview, webviewDistRoot: string): string {
  return html.replace(
    /(href|src)="(\.?\/[^"]+)"/g,
    (_match, attribute: string, assetPath: string) => {
      const normalizedPath = assetPath.replace(/^\.\//, "");
      const absolutePath = join(webviewDistRoot, normalizedPath);
      const asWebviewUri = webview.asWebviewUri(Uri.file(absolutePath));
      return `${attribute}="${asWebviewUri.toString()}"`;
    },
  );
}

function injectScriptNonces(html: string, nonce: string): string {
  return html.replace(/<script(?![^>]*\bnonce=)/gi, `<script nonce="${nonce}"`);
}

function injectContentSecurityPolicy(html: string, cspSource: string, nonce: string): string {
  const contentSecurityPolicy = [
    "default-src 'none'",
    `style-src ${cspSource} 'unsafe-inline'`,
    `script-src 'nonce-${nonce}'`,
    `font-src ${cspSource}`,
    `img-src ${cspSource} data:`,
  ].join("; ");

  const cspMeta = `<meta http-equiv="Content-Security-Policy" content="${contentSecurityPolicy}">`;

  if (/<meta\s+http-equiv=["']Content-Security-Policy["']/i.test(html)) {
    return html.replace(/<meta\s+http-equiv=["']Content-Security-Policy["'][^>]*>/i, cspMeta);
  }

  if (/<head>/i.test(html)) {
    return html.replace(/<head>/i, `<head>\n    ${cspMeta}`);
  }

  return `${cspMeta}\n${html}`;
}
