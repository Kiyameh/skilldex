import type { CatalogItem } from "../shared/index.js";

export const UNCATEGORIZED_GROUP_ID = "Sin categoría";

export interface SkillCategoryGroup {
  id: string;
  label: string;
  skills: CatalogItem[];
}

function toTitleCaseFolderName(folderId: string): string {
  return folderId
    .split("-")
    .filter((token) => token.length > 0)
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
    .join(" ");
}

/**
 * Groups skills by category. Uncategorized skills go under `Sin categoría` first
 * when present; remaining headers follow first-appearance order in the input array.
 */
export function groupSkillsByCategory(skills: CatalogItem[]): SkillCategoryGroup[] {
  const uncategorized: CatalogItem[] = [];
  const categorized = new Map<string, CatalogItem[]>();
  const categoryOrder: string[] = [];

  for (const skill of skills) {
    const category = skill.category;
    if (category === undefined || category.length === 0) {
      uncategorized.push(skill);
      continue;
    }
    const existing = categorized.get(category);
    if (existing === undefined) {
      categorized.set(category, [skill]);
      categoryOrder.push(category);
      continue;
    }
    existing.push(skill);
  }

  const groups: SkillCategoryGroup[] = [];

  if (uncategorized.length > 0) {
    groups.push({
      id: UNCATEGORIZED_GROUP_ID,
      label: UNCATEGORIZED_GROUP_ID,
      skills: uncategorized,
    });
  }

  for (const categoryId of categoryOrder) {
    const groupSkills = categorized.get(categoryId);
    if (groupSkills === undefined) continue;
    groups.push({
      id: categoryId,
      label: toTitleCaseFolderName(categoryId),
      skills: groupSkills,
    });
  }

  return groups;
}
