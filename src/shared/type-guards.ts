import {
  HOST_TO_WEBVIEW_MESSAGE_TYPES,
  WEBVIEW_TO_HOST_MESSAGE_TYPES,
  type HostToWebviewMessage,
  type WebviewToHostMessage,
} from "./messages.js";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isHostToWebviewMessage(value: unknown): value is HostToWebviewMessage {
  if (!isRecord(value)) return false;
  return value["type"] === HOST_TO_WEBVIEW_MESSAGE_TYPES.ready;
}

export function isWebviewToHostMessage(value: unknown): value is WebviewToHostMessage {
  if (!isRecord(value)) return false;
  return value["type"] === WEBVIEW_TO_HOST_MESSAGE_TYPES.ready;
}
