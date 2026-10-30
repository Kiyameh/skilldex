import path from "node:path";
import type { CatalogItem } from "../shared/index.js";

export function resolveLiveChipName(skillFilePath: string, catalogSkills: CatalogItem[]): string {
  const resolvedPath = path.resolve(skillFilePath);
  const card = catalogSkills.find((skill) => path.resolve(skill.path) === resolvedPath);
  if (card !== undefined) return card.title ?? card.id;
  return path.basename(path.dirname(resolvedPath));
}
