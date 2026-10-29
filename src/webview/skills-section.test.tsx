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
      <SkillsSection skills={[buildSkill()]} onToggleEnabled={vi.fn()} onOpenItem={vi.fn()} />,
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

    render(<SkillsSection skills={skills} onToggleEnabled={vi.fn()} onOpenItem={vi.fn()} />);

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
    render(<SkillsSection skills={[]} onToggleEnabled={vi.fn()} onOpenItem={vi.fn()} />);

    expect(screen.getByText("No hay skills todavía")).toBeInTheDocument();
    expect(screen.queryByRole("article")).not.toBeInTheDocument();
  });
});
