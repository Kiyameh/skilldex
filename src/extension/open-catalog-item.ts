import { access } from "node:fs/promises";
import * as vscode from "vscode";
import { resolveCatalogItemPath } from "./catalog-paths.js";

export type OpenCatalogItemSuccess = {
  ok: true;
  id: string;
};

export type OpenCatalogItemFailure = {
  ok: false;
  id: string;
  error: string;
};

export type OpenCatalogItemResult = OpenCatalogItemSuccess | OpenCatalogItemFailure;

function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export async function openCatalogItem(
  workspaceRoot: string,
  itemId: string,
): Promise<OpenCatalogItemResult> {
  const resolved = resolveCatalogItemPath(workspaceRoot, itemId);
  if (resolved === undefined)
    return { ok: false, id: itemId, error: `Unknown or invalid catalog item id: ${itemId}` };

  try {
    await access(resolved.absolutePath);
    await vscode.window.showTextDocument(vscode.Uri.file(resolved.absolutePath));
    return { ok: true, id: itemId };
  } catch (error: unknown) {
    return { ok: false, id: itemId, error: toErrorMessage(error) };
  }
}
