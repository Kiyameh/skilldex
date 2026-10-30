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

function renderTabs(
  overrides: Partial<{
    skills: CatalogItem[];
    rules: CatalogItem[];
    unfilteredSkillsCount: number;
    unfilteredRulesCount: number;
    showSkills: boolean;
    showRules: boolean;
    showLiveArea: boolean;
  }> = {},
) {
  render(
    <CatalogTabs
      skills={overrides.skills ?? [sampleSkill]}
      rules={overrides.rules ?? [sampleRule]}
      unfilteredSkillsCount={overrides.unfilteredSkillsCount ?? 1}
      unfilteredRulesCount={overrides.unfilteredRulesCount ?? 1}
      showSkills={overrides.showSkills ?? true}
      showRules={overrides.showRules ?? true}
      showLiveArea={overrides.showLiveArea ?? true}
      onToggleEnabled={vi.fn()}
      onOpenItem={vi.fn()}
      onOpenLiveActivation={vi.fn()}
      liveFeed={{
        watching: true,
        chips: [
          {
            id: "activation-1",
            name: "maquetado",
            workspaceName: "repo",
            activatedAt: "2026-10-30T10:08:00.000Z",
          },
        ],
        toggleWatching: vi.fn(),
        reset: vi.fn(),
      }}
    />,
  );
}

function liveRegion(): HTMLElement | null {
  return screen.queryByRole("region", { name: "Live" });
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

  it("shows only skills without a tab list and skips the rules empty state", () => {
    renderTabs({
      skills: [],
      rules: [],
      unfilteredSkillsCount: 0,
      unfilteredRulesCount: 0,
      showSkills: true,
      showRules: false,
    });

    expect(screen.queryByRole("tablist")).not.toBeInTheDocument();
    expect(screen.getByText("No hay skills todavía")).toBeInTheDocument();
    expect(screen.queryByText("No hay rules todavía")).not.toBeInTheDocument();
  });

  it("shows only rules without a tab list and skips the skills empty state", () => {
    renderTabs({
      skills: [],
      rules: [],
      unfilteredSkillsCount: 0,
      unfilteredRulesCount: 0,
      showSkills: false,
      showRules: true,
    });

    expect(screen.queryByRole("tablist")).not.toBeInTheDocument();
    expect(screen.getByText("No hay rules todavía")).toBeInTheDocument();
    expect(screen.queryByText("No hay skills todavía")).not.toBeInTheDocument();
  });

  it("places Live under the scrollable skills list inside the same skills panel", () => {
    renderTabs();

    const panel = screen.getByRole("tabpanel", { name: "Skills" });
    const live = liveRegion();
    expect(live).not.toBeNull();
    expect(panel).toContainElement(live);
    const scrollableList = screen
      .getByRole("article", { name: "demo-skill" })
      .closest(".overflow-y-auto");
    expect(scrollableList).not.toBeNull();
    expect(scrollableList).not.toContainElement(live);
    expect(scrollableList?.nextElementSibling).toBe(live);
    expect(live).toHaveClass("shrink-0");
  });

  it("keeps Live with the skills list when only skills are shown", () => {
    renderTabs({ showSkills: true, showRules: false });

    expect(liveRegion()).toBeInTheDocument();
  });

  it("hides Live on the rules tab and when skills are hidden", () => {
    renderTabs();
    fireEvent.click(screen.getByRole("tab", { name: "Rules" }));
    expect(liveRegion()).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "Skills" }));
    expect(liveRegion()).toBeInTheDocument();
  });

  it("hides Live when the show live area preference is off", () => {
    renderTabs({ showLiveArea: false });

    expect(liveRegion()).not.toBeInTheDocument();
    expect(screen.getByRole("article", { name: "demo-skill" })).toBeInTheDocument();
  });

  it("does not render Live when only rules are shown", () => {
    renderTabs({ showSkills: false, showRules: true });

    expect(liveRegion()).not.toBeInTheDocument();
  });
});
