import path from "node:path";
import type { CatalogItemKind } from "../shared/index.js";

export const RULES_DIRECTORY = path.join(".cursor", "rules");
export const SKILLS_DIRECTORY = path.join(".cursor", "skills");
export const RULE_EXTENSIONS = new Set([".mdc", ".md"]);
export const SKILL_FILE_NAME = "SKILL.md";

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
): { absolutePath: string; kind: CatalogItemKind } | undefined {
  if (itemId.includes("\0") || path.isAbsolute(itemId)) return undefined;

  const absolutePath = path.resolve(workspaceRoot, ...itemId.split("/"));
  const relativePath = path.relative(workspaceRoot, absolutePath);
  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) return undefined;

  const posixRelative = relativePath.split(path.sep).join("/");
  if (posixRelative !== itemId) return undefined;

  const rulesPrefix = `${RULES_DIRECTORY.split(path.sep).join("/")}/`;
  const skillsPrefix = `${SKILLS_DIRECTORY.split(path.sep).join("/")}/`;

  if (posixRelative.startsWith(rulesPrefix) && isRuleFile(absolutePath))
    return { absolutePath, kind: "rule" };

  if (posixRelative.startsWith(skillsPrefix) && isSkillFile(absolutePath))
    return { absolutePath, kind: "skill" };

  return undefined;
}
