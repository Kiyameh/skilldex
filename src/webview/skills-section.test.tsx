import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { CatalogItem } from "../shared/index.js";
import { SkillsSection } from "./skills-section";

function buildSkill(overrides: Partial<CatalogItem> = {}): CatalogItem {
  return {
    id: ".cursor/skills/demo/SKILL.md",
    kind: "skill",
    path: "/tmp/.cursor/skills/demo/SKILL.md",
    enabled: true,
    title: "demo-skill",
    description: "Demo",
    characterCount: 1024,
    ...overrides,
  };
}

describe("SkillsSection", () => {
  it("renders skill cards grouped under a category heading", () => {
    render(
      <SkillsSection
        skills={[buildSkill()]}
        unfilteredCount={1}
        onToggleEnabled={vi.fn()}
        onOpenItem={vi.fn()}
      />,
    );

    expect(screen.queryByRole("heading", { name: "Skills" })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Sin categoría", level: 3 })).toBeInTheDocument();
    expect(screen.getByRole("article", { name: "demo-skill" })).toBeInTheDocument();
  });

  it("groups skills by category with Sin categoría first and Title Case headers", () => {
    const skills = [
      buildSkill({
        id: ".cursor/skills/stack/a/SKILL.md",
        title: "stack-skill",
        category: "stack",
      }),
      buildSkill({
        id: ".cursor/skills/root/SKILL.md",
        title: "root-skill",
      }),
      buildSkill({
        id: ".cursor/skills/foo-bar/nested/SKILL.md",
        title: "hyphen-skill",
        category: "foo-bar",
      }),
    ];

    render(
      <SkillsSection
        skills={skills}
        unfilteredCount={skills.length}
        onToggleEnabled={vi.fn()}
        onOpenItem={vi.fn()}
      />,
    );

    const categoryHeadings = screen.getAllByRole("heading", { level: 3 });
    expect(categoryHeadings.map((heading) => heading.textContent)).toEqual([
      "Sin categoría",
      "Stack",
      "Foo Bar",
    ]);

    const uncategorizedSection = screen
      .getByRole("heading", { name: "Sin categoría" })
      .closest("section");
    expect(uncategorizedSection).not.toBeNull();
    if (uncategorizedSection === null) return;
    expect(
      within(uncategorizedSection).getByRole("article", { name: "root-skill" }),
    ).toBeInTheDocument();

    expect(screen.queryByRole("button", { name: /collapse|expand|plegar|desplegar/i })).toBeNull();
    expect(screen.queryByRole("group")).toBeNull();
  });

  it("shows an empty state when there are no skills", () => {
    render(
      <SkillsSection
        skills={[]}
        unfilteredCount={0}
        onToggleEnabled={vi.fn()}
        onOpenItem={vi.fn()}
      />,
    );

    expect(screen.getByText("No hay skills todavía")).toBeInTheDocument();
    expect(screen.queryByRole("article")).not.toBeInTheDocument();
  });

  it("shows no matches when the catalog has skills but none remain visible", () => {
    render(
      <SkillsSection
        skills={[]}
        unfilteredCount={2}
        onToggleEnabled={vi.fn()}
        onOpenItem={vi.fn()}
      />,
    );

    expect(screen.getByText("No hemos encontrado nada :(")).toBeInTheDocument();
    expect(screen.queryByText("No hay skills todavía")).not.toBeInTheDocument();
  });

  it("hides a category heading when that group has no remaining skills", () => {
    const skills = [
      buildSkill({
        id: ".cursor/skills/stack/a/SKILL.md",
        title: "React Conventions",
        category: "stack",
      }),
    ];

    render(
      <SkillsSection
        skills={skills}
        unfilteredCount={2}
        onToggleEnabled={vi.fn()}
        onOpenItem={vi.fn()}
      />,
    );

    expect(screen.getByRole("heading", { name: "Stack", level: 3 })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Sin categoría" })).not.toBeInTheDocument();
  });
});
