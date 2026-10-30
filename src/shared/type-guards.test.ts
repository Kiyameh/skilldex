import { describe, expect, it } from "vitest";
import { HOST_TO_WEBVIEW_MESSAGE_TYPES, WEBVIEW_TO_HOST_MESSAGE_TYPES } from "./messages.js";
import { isCatalogItem, isHostToWebviewMessage, isWebviewToHostMessage } from "./type-guards.js";

const SAMPLE_CATALOG_ITEM = {
  id: ".cursor/rules/example.mdc",
  kind: "rule" as const,
  path: "/tmp/workspace/.cursor/rules/example.mdc",
  enabled: true,
  title: "Example",
  globs: ["**/*.ts"],
};

describe("isHostToWebviewMessage", () => {
  it("accepts a well-formed host ready handshake", () => {
    expect(isHostToWebviewMessage({ type: HOST_TO_WEBVIEW_MESSAGE_TYPES.ready })).toBe(true);
  });

  it("accepts a well-formed host catalog message", () => {
    expect(
      isHostToWebviewMessage({
        type: HOST_TO_WEBVIEW_MESSAGE_TYPES.catalog,
        skills: [],
        rules: [SAMPLE_CATALOG_ITEM],
      }),
    ).toBe(true);
  });

  it("accepts a well-formed toggle result success message", () => {
    expect(
      isHostToWebviewMessage({
        type: HOST_TO_WEBVIEW_MESSAGE_TYPES.toggleResult,
        ok: true,
        item: SAMPLE_CATALOG_ITEM,
      }),
    ).toBe(true);
  });

  it("accepts a well-formed toggle result failure message", () => {
    expect(
      isHostToWebviewMessage({
        type: HOST_TO_WEBVIEW_MESSAGE_TYPES.toggleResult,
        ok: false,
        id: SAMPLE_CATALOG_ITEM.id,
        enabled: false,
        error: "write failed",
      }),
    ).toBe(true);
  });

  it("accepts a well-formed open result success message", () => {
    expect(
      isHostToWebviewMessage({
        type: HOST_TO_WEBVIEW_MESSAGE_TYPES.openResult,
        ok: true,
        id: SAMPLE_CATALOG_ITEM.id,
      }),
    ).toBe(true);
  });

  it("accepts a well-formed open result failure message", () => {
    expect(
      isHostToWebviewMessage({
        type: HOST_TO_WEBVIEW_MESSAGE_TYPES.openResult,
        ok: false,
        id: SAMPLE_CATALOG_ITEM.id,
        error: "file not found",
      }),
    ).toBe(true);
  });

  it("accepts a settings snapshot with the typed visibility fields", () => {
    expect(
      isHostToWebviewMessage({
        type: HOST_TO_WEBVIEW_MESSAGE_TYPES.settings,
        showSkills: true,
        showRules: false,
        showLiveArea: true,
      }),
    ).toBe(true);
  });

  it("rejects a boolean payload or a settings visibility value that is not a boolean", () => {
    expect(isHostToWebviewMessage(true)).toBe(false);
    expect(
      isHostToWebviewMessage({
        type: HOST_TO_WEBVIEW_MESSAGE_TYPES.settings,
        showSkills: "yes",
        showRules: true,
        showLiveArea: true,
      }),
    ).toBe(false);
    expect(
      isHostToWebviewMessage({
        type: HOST_TO_WEBVIEW_MESSAGE_TYPES.settings,
        showSkills: true,
        showRules: true,
        showLiveArea: "yes",
      }),
    ).toBe(false);
  });

  it("accepts a workspace folder snapshot with two folders and a null selection", () => {
    expect(
      isHostToWebviewMessage({
        type: HOST_TO_WEBVIEW_MESSAGE_TYPES.workspaceFolders,
        folders: [
          { id: "file:///tmp/alpha", name: "alpha", path: "/tmp/alpha" },
          { id: "file:///tmp/beta", name: "beta", path: "/tmp/beta" },
        ],
        selectedId: null,
      }),
    ).toBe(true);
  });

  it("rejects a workspace folder snapshot whose folders value is not an array", () => {
    expect(
      isHostToWebviewMessage({
        type: HOST_TO_WEBVIEW_MESSAGE_TYPES.workspaceFolders,
        folders: { id: "file:///tmp/alpha", name: "alpha", path: "/tmp/alpha" },
        selectedId: null,
      }),
    ).toBe(false);
  });

  it("rejects payloads that are not host messages", () => {
    expect(isHostToWebviewMessage(null)).toBe(false);
    expect(isHostToWebviewMessage(undefined)).toBe(false);
    expect(isHostToWebviewMessage("host/ready")).toBe(false);
    expect(isHostToWebviewMessage([])).toBe(false);
    expect(isHostToWebviewMessage({ type: WEBVIEW_TO_HOST_MESSAGE_TYPES.ready })).toBe(false);
    expect(isHostToWebviewMessage({ type: "unknown" })).toBe(false);
    expect(
      isHostToWebviewMessage({
        type: HOST_TO_WEBVIEW_MESSAGE_TYPES.catalog,
        skills: "nope",
        rules: [],
      }),
    ).toBe(false);
    expect(
      isHostToWebviewMessage({
        type: HOST_TO_WEBVIEW_MESSAGE_TYPES.toggleResult,
        ok: true,
        item: { ...SAMPLE_CATALOG_ITEM, kind: "other" },
      }),
    ).toBe(false);
  });
});

describe("isWebviewToHostMessage", () => {
  it("accepts ready, catalog request, toggle enabled, and open item messages", () => {
    expect(isWebviewToHostMessage({ type: WEBVIEW_TO_HOST_MESSAGE_TYPES.ready })).toBe(true);
    expect(isWebviewToHostMessage({ type: WEBVIEW_TO_HOST_MESSAGE_TYPES.catalogRequest })).toBe(
      true,
    );
    expect(
      isWebviewToHostMessage({
        type: WEBVIEW_TO_HOST_MESSAGE_TYPES.toggleEnabled,
        id: SAMPLE_CATALOG_ITEM.id,
        enabled: false,
      }),
    ).toBe(true);
    expect(
      isWebviewToHostMessage({
        type: WEBVIEW_TO_HOST_MESSAGE_TYPES.openItem,
        id: SAMPLE_CATALOG_ITEM.id,
      }),
    ).toBe(true);
    expect(isWebviewToHostMessage({ type: WEBVIEW_TO_HOST_MESSAGE_TYPES.openSettings })).toBe(true);
    expect(
      isWebviewToHostMessage({
        type: WEBVIEW_TO_HOST_MESSAGE_TYPES.selectWorkspaceFolder,
        id: "file:///tmp/alpha",
      }),
    ).toBe(true);
  });

  it("rejects payloads that are not webview-to-host messages", () => {
    expect(isWebviewToHostMessage(true)).toBe(false);
    expect(isWebviewToHostMessage(null)).toBe(false);
    expect(isWebviewToHostMessage({ type: HOST_TO_WEBVIEW_MESSAGE_TYPES.ready })).toBe(false);
    expect(isWebviewToHostMessage({ type: "unknown" })).toBe(false);
    expect(
      isWebviewToHostMessage({
        type: WEBVIEW_TO_HOST_MESSAGE_TYPES.toggleEnabled,
        id: SAMPLE_CATALOG_ITEM.id,
      }),
    ).toBe(false);
    expect(
      isWebviewToHostMessage({
        type: WEBVIEW_TO_HOST_MESSAGE_TYPES.openItem,
      }),
    ).toBe(false);
    expect(
      isWebviewToHostMessage({
        type: WEBVIEW_TO_HOST_MESSAGE_TYPES.selectWorkspaceFolder,
      }),
    ).toBe(false);
    expect(
      isWebviewToHostMessage({
        type: WEBVIEW_TO_HOST_MESSAGE_TYPES.selectWorkspaceFolder,
        id: 12,
      }),
    ).toBe(false);
  });
});

describe("live feed messages", () => {
  it("accepts a live feed snapshot ordered newest first", () => {
    expect(
      isHostToWebviewMessage({
        type: HOST_TO_WEBVIEW_MESSAGE_TYPES.liveFeed,
        watching: true,
        chips: [
          {
            id: "activation-2",
            name: "maquetado",
            workspaceName: "repo",
            activatedAt: "2026-10-30T10:08:00.000Z",
          },
          {
            id: "activation-1",
            name: "maquetado",
            workspaceName: "repo",
            activatedAt: "2026-10-30T10:07:00.000Z",
          },
        ],
      }),
    ).toBe(true);
    expect(
      isHostToWebviewMessage({
        type: HOST_TO_WEBVIEW_MESSAGE_TYPES.liveFeed,
        watching: false,
        chips: [],
      }),
    ).toBe(true);
  });

  it("rejects a live feed snapshot with an untyped field", () => {
    expect(
      isHostToWebviewMessage({
        type: HOST_TO_WEBVIEW_MESSAGE_TYPES.liveFeed,
        watching: "yes",
        chips: [],
      }),
    ).toBe(false);
    expect(
      isHostToWebviewMessage({
        type: HOST_TO_WEBVIEW_MESSAGE_TYPES.liveFeed,
        watching: true,
        chips: [{ id: "activation-1", name: "maquetado" }],
      }),
    ).toBe(false);
    expect(
      isHostToWebviewMessage({
        type: HOST_TO_WEBVIEW_MESSAGE_TYPES.liveFeed,
        watching: true,
        chips: [{ id: "activation-1", name: "maquetado", workspaceName: "repo" }],
      }),
    ).toBe(false);
    expect(
      isHostToWebviewMessage({
        type: HOST_TO_WEBVIEW_MESSAGE_TYPES.liveFeed,
        watching: true,
        chips: [
          {
            id: "activation-1",
            name: "maquetado",
            workspaceName: "repo",
            activatedAt: "ayer",
          },
        ],
      }),
    ).toBe(false);
    expect(
      isHostToWebviewMessage({
        type: HOST_TO_WEBVIEW_MESSAGE_TYPES.liveFeed,
        watching: true,
        chips: [{ id: "activation-1" }],
      }),
    ).toBe(false);
    expect(
      isHostToWebviewMessage({
        type: HOST_TO_WEBVIEW_MESSAGE_TYPES.liveFeed,
        watching: true,
        chips: { id: "activation-1", name: "maquetado" },
      }),
    ).toBe(false);
  });

  it("accepts the watching request and the reset request", () => {
    expect(
      isWebviewToHostMessage({
        type: WEBVIEW_TO_HOST_MESSAGE_TYPES.setLiveWatching,
        watching: false,
      }),
    ).toBe(true);
    expect(isWebviewToHostMessage({ type: WEBVIEW_TO_HOST_MESSAGE_TYPES.resetLiveFeed })).toBe(
      true,
    );
    expect(
      isWebviewToHostMessage({
        type: WEBVIEW_TO_HOST_MESSAGE_TYPES.openLiveActivation,
        id: "activation-1",
      }),
    ).toBe(true);
  });

  it("rejects a reset payload and chips inside control messages", () => {
    expect(
      isWebviewToHostMessage({
        type: WEBVIEW_TO_HOST_MESSAGE_TYPES.resetLiveFeed,
        watching: true,
      }),
    ).toBe(false);
    expect(
      isWebviewToHostMessage({
        type: WEBVIEW_TO_HOST_MESSAGE_TYPES.resetLiveFeed,
        chips: [],
      }),
    ).toBe(false);
    expect(
      isWebviewToHostMessage({
        type: WEBVIEW_TO_HOST_MESSAGE_TYPES.setLiveWatching,
        watching: true,
        chips: [{ id: "activation-1", name: "maquetado" }],
      }),
    ).toBe(false);
    expect(
      isWebviewToHostMessage({
        type: WEBVIEW_TO_HOST_MESSAGE_TYPES.setLiveWatching,
        watching: "no",
      }),
    ).toBe(false);
  });
});

describe("isCatalogItem", () => {
  it("accepts a well-formed catalog item", () => {
    expect(isCatalogItem(SAMPLE_CATALOG_ITEM)).toBe(true);
  });

  it("accepts optional presentation fields when well-typed", () => {
    expect(
      isCatalogItem({
        ...SAMPLE_CATALOG_ITEM,
        sections: ["Alpha", "Beta"],
        version: "1.0.0",
        category: "stack",
      }),
    ).toBe(true);
    expect(isCatalogItem({ ...SAMPLE_CATALOG_ITEM, sections: [] })).toBe(true);
  });

  it("accepts characterCount when omitted or a non-negative integer", () => {
    expect(isCatalogItem(SAMPLE_CATALOG_ITEM)).toBe(true);
    expect(isCatalogItem({ ...SAMPLE_CATALOG_ITEM, characterCount: 0 })).toBe(true);
    expect(isCatalogItem({ ...SAMPLE_CATALOG_ITEM, characterCount: 1024 })).toBe(true);
  });

  it("rejects malformed catalog items", () => {
    expect(isCatalogItem(null)).toBe(false);
    expect(isCatalogItem({ ...SAMPLE_CATALOG_ITEM, kind: "other" })).toBe(false);
    expect(isCatalogItem({ ...SAMPLE_CATALOG_ITEM, enabled: "yes" })).toBe(false);
    expect(isCatalogItem({ ...SAMPLE_CATALOG_ITEM, globs: [1] })).toBe(false);
    expect(isCatalogItem({ ...SAMPLE_CATALOG_ITEM, sections: [1] })).toBe(false);
    expect(isCatalogItem({ ...SAMPLE_CATALOG_ITEM, version: 1 })).toBe(false);
    expect(isCatalogItem({ ...SAMPLE_CATALOG_ITEM, category: null })).toBe(false);
    expect(isCatalogItem({ ...SAMPLE_CATALOG_ITEM, characterCount: -1 })).toBe(false);
    expect(isCatalogItem({ ...SAMPLE_CATALOG_ITEM, characterCount: 1.5 })).toBe(false);
    expect(isCatalogItem({ ...SAMPLE_CATALOG_ITEM, characterCount: Infinity })).toBe(false);
    expect(isCatalogItem({ ...SAMPLE_CATALOG_ITEM, characterCount: "1024" })).toBe(false);
  });
});
