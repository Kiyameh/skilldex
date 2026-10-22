import type { Disposable, Webview } from "vscode";
import {
  HOST_TO_WEBVIEW_MESSAGE_TYPES,
  isWebviewToHostMessage,
  type HostToWebviewMessage,
  type WebviewToHostMessage,
} from "../shared/index.js";

const HANDSHAKE_RETRY_ATTEMPTS = 20;
const HANDSHAKE_RETRY_INTERVAL_MS = 100;

export function postHostMessage(webview: Webview, message: HostToWebviewMessage): void {
  webview.postMessage(message);
}

export function subscribeToWebviewMessages(
  webview: Webview,
  onMessage: (message: WebviewToHostMessage) => void,
): Disposable {
  return webview.onDidReceiveMessage((payload: unknown) => {
    if (!isWebviewToHostMessage(payload)) return;
    onMessage(payload);
  });
}

export function startHandshake(webview: Webview): Disposable {
  let completed = false;
  let attempts = 0;
  let retryIntervalId: ReturnType<typeof setInterval> | undefined;

  const sendHostReady = (): void => {
    if (completed) return;
    postHostMessage(webview, { type: HOST_TO_WEBVIEW_MESSAGE_TYPES.ready });
  };

  const subscription = subscribeToWebviewMessages(webview, () => {
    if (completed) return;

    completed = true;
    clearHandshakeRetry(retryIntervalId);
    retryIntervalId = undefined;
    console.log("SkillDex handshake complete");
  });

  sendHostReady();
  retryIntervalId = setInterval(() => {
    attempts += 1;
    if (completed || attempts >= HANDSHAKE_RETRY_ATTEMPTS) {
      clearHandshakeRetry(retryIntervalId);
      retryIntervalId = undefined;
      return;
    }
    sendHostReady();
  }, HANDSHAKE_RETRY_INTERVAL_MS);

  return {
    dispose: () => {
      subscription.dispose();
      clearHandshakeRetry(retryIntervalId);
      retryIntervalId = undefined;
    },
  };
}

function clearHandshakeRetry(retryIntervalId: ReturnType<typeof setInterval> | undefined): void {
  if (retryIntervalId === undefined) return;
  clearInterval(retryIntervalId);
}
