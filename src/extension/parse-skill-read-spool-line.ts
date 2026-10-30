import path from "node:path";
import { SKILL_FILE_NAME } from "./catalog-paths.js";

export interface SkillReadSpoolEntry {
  skillFilePath: string;
  workspaceRoots: string[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseSkillReadSpoolLine(line: string): SkillReadSpoolEntry | undefined {
  let entry: unknown;
  try {
    entry = JSON.parse(line);
  } catch {
    return undefined;
  }
  if (!isRecord(entry)) return undefined;

  const skillFilePath = entry["path"];
  if (typeof skillFilePath !== "string") return undefined;
  if (path.basename(skillFilePath) !== SKILL_FILE_NAME) return undefined;

  const roots = entry["workspaceRoots"];
  const workspaceRoots = Array.isArray(roots)
    ? roots.filter((root): root is string => typeof root === "string")
    : [];

  return { skillFilePath, workspaceRoots };
}
