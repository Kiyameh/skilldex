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
  });

  it("rejects payloads that are not webview-to-host messages", () => {
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
  });
});

describe("isCatalogItem", () => {
  it("accepts a well-formed catalog item", () => {
    expect(isCatalogItem(SAMPLE_CATALOG_ITEM)).toBe(true);
  });

  it("rejects malformed catalog items", () => {
    expect(isCatalogItem(null)).toBe(false);
    expect(isCatalogItem({ ...SAMPLE_CATALOG_ITEM, kind: "other" })).toBe(false);
    expect(isCatalogItem({ ...SAMPLE_CATALOG_ITEM, enabled: "yes" })).toBe(false);
    expect(isCatalogItem({ ...SAMPLE_CATALOG_ITEM, globs: [1] })).toBe(false);
  });
});
