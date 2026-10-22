import {
  CATALOG_ITEM_KINDS,
  type CatalogItem,
  type CatalogItemKind,
} from "./catalog.js";
import {
  HOST_TO_WEBVIEW_MESSAGE_TYPES,
  WEBVIEW_TO_HOST_MESSAGE_TYPES,
  type HostCatalogMessage,
  type HostToWebviewMessage,
  type WebviewToHostMessage,
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

export function isCatalogItem(value: unknown): value is CatalogItem {
  if (!isRecord(value)) return false;
  if (typeof value["id"] !== "string") return false;
  if (!isCatalogItemKind(value["kind"])) return false;
  if (typeof value["path"] !== "string") return false;
  if (typeof value["enabled"] !== "boolean") return false;
  if (value["title"] !== undefined && typeof value["title"] !== "string") return false;
  if (value["description"] !== undefined && typeof value["description"] !== "string") return false;
  if (value["globs"] !== undefined && !isStringArray(value["globs"])) return false;
  return true;
}

function isCatalogItemArray(value: unknown): value is CatalogItem[] {
  return Array.isArray(value) && value.every(isCatalogItem);
}

function isHostCatalogMessage(value: Record<string, unknown>): value is HostCatalogMessage {
  if (value["type"] !== HOST_TO_WEBVIEW_MESSAGE_TYPES.catalog) return false;
  return isCatalogItemArray(value["skills"]) && isCatalogItemArray(value["rules"]);
}

export function isHostToWebviewMessage(value: unknown): value is HostToWebviewMessage {
  if (!isRecord(value)) return false;
  if (value["type"] === HOST_TO_WEBVIEW_MESSAGE_TYPES.ready) return true;
  return isHostCatalogMessage(value);
}

export function isWebviewToHostMessage(value: unknown): value is WebviewToHostMessage {
  if (!isRecord(value)) return false;
  return (
    value["type"] === WEBVIEW_TO_HOST_MESSAGE_TYPES.ready ||
    value["type"] === WEBVIEW_TO_HOST_MESSAGE_TYPES.catalogRequest
  );
}
