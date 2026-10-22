import type { Disposable, Webview } from "vscode";
import {
  HOST_TO_WEBVIEW_MESSAGE_TYPES,
  WEBVIEW_TO_HOST_MESSAGE_TYPES,
  isWebviewToHostMessage,
  type CatalogPayload,
  type HostToWebviewMessage,
  type WebviewToHostMessage,
} from "../shared/index.js";
import { discoverCatalog } from "./discover-catalog.js";

const HANDSHAKE_RETRY_ATTEMPTS = 20;
const HANDSHAKE_RETRY_INTERVAL_MS = 100;

export interface HostMessageAdapterOptions {
  getWorkspaceRoot: () => string | undefined;
}

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

async function replyWithCatalog(
  webview: Webview,
  getWorkspaceRoot: () => string | undefined,
): Promise<void> {
  const workspaceRoot = getWorkspaceRoot();
  const catalog: CatalogPayload =
    workspaceRoot === undefined ? { skills: [], rules: [] } : await discoverCatalog(workspaceRoot);

  postHostMessage(webview, {
    type: HOST_TO_WEBVIEW_MESSAGE_TYPES.catalog,
    skills: catalog.skills,
    rules: catalog.rules,
  });
}

export function startHostMessageHandling(
  webview: Webview,
  options: HostMessageAdapterOptions,
): Disposable {
  let handshakeCompleted = false;
  let attempts = 0;
  let retryIntervalId: ReturnType<typeof setInterval> | undefined;

  const sendHostReady = (): void => {
    if (handshakeCompleted) return;
    postHostMessage(webview, { type: HOST_TO_WEBVIEW_MESSAGE_TYPES.ready });
  };

  const subscription = subscribeToWebviewMessages(webview, (message) => {
    if (message.type === WEBVIEW_TO_HOST_MESSAGE_TYPES.ready) {
      if (handshakeCompleted) return;
      handshakeCompleted = true;
      clearHandshakeRetry(retryIntervalId);
      retryIntervalId = undefined;
      console.log("SkillDex handshake complete");
      return;
    }

    if (message.type === WEBVIEW_TO_HOST_MESSAGE_TYPES.catalogRequest) {
      void replyWithCatalog(webview, options.getWorkspaceRoot);
    }
  });

  sendHostReady();
  retryIntervalId = setInterval(() => {
    attempts += 1;
    if (handshakeCompleted || attempts >= HANDSHAKE_RETRY_ATTEMPTS) {
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
