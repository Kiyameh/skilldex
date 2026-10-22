import { render, screen, within } from "@testing-library/react";
import { act } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { HOST_TO_WEBVIEW_MESSAGE_TYPES, WEBVIEW_TO_HOST_MESSAGE_TYPES } from "../shared/index.js";
import { App } from "./App";

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
            skills: [
              {
                id: ".cursor/skills/demo/SKILL.md",
                kind: "skill",
                path: "/tmp/.cursor/skills/demo/SKILL.md",
                enabled: true,
                title: "demo-skill",
                description: "Demo",
              },
            ],
            rules: [
              {
                id: ".cursor/rules/example.mdc",
                kind: "rule",
                path: "/tmp/.cursor/rules/example.mdc",
                enabled: false,
                title: "example-rule",
                globs: [],
              },
            ],
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
});
