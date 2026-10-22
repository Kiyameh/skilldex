import { describe, expect, it } from "vitest";
import { HOST_TO_WEBVIEW_MESSAGE_TYPES, WEBVIEW_TO_HOST_MESSAGE_TYPES } from "./messages.js";
import { isHostToWebviewMessage, isWebviewToHostMessage } from "./type-guards.js";

describe("isHostToWebviewMessage", () => {
  it("accepts a well-formed host ready handshake", () => {
    expect(isHostToWebviewMessage({ type: HOST_TO_WEBVIEW_MESSAGE_TYPES.ready })).toBe(true);
  });

  it("rejects payloads that are not host handshake messages", () => {
    expect(isHostToWebviewMessage(null)).toBe(false);
    expect(isHostToWebviewMessage(undefined)).toBe(false);
    expect(isHostToWebviewMessage("host/ready")).toBe(false);
    expect(isHostToWebviewMessage([])).toBe(false);
    expect(isHostToWebviewMessage({ type: WEBVIEW_TO_HOST_MESSAGE_TYPES.ready })).toBe(false);
    expect(isHostToWebviewMessage({ type: "unknown" })).toBe(false);
  });
});

describe("isWebviewToHostMessage", () => {
  it("accepts a well-formed webview ready handshake", () => {
    expect(isWebviewToHostMessage({ type: WEBVIEW_TO_HOST_MESSAGE_TYPES.ready })).toBe(true);
  });

  it("rejects payloads that are not webview handshake messages", () => {
    expect(isWebviewToHostMessage(null)).toBe(false);
    expect(isWebviewToHostMessage({ type: HOST_TO_WEBVIEW_MESSAGE_TYPES.ready })).toBe(false);
    expect(isWebviewToHostMessage({ type: "unknown" })).toBe(false);
  });
});
