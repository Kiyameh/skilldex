export const HOST_TO_WEBVIEW_MESSAGE_TYPES = {
  ready: "host/ready",
} as const;

export const WEBVIEW_TO_HOST_MESSAGE_TYPES = {
  ready: "webview/ready",
} as const;

export type HostToWebviewMessage = {
  type: (typeof HOST_TO_WEBVIEW_MESSAGE_TYPES)["ready"];
};

export type WebviewToHostMessage = {
  type: (typeof WEBVIEW_TO_HOST_MESSAGE_TYPES)["ready"];
};
