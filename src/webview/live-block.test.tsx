import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { LiveFeedChip } from "../shared/index.js";
import { LiveBlock } from "./live-block";

const ACTIVATED_AT = "2026-10-30T10:08:00.000Z";

function chipsNamed(names: string[], workspaceName = "repo"): LiveFeedChip[] {
  return names.map((name, index) => ({
    id: `activation-${names.length - index}`,
    name,
    workspaceName,
    activatedAt: ACTIVATED_AT,
  }));
}

function chipPill(row: HTMLElement): HTMLElement {
  const pill = row.querySelector(".rounded-full");
  if (!(pill instanceof HTMLElement)) throw new Error("missing chip");
  return pill;
}

function renderLiveBlock(overrides: Partial<{ watching: boolean; chips: LiveFeedChip[] }> = {}): {
  onToggleWatching: () => void;
  onReset: () => void;
  onOpenChip: (chip: LiveFeedChip) => void;
  rerender: (chips: LiveFeedChip[]) => void;
} {
  const onToggleWatching = vi.fn();
  const onReset = vi.fn();
  const onOpenChip = vi.fn();
  const element = (chips: LiveFeedChip[]) => (
    <LiveBlock
      watching={overrides.watching ?? true}
      chips={chips}
      onToggleWatching={onToggleWatching}
      onReset={onReset}
      onOpenChip={onOpenChip}
    />
  );
  const { rerender } = render(element(overrides.chips ?? []));
  return { onToggleWatching, onReset, onOpenChip, rerender: (chips) => rerender(element(chips)) };
}

function chipList(): HTMLElement {
  return screen.getByRole("list", { name: "Activaciones de skills" });
}

describe("LiveBlock", () => {
  it("shows the title with a pulsing green led and the stop control while running", () => {
    renderLiveBlock();

    const heading = screen.getByRole("heading", { name: "Live" });
    const led = screen.getByRole("img", { name: "Live en marcha" });
    expect(heading.nextElementSibling).toBe(led);
    expect(led).toHaveClass("bg-emerald-500", "animate-pulse");
    expect(screen.getByRole("button", { name: "Parar Live" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reiniciar Live" })).toBeInTheDocument();
  });

  it("shows a static red led and the resume control while stopped", () => {
    renderLiveBlock({ watching: false });

    const led = screen.getByRole("img", { name: "Live parado" });
    expect(led).toHaveClass("bg-red-500");
    expect(led).not.toHaveClass("animate-pulse");
    expect(screen.getByRole("button", { name: "Reanudar Live" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Parar Live" })).not.toBeInTheDocument();
  });

  it("calls the handlers from the play/stop and reset buttons", () => {
    const { onToggleWatching, onReset } = renderLiveBlock();

    fireEvent.click(screen.getByRole("button", { name: "Parar Live" }));
    fireEvent.click(screen.getByRole("button", { name: "Reiniciar Live" }));

    expect(onToggleWatching).toHaveBeenCalledTimes(1);
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it("reads each activation as a sentence and paints only the newest chip in the skill color", () => {
    renderLiveBlock({ chips: chipsNamed(["testing", "maquetado", "testing"], "lkweb") });

    const rows = within(chipList()).getAllByRole("listitem");
    expect(rows.map((row) => row.textContent)).toEqual([
      "He usado testing de lkweb",
      "He usado maquetado de lkweb",
      "He usado testing de lkweb",
    ]);
    const activationTime = rows[0]?.querySelector("relative-time");
    expect(activationTime).toHaveAttribute("datetime", ACTIVATED_AT);
    expect(activationTime).toHaveClass("text-[10px]", "text-neutral-400");
    expect(activationTime?.shadowRoot?.textContent).toMatch(/\d/);

    const newest = chipPill(rows[0] as HTMLElement);
    const older = chipPill(rows[1] as HTMLElement);
    expect(newest).toHaveClass(
      "rounded-full",
      "border-teal-400",
      "text-teal-400",
      "cursor-pointer",
    );
    expect(older).toHaveClass("rounded-full");
    expect(older).not.toHaveClass("text-teal-400");
    expect(newest.querySelector("svg")).toHaveClass("text-teal-400");
    expect(older.querySelector("svg")).toHaveClass("text-neutral-400");
  });

  it("clips the list at seven rows and keeps the eighth row in the list", () => {
    renderLiveBlock({ chips: chipsNamed(["1", "2", "3", "4", "5", "6", "7", "8"]) });

    expect(chipList()).toHaveClass("h-[196px]", "overflow-hidden");
    const rows = within(chipList()).getAllByRole("listitem");
    expect(rows).toHaveLength(8);
    for (const row of rows) expect(chipPill(row)).toHaveClass("h-6");
  });

  it("grows a new row down from the top without replaying the entrance of the rows below", () => {
    const first = chipsNamed(["maquetado"]);
    const { rerender } = renderLiveBlock({ chips: first });
    const existingRow = within(chipList()).getByText("maquetado").closest("li");

    rerender([
      { id: "activation-2", name: "testing", workspaceName: "repo", activatedAt: ACTIVATED_AT },
      ...first,
    ]);

    const [newRow, keptRow] = within(chipList()).getAllByRole("listitem");
    expect(newRow).toHaveClass("animate-live-chip-enter");
    expect(newRow).not.toHaveClass("animate-live-chip-blink");
    expect(keptRow).toBe(existingRow);
  });

  it("opens the skill document from the chip without changing its look", () => {
    const chips = chipsNamed(["maquetado"]);
    const { onOpenChip } = renderLiveBlock({ chips });
    const chipButton = screen.getByRole("button", { name: "Abrir maquetado" });

    expect(chipButton).toHaveClass("cursor-pointer", "rounded-full");
    fireEvent.click(chipButton);

    expect(onOpenChip).toHaveBeenCalledWith(chips[0]);
  });
});
