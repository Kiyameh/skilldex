import type { CatalogItem, CatalogPayload } from "./catalog.js";

export const HOST_TO_WEBVIEW_MESSAGE_TYPES = {
  ready: "host/ready",
  catalog: "host/catalog",
  toggleResult: "host/toggleResult",
} as const;

export const WEBVIEW_TO_HOST_MESSAGE_TYPES = {
  ready: "webview/ready",
  catalogRequest: "webview/catalogRequest",
  toggleEnabled: "webview/toggleEnabled",
} as const;

export type HostReadyMessage = {
  type: (typeof HOST_TO_WEBVIEW_MESSAGE_TYPES)["ready"];
};

export type HostCatalogMessage = {
  type: (typeof HOST_TO_WEBVIEW_MESSAGE_TYPES)["catalog"];
  skills: CatalogPayload["skills"];
  rules: CatalogPayload["rules"];
};

export type HostToggleResultSuccessMessage = {
  type: (typeof HOST_TO_WEBVIEW_MESSAGE_TYPES)["toggleResult"];
  ok: true;
  item: CatalogItem;
};

export type HostToggleResultFailureMessage = {
  type: (typeof HOST_TO_WEBVIEW_MESSAGE_TYPES)["toggleResult"];
  ok: false;
  id: string;
  enabled: boolean;
  error: string;
};

export type HostToggleResultMessage =
  HostToggleResultSuccessMessage | HostToggleResultFailureMessage;

export type HostToWebviewMessage = HostReadyMessage | HostCatalogMessage | HostToggleResultMessage;

export type WebviewReadyMessage = {
  type: (typeof WEBVIEW_TO_HOST_MESSAGE_TYPES)["ready"];
};

export type WebviewCatalogRequestMessage = {
  type: (typeof WEBVIEW_TO_HOST_MESSAGE_TYPES)["catalogRequest"];
};

export type WebviewToggleEnabledMessage = {
  type: (typeof WEBVIEW_TO_HOST_MESSAGE_TYPES)["toggleEnabled"];
  id: string;
  enabled: boolean;
};

export type WebviewToHostMessage =
  WebviewReadyMessage | WebviewCatalogRequestMessage | WebviewToggleEnabledMessage;
