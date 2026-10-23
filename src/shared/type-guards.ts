import { CATALOG_ITEM_KINDS, type CatalogItem, type CatalogItemKind } from "./catalog.js";
import {
  HOST_TO_WEBVIEW_MESSAGE_TYPES,
  WEBVIEW_TO_HOST_MESSAGE_TYPES,
  type HostCatalogMessage,
  type HostOpenResultMessage,
  type HostToggleResultMessage,
  type HostToWebviewMessage,
  type WebviewOpenItemMessage,
  type WebviewToHostMessage,
  type WebviewToggleEnabledMessage,
} from "./messages.js";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isCatalogItemKind(value: unknown): value is CatalogItemKind {
  return typeof value === "string" && (CATALOG_ITEM_KINDS as readonly string[]).includes(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((entry) => typeof entry === "string");
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}

export function isCatalogItem(value: unknown): value is CatalogItem {
  if (!isRecord(value)) return false;
  if (typeof value["id"] !== "string") return false;
  if (!isCatalogItemKind(value["kind"])) return false;
  if (typeof value["path"] !== "string") return false;
  if (typeof value["enabled"] !== "boolean") return false;
  if (value["title"] !== undefined && typeof value["title"] !== "string") return false;
  if (value["description"] !== undefined && typeof value["description"] !== "string") return false;
  if (value["globs"] !== undefined && !isStringArray(value["globs"])) return false;
  if (value["sections"] !== undefined && !isStringArray(value["sections"])) return false;
  if (value["version"] !== undefined && typeof value["version"] !== "string") return false;
  if (value["category"] !== undefined && typeof value["category"] !== "string") return false;
  if (value["characterCount"] !== undefined && !isNonNegativeInteger(value["characterCount"]))
    return false;
  return true;
}

function isCatalogItemArray(value: unknown): value is CatalogItem[] {
  return Array.isArray(value) && value.every(isCatalogItem);
}

function isHostCatalogMessage(value: Record<string, unknown>): value is HostCatalogMessage {
  if (value["type"] !== HOST_TO_WEBVIEW_MESSAGE_TYPES.catalog) return false;
  return isCatalogItemArray(value["skills"]) && isCatalogItemArray(value["rules"]);
}

function isHostToggleResultMessage(
  value: Record<string, unknown>,
): value is HostToggleResultMessage {
  if (value["type"] !== HOST_TO_WEBVIEW_MESSAGE_TYPES.toggleResult) return false;
  if (value["ok"] === true) return isCatalogItem(value["item"]);
  if (value["ok"] !== false) return false;
  return (
    typeof value["id"] === "string" &&
    typeof value["enabled"] === "boolean" &&
    typeof value["error"] === "string"
  );
}

function isWebviewToggleEnabledMessage(
  value: Record<string, unknown>,
): value is WebviewToggleEnabledMessage {
  return (
    value["type"] === WEBVIEW_TO_HOST_MESSAGE_TYPES.toggleEnabled &&
    typeof value["id"] === "string" &&
    typeof value["enabled"] === "boolean"
  );
}

function isHostOpenResultMessage(value: Record<string, unknown>): value is HostOpenResultMessage {
  if (value["type"] !== HOST_TO_WEBVIEW_MESSAGE_TYPES.openResult) return false;
  if (typeof value["id"] !== "string") return false;
  if (value["ok"] === true) return true;
  if (value["ok"] !== false) return false;
  return typeof value["error"] === "string";
}

function isWebviewOpenItemMessage(value: Record<string, unknown>): value is WebviewOpenItemMessage {
  return (
    value["type"] === WEBVIEW_TO_HOST_MESSAGE_TYPES.openItem && typeof value["id"] === "string"
  );
}

export function isHostToWebviewMessage(value: unknown): value is HostToWebviewMessage {
  if (!isRecord(value)) return false;
  if (value["type"] === HOST_TO_WEBVIEW_MESSAGE_TYPES.ready) return true;
  if (isHostCatalogMessage(value)) return true;
  if (isHostToggleResultMessage(value)) return true;
  return isHostOpenResultMessage(value);
}

export function isWebviewToHostMessage(value: unknown): value is WebviewToHostMessage {
  if (!isRecord(value)) return false;
  if (value["type"] === WEBVIEW_TO_HOST_MESSAGE_TYPES.ready) return true;
  if (value["type"] === WEBVIEW_TO_HOST_MESSAGE_TYPES.catalogRequest) return true;
  if (isWebviewToggleEnabledMessage(value)) return true;
  return isWebviewOpenItemMessage(value);
}
