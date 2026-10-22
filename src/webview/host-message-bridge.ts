import {
  HOST_TO_WEBVIEW_MESSAGE_TYPES,
  WEBVIEW_TO_HOST_MESSAGE_TYPES,
  isHostToWebviewMessage,
  type HostToWebviewMessage,
  type WebviewToHostMessage,
} from "../shared/index.js";
import { getVsCodeApi } from "./vscode-api";

export function postToHost(message: WebviewToHostMessage): void {
  getVsCodeApi().postMessage(message);
}

export function subscribeToHostMessages(
  onMessage: (message: HostToWebviewMessage) => void,
): () => void {
  const listener = (event: MessageEvent<unknown>): void => {
    if (!isHostToWebviewMessage(event.data)) return;
    onMessage(event.data);
  };

  window.addEventListener("message", listener);
  return () => window.removeEventListener("message", listener);
}

export function replyToHostReady(message: HostToWebviewMessage): void {
  if (message.type !== HOST_TO_WEBVIEW_MESSAGE_TYPES.ready) return;
  postToHost({ type: WEBVIEW_TO_HOST_MESSAGE_TYPES.ready });
}

export function requestCatalog(): void {
  postToHost({ type: WEBVIEW_TO_HOST_MESSAGE_TYPES.catalogRequest });
}

export function requestToggleEnabled(id: string, enabled: boolean): void {
  postToHost({ type: WEBVIEW_TO_HOST_MESSAGE_TYPES.toggleEnabled, id, enabled });
}
