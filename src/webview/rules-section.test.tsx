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
};

describe("RulesSection", () => {
  it("renders a Rules heading and rule cards", () => {
    render(<RulesSection rules={[sampleRule]} onToggleEnabled={vi.fn()} onOpenItem={vi.fn()} />);

    expect(screen.getByRole("heading", { name: "Rules", level: 2 })).toBeInTheDocument();
    expect(screen.getByRole("article", { name: "example-rule" })).toBeInTheDocument();
  });

  it("shows an empty state when there are no rules", () => {
    render(<RulesSection rules={[]} onToggleEnabled={vi.fn()} onOpenItem={vi.fn()} />);

    expect(screen.getByRole("heading", { name: "Rules", level: 2 })).toBeInTheDocument();
    expect(screen.getByText("No hay rules todavía")).toBeInTheDocument();
    expect(screen.queryByRole("article")).not.toBeInTheDocument();
  });
});
