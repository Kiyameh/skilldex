import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
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
  it("shows title, description, globs, and enabled switch", () => {
    render(<RuleCard item={buildRule()} onToggleEnabled={vi.fn()} />);

    expect(screen.getByRole("article", { name: "example-rule" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "example-rule" })).toBeInTheDocument();
    expect(screen.getByText("Rule description")).toBeInTheDocument();
    expect(screen.getByLabelText("Globs")).toHaveTextContent("**/*.ts");
    expect(screen.getByRole("switch", { name: "Activa" })).toHaveAttribute("aria-checked", "true");
  });

  it("shows empty globs indication and disabled state", () => {
    const { description, ...ruleWithoutDescription } = buildRule({
      enabled: false,
      globs: [],
    });
    void description;
    render(<RuleCard item={ruleWithoutDescription} onToggleEnabled={vi.fn()} />);

    expect(screen.getByText("Sin descripción")).toBeInTheDocument();
    expect(screen.getByText("Sin globs")).toBeInTheDocument();
    expect(screen.getByRole("switch", { name: "Inactiva" })).toHaveAttribute(
      "aria-checked",
      "false",
    );
  });

  it("requests the target enabled state when the switch is activated", () => {
    const onToggleEnabled = vi.fn();
    const rule = buildRule({ enabled: false });
    render(<RuleCard item={rule} onToggleEnabled={onToggleEnabled} />);

    fireEvent.click(screen.getByRole("switch", { name: "Inactiva" }));

    expect(onToggleEnabled).toHaveBeenCalledWith(rule, true);
  });
});
