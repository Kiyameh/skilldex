import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { CatalogItem } from "../shared/index.js";
import { RuleCard } from "./rule-card";

function buildRule(overrides: Partial<CatalogItem> = {}): CatalogItem {
  return {
    id: ".cursor/rules/example.mdc",
    kind: "rule",
    path: "/tmp/.cursor/rules/example.mdc",
    enabled: true,
    title: "example-rule",
    description: "Rule description",
    globs: ["**/*.ts"],
    ...overrides,
  };
}

describe("RuleCard", () => {
  it("shows title, description, globs, and enabled state", () => {
    render(<RuleCard item={buildRule()} />);

    expect(screen.getByRole("article", { name: "example-rule" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "example-rule" })).toBeInTheDocument();
    expect(screen.getByText("Rule description")).toBeInTheDocument();
    expect(screen.getByLabelText("Globs")).toHaveTextContent("**/*.ts");
    expect(screen.getByLabelText("Activa")).toBeInTheDocument();
  });

  it("shows empty globs indication and disabled state", () => {
    const { description, ...ruleWithoutDescription } = buildRule({
      enabled: false,
      globs: [],
    });
    void description;
    render(<RuleCard item={ruleWithoutDescription} />);

    expect(screen.getByText("Sin descripción")).toBeInTheDocument();
    expect(screen.getByText("Sin globs")).toBeInTheDocument();
    expect(screen.getByLabelText("Desactivada")).toBeInTheDocument();
  });
});

