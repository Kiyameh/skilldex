import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { CatalogItem } from "../shared/index.js";
import { RulesSection } from "./rules-section";

const sampleRule: CatalogItem = {
  id: ".cursor/rules/example.mdc",
  kind: "rule",
  path: "/tmp/.cursor/rules/example.mdc",
  enabled: false,
  title: "example-rule",
  globs: [],
  sections: [],
};

const nestedRule: CatalogItem = {
  id: ".cursor/rules/nested/deep-rule.mdc",
  kind: "rule",
  path: "/tmp/.cursor/rules/nested/deep-rule.mdc",
  enabled: true,
  title: "deep-rule",
  globs: ["**/*.ts"],
  sections: ["Alpha"],
};

describe("RulesSection", () => {
  it("renders rule cards without a section heading", () => {
    render(<RulesSection rules={[sampleRule]} onToggleEnabled={vi.fn()} onOpenItem={vi.fn()} />);

    expect(screen.queryByRole("heading", { name: "Rules" })).not.toBeInTheDocument();
    expect(screen.getByRole("article", { name: "example-rule" })).toBeInTheDocument();
  });

  it("keeps nested rules in a flat list without category headers", () => {
    render(
      <RulesSection
        rules={[sampleRule, nestedRule]}
        onToggleEnabled={vi.fn()}
        onOpenItem={vi.fn()}
      />,
    );

    expect(screen.queryByRole("heading", { name: "Rules" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { level: 2 })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Sin categoría" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Nested" })).not.toBeInTheDocument();
    expect(screen.getByRole("article", { name: "example-rule" })).toBeInTheDocument();
    expect(screen.getByRole("article", { name: "deep-rule" })).toBeInTheDocument();
  });

  it("shows an empty state when there are no rules", () => {
    render(<RulesSection rules={[]} onToggleEnabled={vi.fn()} onOpenItem={vi.fn()} />);

    expect(screen.getByText("No hay rules todavía")).toBeInTheDocument();
    expect(screen.queryByRole("article")).not.toBeInTheDocument();
  });
});
