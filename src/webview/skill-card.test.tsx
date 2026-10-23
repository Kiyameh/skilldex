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
    characterCount: 1024,
    ...overrides,
  };
}

describe("SkillCard", () => {
  it("shows name and enabled switch with description available for hover reveal", () => {
    render(<SkillCard item={buildSkill()} onToggleEnabled={vi.fn()} onOpenItem={vi.fn()} />);

    expect(screen.getByRole("article", { name: "demo-skill" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "demo-skill" })).toBeInTheDocument();
    expect(screen.getByRole("switch", { name: "Auto" })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByText("Demo description")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Editar" })).toBeInTheDocument();
  });

  it("shows invocation size under description inside the hover reveal", () => {
    const { container } = render(
      <SkillCard
        item={buildSkill({ characterCount: 1024 })}
        onToggleEnabled={vi.fn()}
        onOpenItem={vi.fn()}
      />,
    );

    const sizeLine = screen.getByText("1.024 caracteres (~366 tokens)");
    expect(sizeLine).toHaveClass("text-blue-500");
    const reveal = container.querySelector(".group-hover\\:max-h-40");
    expect(reveal).not.toBeNull();
    expect(reveal).toContainElement(sizeLine);
    const header = screen.getByRole("article").querySelector("header");
    expect(header).not.toContainElement(sizeLine);
  });

  it("shows zero size when characterCount is 0", () => {
    render(
      <SkillCard
        item={buildSkill({ characterCount: 0 })}
        onToggleEnabled={vi.fn()}
        onOpenItem={vi.fn()}
      />,
    );

    expect(screen.getByText("0 caracteres (~0 tokens)")).toBeInTheDocument();
  });

  it("treats omitted characterCount as zero in the size line", () => {
    const { characterCount, ...skillWithoutCount } = buildSkill();
    void characterCount;
    render(<SkillCard item={skillWithoutCount} onToggleEnabled={vi.fn()} onOpenItem={vi.fn()} />);

    expect(screen.getByText("0 caracteres (~0 tokens)")).toBeInTheDocument();
  });

  it("shows muted version to the right of the name when present", () => {
    render(
      <SkillCard
        item={buildSkill({ version: "1.0.0" })}
        onToggleEnabled={vi.fn()}
        onOpenItem={vi.fn()}
      />,
    );

    expect(screen.getByText("1.0.0")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "demo-skill" })).toBeInTheDocument();
  });

  it("does not reserve space for version when absent", () => {
    render(<SkillCard item={buildSkill()} onToggleEnabled={vi.fn()} onOpenItem={vi.fn()} />);

    const heading = screen.getByRole("heading", { name: "demo-skill" });
    expect(heading.nextElementSibling).toBeNull();
    expect(screen.queryByText("1.0.0")).not.toBeInTheDocument();
  });

  it("shows disabled state and missing description fallback", () => {
    const { description, ...skillWithoutDescription } = buildSkill({ enabled: false });
    void description;
    render(
      <SkillCard item={skillWithoutDescription} onToggleEnabled={vi.fn()} onOpenItem={vi.fn()} />,
    );

    expect(screen.getByText("Sin descripción")).toBeInTheDocument();
    expect(screen.getByRole("switch", { name: "Manual" })).toHaveAttribute("aria-checked", "false");
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

    fireEvent.click(screen.getByRole("switch", { name: "Auto" }));

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
