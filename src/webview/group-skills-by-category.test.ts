import { describe, expect, it } from "vitest";
import type { CatalogItem } from "../shared/index.js";
import {
  UNCATEGORIZED_GROUP_ID,
  groupSkillsByCategory,
} from "./group-skills-by-category";

function buildSkill(overrides: Partial<CatalogItem> = {}): CatalogItem {
  return {
    id: ".cursor/skills/demo/SKILL.md",
    kind: "skill",
    path: "/tmp/.cursor/skills/demo/SKILL.md",
    enabled: true,
    title: "demo",
    ...overrides,
  };
}

describe("groupSkillsByCategory", () => {
  it("places uncategorized skills first under Sin categoría", () => {
    const skills = [
      buildSkill({ id: "a", title: "stack-a", category: "stack" }),
      buildSkill({ id: "b", title: "root-b" }),
      buildSkill({ id: "c", title: "tools-c", category: "tools" }),
    ];

    const groups = groupSkillsByCategory(skills);

    expect(groups.map((group) => group.label)).toEqual([
      UNCATEGORIZED_GROUP_ID,
      "Stack",
      "Tools",
    ]);
    expect(groups[0]?.skills.map((skill) => skill.title)).toEqual(["root-b"]);
  });

  it("orders categorized headers by first appearance", () => {
    const skills = [
      buildSkill({ id: "1", title: "git-a", category: "git" }),
      buildSkill({ id: "2", title: "stack-a", category: "stack" }),
      buildSkill({ id: "3", title: "git-b", category: "git" }),
    ];

    const groups = groupSkillsByCategory(skills);

    expect(groups.map((group) => group.id)).toEqual(["git", "stack"]);
    expect(groups[0]?.skills).toHaveLength(2);
  });

  it("Title Cases hyphenated folder names", () => {
    const groups = groupSkillsByCategory([
      buildSkill({ category: "foo-bar", title: "nested" }),
    ]);

    expect(groups[0]?.label).toBe("Foo Bar");
  });

  it("does not Title Case the Sin categoría literal", () => {
    const groups = groupSkillsByCategory([buildSkill({ title: "root" })]);
    expect(groups[0]?.label).toBe(UNCATEGORIZED_GROUP_ID);
  });
});
