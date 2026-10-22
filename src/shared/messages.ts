import type { CatalogPayload } from "./catalog.js";

export const HOST_TO_WEBVIEW_MESSAGE_TYPES = {
  ready: "host/ready",
  catalog: "host/catalog",
} as const;

export const WEBVIEW_TO_HOST_MESSAGE_TYPES = {
  ready: "webview/ready",
  catalogRequest: "webview/catalogRequest",
} as const;

export type HostReadyMessage = {
  type: (typeof HOST_TO_WEBVIEW_MESSAGE_TYPES)["ready"];
};

export type HostCatalogMessage = {
  type: (typeof HOST_TO_WEBVIEW_MESSAGE_TYPES)["catalog"];
  skills: CatalogPayload["skills"];
  rules: CatalogPayload["rules"];
};

export type HostToWebviewMessage = HostReadyMessage | HostCatalogMessage;

export type WebviewReadyMessage = {
  type: (typeof WEBVIEW_TO_HOST_MESSAGE_TYPES)["ready"];
};

export type WebviewCatalogRequestMessage = {
  type: (typeof WEBVIEW_TO_HOST_MESSAGE_TYPES)["catalogRequest"];
};

export type WebviewToHostMessage = WebviewReadyMessage | WebviewCatalogRequestMessage;
