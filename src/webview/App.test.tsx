import { fireEvent, render, screen, within } from "@testing-library/react";
import { act } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { HOST_TO_WEBVIEW_MESSAGE_TYPES, WEBVIEW_TO_HOST_MESSAGE_TYPES } from "../shared/index.js";
import { App } from "./App";

const SAMPLE_SKILL = {
  id: ".cursor/skills/demo/SKILL.md",
  kind: "skill" as const,
  path: "/tmp/.cursor/skills/demo/SKILL.md",
  enabled: true,
  title: "demo-skill",
  description: "Demo",
  characterCount: 1024,
};

const SAMPLE_RULE = {
  id: ".cursor/rules/example.mdc",
  kind: "rule" as const,
  path: "/tmp/.cursor/rules/example.mdc",
  enabled: false,
  title: "example-rule",
  globs: [] as string[],
};

function connectAndLoadCatalog(): void {
  act(() => {
    window.dispatchEvent(
      new MessageEvent("message", {
        data: { type: HOST_TO_WEBVIEW_MESSAGE_TYPES.ready },
      }),
    );
  });

  act(() => {
    window.dispatchEvent(
      new MessageEvent("message", {
        data: {
          type: HOST_TO_WEBVIEW_MESSAGE_TYPES.catalog,
          skills: [SAMPLE_SKILL],
          rules: [SAMPLE_RULE],
        },
      }),
    );
  });
}

const postMessage = vi.fn();

vi.mock("./vscode-api", () => ({
  getVsCodeApi: () => ({
    postMessage,
    getState: () => undefined,
    setState: (state: unknown) => state,
  }),
}));

describe("App", () => {
  afterEach(() => {
    postMessage.mockReset();
  });

  it("shows disconnected badge by default", () => {
    render(<App />);

    expect(screen.getByRole("status")).toHaveTextContent("desconectado");
  });

  it("shows connected badge after a host ready message", () => {
    render(<App />);

    act(() => {
      window.dispatchEvent(
        new MessageEvent("message", {
          data: { type: HOST_TO_WEBVIEW_MESSAGE_TYPES.ready },
        }),
      );
    });

    expect(screen.getByRole("status")).toHaveTextContent("conectado");
    expect(postMessage).toHaveBeenCalledWith({ type: WEBVIEW_TO_HOST_MESSAGE_TYPES.ready });
  });

  it("requests the catalog after handshake and renders Skills before Rules", () => {
    render(<App />);

    act(() => {
      window.dispatchEvent(
        new MessageEvent("message", {
          data: { type: HOST_TO_WEBVIEW_MESSAGE_TYPES.ready },
        }),
      );
    });

    expect(postMessage).toHaveBeenCalledWith({
      type: WEBVIEW_TO_HOST_MESSAGE_TYPES.catalogRequest,
    });
    expect(screen.getByText("Catálogo: esperando…")).toBeInTheDocument();

    act(() => {
      window.dispatchEvent(
        new MessageEvent("message", {
          data: {
            type: HOST_TO_WEBVIEW_MESSAGE_TYPES.catalog,
            skills: [SAMPLE_SKILL],
            rules: [SAMPLE_RULE],
          },
        }),
      );
    });

    const skillsHeading = screen.getByRole("heading", { name: "Skills", level: 2 });
    const rulesHeading = screen.getByRole("heading", { name: "Rules", level: 2 });
    expect(
      skillsHeading.compareDocumentPosition(rulesHeading) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();

    expect(screen.getByRole("article", { name: "demo-skill" })).toBeInTheDocument();
    expect(screen.getByRole("article", { name: "example-rule" })).toBeInTheDocument();
    expect(screen.queryByLabelText("Catalog dump")).not.toBeInTheDocument();
    expect(screen.queryByText(/skills \/ .* rules/)).not.toBeInTheDocument();
  });

  it("shows empty states for both sections when the catalog is empty", () => {
    render(<App />);

    act(() => {
      window.dispatchEvent(
        new MessageEvent("message", {
          data: { type: HOST_TO_WEBVIEW_MESSAGE_TYPES.ready },
        }),
      );
    });

    act(() => {
      window.dispatchEvent(
        new MessageEvent("message", {
          data: {
            type: HOST_TO_WEBVIEW_MESSAGE_TYPES.catalog,
            skills: [],
            rules: [],
          },
        }),
      );
    });

    const main = screen.getByRole("main", { name: "SkillDex dashboard" });
    expect(within(main).getByText("No hay skills todavía")).toBeInTheDocument();
    expect(within(main).getByText("No hay rules todavía")).toBeInTheDocument();
  });

  it("does not mark handshake connected on catalog messages alone", () => {
    render(<App />);

    act(() => {
      window.dispatchEvent(
        new MessageEvent("message", {
          data: {
            type: HOST_TO_WEBVIEW_MESSAGE_TYPES.catalog,
            skills: [],
            rules: [],
          },
        }),
      );
    });

    expect(screen.getByRole("status")).toHaveTextContent("desconectado");
    expect(postMessage).not.toHaveBeenCalled();
  });

  it("optimistically toggles a skill and keeps the state after success", () => {
    render(<App />);
    connectAndLoadCatalog();

    const skillCard = screen.getByRole("article", { name: "demo-skill" });
    fireEvent.click(within(skillCard).getByRole("switch", { name: "Auto" }));

    expect(postMessage).toHaveBeenCalledWith({
      type: WEBVIEW_TO_HOST_MESSAGE_TYPES.toggleEnabled,
      id: SAMPLE_SKILL.id,
      enabled: false,
    });
    expect(within(skillCard).getByRole("switch", { name: "Manual" })).toBeInTheDocument();

    act(() => {
      window.dispatchEvent(
        new MessageEvent("message", {
          data: {
            type: HOST_TO_WEBVIEW_MESSAGE_TYPES.toggleResult,
            ok: true,
            item: { ...SAMPLE_SKILL, enabled: false },
          },
        }),
      );
    });

    expect(within(skillCard).getByRole("switch", { name: "Manual" })).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("reverts optimistic toggle and shows an error on failure", () => {
    render(<App />);
    connectAndLoadCatalog();

    const skillCard = screen.getByRole("article", { name: "demo-skill" });
    fireEvent.click(within(skillCard).getByRole("switch", { name: "Auto" }));
    expect(within(skillCard).getByRole("switch", { name: "Manual" })).toBeInTheDocument();

    act(() => {
      window.dispatchEvent(
        new MessageEvent("message", {
          data: {
            type: HOST_TO_WEBVIEW_MESSAGE_TYPES.toggleResult,
            ok: false,
            id: SAMPLE_SKILL.id,
            enabled: false,
            error: "Permission denied",
          },
        }),
      );
    });

    expect(within(skillCard).getByRole("switch", { name: "Auto" })).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("Permission denied");
  });

  it("posts openItem when Editar is clicked on a skill card", () => {
    render(<App />);
    connectAndLoadCatalog();

    const skillCard = screen.getByRole("article", { name: "demo-skill" });
    fireEvent.click(within(skillCard).getByRole("button", { name: "Editar" }));

    expect(postMessage).toHaveBeenCalledWith({
      type: WEBVIEW_TO_HOST_MESSAGE_TYPES.openItem,
      id: SAMPLE_SKILL.id,
    });
  });

  it("posts openItem when Editar is clicked on a rule card", () => {
    render(<App />);
    connectAndLoadCatalog();

    const ruleCard = screen.getByRole("article", { name: "example-rule" });
    fireEvent.click(within(ruleCard).getByRole("button", { name: "Editar" }));

    expect(postMessage).toHaveBeenCalledWith({
      type: WEBVIEW_TO_HOST_MESSAGE_TYPES.openItem,
      id: SAMPLE_RULE.id,
    });
  });

  it("shows an alert when openResult fails", () => {
    render(<App />);
    connectAndLoadCatalog();

    const skillCard = screen.getByRole("article", { name: "demo-skill" });
    fireEvent.click(within(skillCard).getByRole("button", { name: "Editar" }));

    act(() => {
      window.dispatchEvent(
        new MessageEvent("message", {
          data: {
            type: HOST_TO_WEBVIEW_MESSAGE_TYPES.openResult,
            ok: false,
            id: SAMPLE_SKILL.id,
            error: "File not found",
          },
        }),
      );
    });

    expect(screen.getByRole("alert")).toHaveTextContent("File not found");
  });
});
