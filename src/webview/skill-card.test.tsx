import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
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
  it("shows name and enabled switch with description available for hover reveal", () => {
    render(<SkillCard item={buildSkill()} onToggleEnabled={vi.fn()} onOpenItem={vi.fn()} />);

    expect(screen.getByRole("article", { name: "demo-skill" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "demo-skill" })).toBeInTheDocument();
    expect(screen.getByRole("switch", { name: "Activa" })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByText("Demo description")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Editar" })).toBeInTheDocument();
  });

  it("shows disabled state and missing description fallback", () => {
    const { description, ...skillWithoutDescription } = buildSkill({ enabled: false });
    void description;
    render(
      <SkillCard item={skillWithoutDescription} onToggleEnabled={vi.fn()} onOpenItem={vi.fn()} />,
    );

    expect(screen.getByText("Sin descripción")).toBeInTheDocument();
    expect(screen.getByRole("switch", { name: "Inactiva" })).toHaveAttribute(
      "aria-checked",
      "false",
    );
  });

  it("falls back to id when title is missing", () => {
    const { title, ...skillWithoutTitle } = buildSkill();
    void title;
    render(<SkillCard item={skillWithoutTitle} onToggleEnabled={vi.fn()} onOpenItem={vi.fn()} />);

    expect(
      screen.getByRole("article", { name: ".cursor/skills/demo/SKILL.md" }),
    ).toBeInTheDocument();
  });

  it("requests the target enabled state when the switch is activated", () => {
    const onToggleEnabled = vi.fn();
    const skill = buildSkill({ enabled: true });
    render(<SkillCard item={skill} onToggleEnabled={onToggleEnabled} onOpenItem={vi.fn()} />);

    fireEvent.click(screen.getByRole("switch", { name: "Activa" }));

    expect(onToggleEnabled).toHaveBeenCalledWith(skill, false);
  });

  it("requests open when Editar is activated", () => {
    const onOpenItem = vi.fn();
    const skill = buildSkill();
    render(<SkillCard item={skill} onToggleEnabled={vi.fn()} onOpenItem={onOpenItem} />);

    fireEvent.click(screen.getByRole("button", { name: "Editar" }));

    expect(onOpenItem).toHaveBeenCalledWith(skill);
  });
});
