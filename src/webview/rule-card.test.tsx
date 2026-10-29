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
    sections: ["Overview", "Details"],
    ...overrides,
  };
}

describe("RuleCard", () => {
  it("shows title, sections list, globs, and enabled switch without description", () => {
    render(<RuleCard item={buildRule()} onToggleEnabled={vi.fn()} onOpenItem={vi.fn()} />);

    expect(screen.getByRole("article", { name: "example-rule" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "example-rule" })).toBeInTheDocument();
    const kindIcon = screen.getByRole("article").querySelector("header svg.text-rose-400");
    expect(kindIcon).not.toBeNull();
    expect(kindIcon?.compareDocumentPosition(screen.getByRole("heading"))).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    const sections = screen.getByRole("list", { name: "Secciones" });
    expect(sections.tagName).toBe("OL");
    expect(sections).toHaveClass("list-decimal");
    expect([...sections.querySelectorAll("li")].map((item) => item.textContent)).toEqual([
      "Overview",
      "Details",
    ]);
    expect(screen.queryByText("Rule description")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Globs")).toHaveTextContent("**/*.ts");
    expect(screen.getByRole("switch", { name: "AlwaysApply" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    expect(screen.getByRole("button", { name: "Editar" })).toBeInTheDocument();
  });

  it("does not show a character or token size line", () => {
    render(<RuleCard item={buildRule()} onToggleEnabled={vi.fn()} onOpenItem={vi.fn()} />);

    expect(screen.queryByText(/caracteres/)).not.toBeInTheDocument();
  });

  it("shows empty sections and globs copy when both are empty", () => {
    render(
      <RuleCard
        item={buildRule({ enabled: false, globs: [], sections: [] })}
        onToggleEnabled={vi.fn()}
        onOpenItem={vi.fn()}
      />,
    );

    expect(screen.getByText("No hay secciones")).toBeInTheDocument();
    expect(screen.getByText("Sin globs")).toBeInTheDocument();
    expect(screen.getByRole("switch", { name: "NotApply" })).toHaveAttribute(
      "aria-checked",
      "false",
    );
  });

  it("treats missing sections like an empty list", () => {
    const { sections, ...ruleWithoutSections } = buildRule({ globs: [] });
    void sections;
    render(<RuleCard item={ruleWithoutSections} onToggleEnabled={vi.fn()} onOpenItem={vi.fn()} />);

    expect(screen.getByText("No hay secciones")).toBeInTheDocument();
  });

  it("requests the target enabled state when the switch is activated", () => {
    const onToggleEnabled = vi.fn();
    const rule = buildRule({ enabled: false });
    render(<RuleCard item={rule} onToggleEnabled={onToggleEnabled} onOpenItem={vi.fn()} />);

    fireEvent.click(screen.getByRole("switch", { name: "NotApply" }));

    expect(onToggleEnabled).toHaveBeenCalledWith(rule, true);
  });

  it("requests open when Editar is activated", () => {
    const onOpenItem = vi.fn();
    const rule = buildRule();
    render(<RuleCard item={rule} onToggleEnabled={vi.fn()} onOpenItem={onOpenItem} />);

    fireEvent.click(screen.getByRole("button", { name: "Editar" }));

    expect(onOpenItem).toHaveBeenCalledWith(rule);
  });
});
