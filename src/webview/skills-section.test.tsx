import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { CatalogItem } from "../shared/index.js";
import { SkillsSection } from "./skills-section";

const sampleSkill: CatalogItem = {
  id: ".cursor/skills/demo/SKILL.md",
  kind: "skill",
  path: "/tmp/.cursor/skills/demo/SKILL.md",
  enabled: true,
  title: "demo-skill",
  description: "Demo",
};

describe("SkillsSection", () => {
  it("renders a Skills heading and skill cards", () => {
    render(<SkillsSection skills={[sampleSkill]} onToggleEnabled={vi.fn()} onOpenItem={vi.fn()} />);

    expect(screen.getByRole("heading", { name: "Skills", level: 2 })).toBeInTheDocument();
    expect(screen.getByRole("article", { name: "demo-skill" })).toBeInTheDocument();
  });

  it("shows an empty state when there are no skills", () => {
    render(<SkillsSection skills={[]} onToggleEnabled={vi.fn()} onOpenItem={vi.fn()} />);

    expect(screen.getByRole("heading", { name: "Skills", level: 2 })).toBeInTheDocument();
    expect(screen.getByText("No hay skills todavía")).toBeInTheDocument();
    expect(screen.queryByRole("article")).not.toBeInTheDocument();
  });
});
