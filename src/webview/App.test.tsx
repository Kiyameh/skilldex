import { render, screen } from "@testing-library/react";
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

  it("shows waiting handshake status by default", () => {
    render(<App />);

    expect(screen.getByRole("status")).toHaveTextContent("Host: esperando");
  });

  it("shows connected handshake status after a host ready message", () => {
    render(<App />);

    act(() => {
      window.dispatchEvent(
        new MessageEvent("message", {
          data: { type: HOST_TO_WEBVIEW_MESSAGE_TYPES.ready },
        }),
      );
    });

    expect(screen.getByRole("status")).toHaveTextContent("Host: conectado");
    expect(postMessage).toHaveBeenCalledWith({ type: WEBVIEW_TO_HOST_MESSAGE_TYPES.ready });
  });

  it("requests the catalog after handshake and renders counts plus dump", () => {
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

    expect(screen.getByText("1 skills / 1 rules")).toBeInTheDocument();
    expect(screen.getByLabelText("Catalog dump")).toHaveTextContent("demo-skill");
    expect(screen.getByLabelText("Catalog dump")).toHaveTextContent("example-rule");
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

    expect(screen.getByRole("status")).toHaveTextContent("Host: esperando");
    expect(postMessage).not.toHaveBeenCalled();
  });
});
