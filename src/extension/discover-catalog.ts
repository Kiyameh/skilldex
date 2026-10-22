import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import type { CatalogItem, CatalogPayload } from "../shared/index.js";
import {
  RULES_DIRECTORY,
  SKILLS_DIRECTORY,
  isRuleFile,
  isSkillFile,
  toPosixRelativeId,
} from "./catalog-paths.js";
import { mapFrontmatterToCatalogItem } from "./map-frontmatter.js";

async function collectFilesRecursively(directoryPath: string): Promise<string[]> {
  const entries = await readdir(directoryPath, { withFileTypes: true }).catch((error: unknown) => {
    if (isMissingPathError(error)) return [];
    throw error;
  });

  const nestedFiles = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directoryPath, entry.name);
      if (entry.isDirectory()) return collectFilesRecursively(entryPath);
      if (entry.isFile()) return [entryPath];
      return [];
    }),
  );

  return nestedFiles.flat();
}

function isMissingPathError(error: unknown): boolean {
  return isRecord(error) && error["code"] === "ENOENT";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function mapFileToCatalogItem(
  workspaceRoot: string,
  absolutePath: string,
  kind: CatalogItem["kind"],
): Promise<CatalogItem | undefined> {
  try {
    const fileContents = await readFile(absolutePath, "utf8");
    return mapFrontmatterToCatalogItem(
      absolutePath,
      toPosixRelativeId(workspaceRoot, absolutePath),
      kind,
      fileContents,
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`SkillDex: skipping catalog item at ${absolutePath}: ${message}`);
    return undefined;
  }
}

async function discoverRules(workspaceRoot: string): Promise<CatalogItem[]> {
  const rulesRoot = path.join(workspaceRoot, RULES_DIRECTORY);
  const files = await collectFilesRecursively(rulesRoot);
  const items = await Promise.all(
    files
      .filter(isRuleFile)
      .map((filePath) => mapFileToCatalogItem(workspaceRoot, filePath, "rule")),
  );
  return items.filter((item): item is CatalogItem => item !== undefined);
}

async function discoverSkills(workspaceRoot: string): Promise<CatalogItem[]> {
  const skillsRoot = path.join(workspaceRoot, SKILLS_DIRECTORY);
  const files = await collectFilesRecursively(skillsRoot);
  const items = await Promise.all(
    files
      .filter(isSkillFile)
      .map((filePath) => mapFileToCatalogItem(workspaceRoot, filePath, "skill")),
  );
  return items.filter((item): item is CatalogItem => item !== undefined);
}

export async function discoverCatalog(workspaceRoot: string): Promise<CatalogPayload> {
  const [rules, skills] = await Promise.all([
    discoverRules(workspaceRoot),
    discoverSkills(workspaceRoot),
  ]);

  return { skills, rules };
}
