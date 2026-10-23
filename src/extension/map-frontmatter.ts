import matter from "gray-matter";
import path from "node:path";
import type { CatalogItem, CatalogItemKind } from "../shared/index.js";
import { extractRuleSections } from "./extract-rule-sections.js";

export const ALWAYS_APPLY_KEY = "alwaysApply";
export const DISABLE_MODEL_INVOCATION_KEY = "disable-model-invocation";

const SKILLS_ID_PREFIX = ".cursor/skills/";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readOptionalString(data: Record<string, unknown>, key: string): string | undefined {
  const value = data[key];
  return typeof value === "string" ? value : undefined;
}

function mapRuleEnabled(data: Record<string, unknown>): boolean {
  return data[ALWAYS_APPLY_KEY] === true;
}

function mapSkillEnabled(data: Record<string, unknown>): boolean {
  return data[DISABLE_MODEL_INVOCATION_KEY] !== true;
}

function mapGlobs(data: Record<string, unknown>): string[] {
  const globs = data["globs"];
  if (typeof globs === "string") return [globs];
  if (!Array.isArray(globs)) return [];
  return globs.filter((entry): entry is string => typeof entry === "string");
}

function mapSkillVersion(data: Record<string, unknown>): string | undefined {
  const metadata = data["metadata"];
  if (!isRecord(metadata)) return undefined;
  return readOptionalString(metadata, "version");
}

function mapSkillCategory(relativeId: string): string | undefined {
  if (!relativeId.startsWith(SKILLS_ID_PREFIX)) return undefined;
  const underSkills = relativeId.slice(SKILLS_ID_PREFIX.length);
  const segments = underSkills.split("/").filter((segment) => segment.length > 0);
  if (segments.length < 2) return undefined;
  const folderSegments = segments.slice(0, -1);
  if (folderSegments.length < 2) return undefined;
  return folderSegments[0];
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

  if (kind === "skill") {
    const title = readOptionalString(frontmatter, "name") ?? parentFolderName(absolutePath);
    const version = mapSkillVersion(frontmatter);
    const category = mapSkillCategory(relativeId);
    return {
      id: relativeId,
      kind,
      path: absolutePath,
      enabled: mapSkillEnabled(frontmatter),
      title,
      ...(description !== undefined ? { description } : {}),
      ...(version !== undefined ? { version } : {}),
      ...(category !== undefined ? { category } : {}),
    };
  }

  const title = readOptionalString(frontmatter, "title") ?? fileStem(absolutePath);
  const globs = mapGlobs(frontmatter);
  const sections = extractRuleSections(parsed.content);

  return {
    id: relativeId,
    kind,
    path: absolutePath,
    enabled: mapRuleEnabled(frontmatter),
    title,
    globs,
    sections,
    ...(description !== undefined ? { description } : {}),
  };
}
