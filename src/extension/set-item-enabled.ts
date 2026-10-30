import { readFile, writeFile } from "node:fs/promises";
import matter from "gray-matter";
import type { CatalogItem } from "../shared/index.js";
import { DEFAULT_AI_TOOL_DIRECTORY, resolveCatalogItemPath } from "./catalog-paths.js";
import {
  ALWAYS_APPLY_KEY,
  DISABLE_MODEL_INVOCATION_KEY,
  mapFrontmatterToCatalogItem,
} from "./map-frontmatter.js";

export type SetItemEnabledSuccess = {
  ok: true;
  item: CatalogItem;
};

export type SetItemEnabledFailure = {
  ok: false;
  error: string;
};

export type SetItemEnabledResult = SetItemEnabledSuccess | SetItemEnabledFailure;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/**
 * Persists UI enabled state using Cursor-native keys:
 * Rules → `alwaysApply`; Skills → `disable-model-invocation` (inverted).
 * Does not create, remove, or alter a leftover `enabled` key.
 */
export async function setItemEnabled(
  workspaceRoot: string,
  itemId: string,
  enabled: boolean,
  aiToolDirectory: string = DEFAULT_AI_TOOL_DIRECTORY,
): Promise<SetItemEnabledResult> {
  const resolved = resolveCatalogItemPath(workspaceRoot, itemId, aiToolDirectory);
  if (resolved === undefined)
    return { ok: false, error: `Unknown or invalid catalog item id: ${itemId}` };

  try {
    const fileContents = await readFile(resolved.absolutePath, "utf8");
    const parsed = matter(fileContents);
    const existingData = isRecord(parsed.data) ? parsed.data : {};
    const nextData: Record<string, unknown> =
      resolved.kind === "rule"
        ? { ...existingData, [ALWAYS_APPLY_KEY]: enabled }
        : { ...existingData, [DISABLE_MODEL_INVOCATION_KEY]: !enabled };
    const nextContents = matter.stringify(parsed.content, nextData);

    await writeFile(resolved.absolutePath, nextContents, "utf8");

    const item = mapFrontmatterToCatalogItem(
      resolved.absolutePath,
      itemId,
      resolved.kind,
      nextContents,
    );

    return { ok: true, item };
  } catch (error: unknown) {
    return { ok: false, error: toErrorMessage(error) };
  }
}
