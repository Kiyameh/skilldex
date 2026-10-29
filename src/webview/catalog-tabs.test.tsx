import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { CatalogItem } from "../shared/index.js";
import { CatalogTabs } from "./catalog-tabs";

const sampleSkill: CatalogItem = {
  id: ".cursor/skills/demo/SKILL.md",
  kind: "skill",
  path: "/tmp/.cursor/skills/demo/SKILL.md",
  enabled: true,
  title: "demo-skill",
  description: "Demo",
  characterCount: 1024,
};

const sampleRule: CatalogItem = {
  id: ".cursor/rules/example.mdc",
  kind: "rule",
  path: "/tmp/.cursor/rules/example.mdc",
  enabled: false,
  title: "example-rule",
  globs: [],
  sections: [],
};

function renderTabs() {
  render(
    <CatalogTabs
      skills={[sampleSkill]}
      rules={[sampleRule]}
      unfilteredSkillsCount={1}
      unfilteredRulesCount={1}
      onToggleEnabled={vi.fn()}
      onOpenItem={vi.fn()}
    />,
  );
}

describe("CatalogTabs", () => {
  it("selects the skills tab by default and switches to rules", () => {
    renderTabs();

    expect(screen.getByRole("tab", { name: "Skills", selected: true })).toBeInTheDocument();
    expect(screen.getByRole("tabpanel", { name: "Skills" })).toBeInTheDocument();
    expect(screen.getByRole("article", { name: "demo-skill" })).toBeInTheDocument();
    expect(screen.queryByRole("article", { name: "example-rule" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "Rules" }));

    expect(screen.getByRole("tab", { name: "Rules", selected: true })).toBeInTheDocument();
    expect(screen.getByRole("tabpanel", { name: "Rules" })).toBeInTheDocument();
    expect(screen.getByRole("article", { name: "example-rule" })).toBeInTheDocument();
    expect(screen.queryByRole("article", { name: "demo-skill" })).not.toBeInTheDocument();
  });

  it("moves between tabs with the arrow keys", () => {
    renderTabs();

    const skillsTab = screen.getByRole("tab", { name: "Skills" });
    skillsTab.focus();
    fireEvent.keyDown(skillsTab, { key: "ArrowRight" });

    const rulesTab = screen.getByRole("tab", { name: "Rules" });
    expect(rulesTab).toHaveFocus();
    expect(rulesTab).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("article", { name: "example-rule" })).toBeInTheDocument();

    fireEvent.keyDown(rulesTab, { key: "Home" });

    expect(skillsTab).toHaveFocus();
    expect(skillsTab).toHaveAttribute("aria-selected", "true");
  });
});
