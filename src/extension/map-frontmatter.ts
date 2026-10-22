import matter from "gray-matter";
import path from "node:path";
import type { CatalogItem, CatalogItemKind } from "../shared/index.js";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readOptionalString(data: Record<string, unknown>, key: string): string | undefined {
  const value = data[key];
  return typeof value === "string" ? value : undefined;
}

function mapEnabled(data: Record<string, unknown>): boolean {
  return data["enabled"] !== false;
}

function mapGlobs(data: Record<string, unknown>): string[] {
  const globs = data["globs"];
  if (typeof globs === "string") return [globs];
  if (!Array.isArray(globs)) return [];
  return globs.filter((entry): entry is string => typeof entry === "string");
}

function fileStem(filePath: string): string {
  return path.basename(filePath, path.extname(filePath));
}

function parentFolderName(filePath: string): string {
  return path.basename(path.dirname(filePath));
}

export function mapFrontmatterToCatalogItem(
  absolutePath: string,
  relativeId: string,
  kind: CatalogItemKind,
  fileContents: string,
): CatalogItem {
  const parsed = matter(fileContents);
  const data: unknown = parsed.data;
  const frontmatter = isRecord(data) ? data : {};

  const description = readOptionalString(frontmatter, "description");
  const enabled = mapEnabled(frontmatter);

  if (kind === "skill") {
    const title = readOptionalString(frontmatter, "name") ?? parentFolderName(absolutePath);
    return {
      id: relativeId,
      kind,
      path: absolutePath,
      enabled,
      title,
      ...(description !== undefined ? { description } : {}),
    };
  }

  const title = readOptionalString(frontmatter, "title") ?? fileStem(absolutePath);
  const globs = mapGlobs(frontmatter);

  return {
    id: relativeId,
    kind,
    path: absolutePath,
    enabled,
    title,
    globs,
    ...(description !== undefined ? { description } : {}),
  };
}
