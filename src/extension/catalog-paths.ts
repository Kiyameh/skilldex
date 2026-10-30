import path from "node:path";
import type { CatalogItemKind } from "../shared/index.js";

export const DEFAULT_AI_TOOL_DIRECTORY = ".cursor";
export const AI_TOOL_DIRECTORY_SETTING = "ai-tool-directory";
export const RULE_EXTENSIONS = new Set([".mdc", ".md"]);
export const SKILL_FILE_NAME = "SKILL.md";

export function coerceAiToolDirectory(value: unknown): string {
  if (typeof value !== "string") return DEFAULT_AI_TOOL_DIRECTORY;

  const trimmed = value.trim().replaceAll("\\", "/");
  if (trimmed.startsWith("/") || /^[A-Za-z]:/u.test(trimmed)) return DEFAULT_AI_TOOL_DIRECTORY;

  const normalized = trimmed.replace(/\/+$/u, "");
  if (normalized.length === 0) return DEFAULT_AI_TOOL_DIRECTORY;

  const segments = normalized.split("/");
  if (segments.some((segment) => segment.length === 0 || segment === "." || segment === ".."))
    return DEFAULT_AI_TOOL_DIRECTORY;

  return segments.join("/");
}

export function rulesDirectory(aiToolDirectory: string): string {
  return path.join(aiToolDirectory, "rules");
}

export function skillsDirectory(aiToolDirectory: string): string {
  return path.join(aiToolDirectory, "skills");
}

export function rulesWatchGlob(aiToolDirectory: string): string {
  return `${aiToolDirectory}/rules/**`;
}

export function skillsWatchGlob(aiToolDirectory: string): string {
  return `${aiToolDirectory}/skills/**`;
}

export function toPosixRelativeId(workspaceRoot: string, absolutePath: string): string {
  return path.relative(workspaceRoot, absolutePath).split(path.sep).join("/");
}

export function isRuleFile(filePath: string): boolean {
  return RULE_EXTENSIONS.has(path.extname(filePath).toLowerCase());
}

export function isSkillFile(filePath: string): boolean {
  return path.basename(filePath) === SKILL_FILE_NAME;
}

export function resolveCatalogItemPath(
  workspaceRoot: string,
  itemId: string,
  aiToolDirectory: string = DEFAULT_AI_TOOL_DIRECTORY,
): { absolutePath: string; kind: CatalogItemKind } | undefined {
  if (itemId.includes("\0") || path.isAbsolute(itemId)) return undefined;

  const absolutePath = path.resolve(workspaceRoot, ...itemId.split("/"));
  const relativePath = path.relative(workspaceRoot, absolutePath);
  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) return undefined;

  const posixRelative = relativePath.split(path.sep).join("/");
  if (posixRelative !== itemId) return undefined;

  const toolDirectory = coerceAiToolDirectory(aiToolDirectory);
  const rulesPrefix = `${toolDirectory}/rules/`;
  const skillsPrefix = `${toolDirectory}/skills/`;

  if (posixRelative.startsWith(rulesPrefix) && isRuleFile(absolutePath))
    return { absolutePath, kind: "rule" };

  if (posixRelative.startsWith(skillsPrefix) && isSkillFile(absolutePath))
    return { absolutePath, kind: "skill" };

  return undefined;
}
