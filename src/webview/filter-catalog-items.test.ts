import { describe, expect, it } from "vitest";
import type { CatalogItem } from "../shared/index.js";
import { filterCatalogItems } from "./filter-catalog-items";

function buildSkill(overrides: Partial<CatalogItem> = {}): CatalogItem {
  return {
    id: ".cursor/skills/demo/SKILL.md",
    kind: "skill",
    path: "/tmp/.cursor/skills/demo/SKILL.md",
    enabled: true,
    title: "React Conventions",
    description: "Control de acceso",
    characterCount: 1024,
    ...overrides,
  };
}

function buildRule(overrides: Partial<CatalogItem> = {}): CatalogItem {
  return {
    id: ".cursor/rules/example.mdc",
    kind: "rule",
    path: "/tmp/.cursor/rules/example.mdc",
    enabled: true,
    title: "Ejemplo",
    description: "filtra por globs",
    globs: ["**/*.ts"],
    sections: ["Alpha"],
    ...overrides,
  };
}

describe("filterCatalogItems", () => {
  it("matches a skill by visible name", () => {
    const matching = buildSkill({ title: "React Conventions" });
    const other = buildSkill({
      id: ".cursor/skills/other/SKILL.md",
      title: "Otra",
      description: "Sin overlap",
    });

    expect(filterCatalogItems([matching, other], "react", "skill")).toEqual([matching]);
  });

  it("matches a skill by description", () => {
    const matching = buildSkill({ title: "Otra", description: "Control de acceso" });
    const other = buildSkill({
      id: ".cursor/skills/other/SKILL.md",
      title: "Nombre",
      description: "Otro texto",
    });

    expect(filterCatalogItems([matching, other], "acceso", "skill")).toEqual([matching]);
  });

  it("compares without distinguishing case", () => {
    const skill = buildSkill({ title: "React Conventions" });

    expect(filterCatalogItems([skill], "REACT", "skill")).toEqual([skill]);
  });

  it("matches a rule by visible title", () => {
    const matching = buildRule({ title: "Ejemplo" });
    const other = buildRule({
      id: ".cursor/rules/other.mdc",
      title: "Otra",
      description: "filtra por globs",
    });

    expect(filterCatalogItems([matching, other], "ejemplo", "rule")).toEqual([matching]);
  });

  it("does not match a rule by description, globs, or sections", () => {
    const rule = buildRule({
      title: "Ejemplo",
      description: "filtra por globs",
      globs: ["**/*.ts"],
      sections: ["Alpha"],
    });

    expect(filterCatalogItems([rule], "glob", "rule")).toEqual([]);
    expect(filterCatalogItems([rule], "alpha", "rule")).toEqual([]);
  });

  it("does not match the placeholder Sin descripción when a skill has no description", () => {
    const skill = buildSkill({ title: "Otra" });
    delete skill.description;

    expect(filterCatalogItems([skill], "descripción", "skill")).toEqual([]);
  });

  it("falls back to id when title is missing", () => {
    const skill = buildSkill({
      id: ".cursor/skills/fallback-id/SKILL.md",
      description: "Otro texto",
    });
    delete skill.title;

    expect(filterCatalogItems([skill], "fallback-id", "skill")).toEqual([skill]);
  });

  it("returns the original list when the query is empty or only whitespace", () => {
    const items = [buildSkill(), buildSkill({ id: ".cursor/skills/other/SKILL.md" })];

    expect(filterCatalogItems(items, "", "skill")).toBe(items);
    expect(filterCatalogItems(items, "   ", "skill")).toBe(items);
  });
});
