import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { CatalogItem } from "../shared/index.js";
import { SkillCard } from "./skill-card";

function buildSkill(overrides: Partial<CatalogItem> = {}): CatalogItem {
  return {
    id: ".cursor/skills/demo/SKILL.md",
    kind: "skill",
    path: "/tmp/.cursor/skills/demo/SKILL.md",
    enabled: true,
    title: "demo-skill",
    description: "Demo description",
    ...overrides,
  };
}

describe("SkillCard", () => {
  it("shows name and enabled state with description available for hover reveal", () => {
    render(<SkillCard item={buildSkill()} />);

    expect(screen.getByRole("article", { name: "demo-skill" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "demo-skill" })).toBeInTheDocument();
    expect(screen.getByLabelText("Activa")).toBeInTheDocument();
    expect(screen.getByText("Demo description")).toBeInTheDocument();
  });

  it("shows disabled state and missing description fallback", () => {
    const { description, ...skillWithoutDescription } = buildSkill({ enabled: false });
    void description;
    render(<SkillCard item={skillWithoutDescription} />);

    expect(screen.getByText("Sin descripción")).toBeInTheDocument();
    expect(screen.getByLabelText("Desactivada")).toBeInTheDocument();
  });

  it("falls back to id when title is missing", () => {
    const { title, ...skillWithoutTitle } = buildSkill();
    void title;
    render(<SkillCard item={skillWithoutTitle} />);

    expect(
      screen.getByRole("article", { name: ".cursor/skills/demo/SKILL.md" }),
    ).toBeInTheDocument();
  });
});

