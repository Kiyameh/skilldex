import type { Disposable, Webview } from "vscode";
import {
  HOST_TO_WEBVIEW_MESSAGE_TYPES,
  WEBVIEW_TO_HOST_MESSAGE_TYPES,
  isWebviewToHostMessage,
  type CatalogPayload,
  type HostToWebviewMessage,
  type LiveFeedSnapshot,
  type SkilldexSettings,
  type WebviewOpenItemMessage,
  type WebviewToHostMessage,
  type WebviewToggleEnabledMessage,
  type WorkspaceFolderSnapshot,
} from "../shared/index.js";
import { OPEN_NATIVE_SETTINGS_COMMAND, SKILLDEX_CONFIGURATION_SECTION } from "./constants.js";
import { discoverCatalog } from "./discover-catalog.js";
import type { LiveActivationFeed } from "./live-activation-feed.js";
import { openCatalogItem } from "./open-catalog-item.js";
import { setItemEnabled } from "./set-item-enabled.js";

const HANDSHAKE_RETRY_ATTEMPTS = 20;
const HANDSHAKE_RETRY_INTERVAL_MS = 100;
const MISSING_WORKSPACE_ERROR = "No workspace folder is open";
const UNKNOWN_LIVE_ACTIVATION_ERROR = "Unknown live activation";

export interface SkilldexConfigurationChangeEvent {
  affectsConfiguration: (section: string) => boolean;
}

export interface HostMessageAdapterOptions {
  getWorkspaceRoot: () => string | undefined;
  getAiToolDirectory: () => string;
  getWorkspaceFoldersSnapshot: () => WorkspaceFolderSnapshot;
  selectWorkspaceFolder: (id: string) => void;
  readSettings: () => SkilldexSettings;
  subscribeToConfigurationChanges: (
    listener: (event: SkilldexConfigurationChangeEvent) => void,
  ) => Disposable;
  extensionId: string;
  executeCommand: (command: string, argument: string) => void;
  liveFeed: LiveActivationFeed;
  openSkillDocument: (skillFilePath: string) => Promise<void>;
  onCatalogPublished?: (catalog: CatalogPayload) => void;
}

export function postHostMessage(webview: Webview, message: HostToWebviewMessage): void {
  webview.postMessage(message);
}

export function postCatalog(webview: Webview, catalog: CatalogPayload): void {
  postHostMessage(webview, {
    type: HOST_TO_WEBVIEW_MESSAGE_TYPES.catalog,
    skills: catalog.skills,
    rules: catalog.rules,
  });
}

function postSettings(webview: Webview, settings: SkilldexSettings): void {
  postHostMessage(webview, {
    type: HOST_TO_WEBVIEW_MESSAGE_TYPES.settings,
    showSkills: settings.showSkills,
    showRules: settings.showRules,
    showLiveArea: settings.showLiveArea,
  });
}

export function postWorkspaceFolders(webview: Webview, snapshot: WorkspaceFolderSnapshot): void {
  postHostMessage(webview, {
    type: HOST_TO_WEBVIEW_MESSAGE_TYPES.workspaceFolders,
    folders: snapshot.folders,
    selectedId: snapshot.selectedId,
  });
}

function postLiveFeed(webview: Webview, snapshot: LiveFeedSnapshot): void {
  postHostMessage(webview, {
    type: HOST_TO_WEBVIEW_MESSAGE_TYPES.liveFeed,
    watching: snapshot.watching,
    chips: snapshot.chips,
  });
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
  options: HostMessageAdapterOptions,
): Promise<void> {
  const workspaceRoot = options.getWorkspaceRoot();
  const catalog: CatalogPayload =
    workspaceRoot === undefined
      ? { skills: [], rules: [] }
      : await discoverCatalog(workspaceRoot, options.getAiToolDirectory());

  postCatalog(webview, catalog);
  options.onCatalogPublished?.(catalog);
}

async function replyToToggleEnabled(
  webview: Webview,
  getWorkspaceRoot: () => string | undefined,
  getAiToolDirectory: () => string,
  message: WebviewToggleEnabledMessage,
): Promise<void> {
  const workspaceRoot = getWorkspaceRoot();
  if (workspaceRoot === undefined) {
    postHostMessage(webview, {
      type: HOST_TO_WEBVIEW_MESSAGE_TYPES.toggleResult,
      ok: false,
      id: message.id,
      enabled: message.enabled,
      error: MISSING_WORKSPACE_ERROR,
    });
    return;
  }

  const result = await setItemEnabled(
    workspaceRoot,
    message.id,
    message.enabled,
    getAiToolDirectory(),
  );
  if (result.ok) {
    postHostMessage(webview, {
      type: HOST_TO_WEBVIEW_MESSAGE_TYPES.toggleResult,
      ok: true,
      item: result.item,
    });
    return;
  }

  postHostMessage(webview, {
    type: HOST_TO_WEBVIEW_MESSAGE_TYPES.toggleResult,
    ok: false,
    id: message.id,
    enabled: message.enabled,
    error: result.error,
  });
}

async function replyToOpenItem(
  webview: Webview,
  getWorkspaceRoot: () => string | undefined,
  getAiToolDirectory: () => string,
  message: WebviewOpenItemMessage,
): Promise<void> {
  const workspaceRoot = getWorkspaceRoot();
  if (workspaceRoot === undefined) {
    postHostMessage(webview, {
      type: HOST_TO_WEBVIEW_MESSAGE_TYPES.openResult,
      ok: false,
      id: message.id,
      error: MISSING_WORKSPACE_ERROR,
    });
    return;
  }

  const result = await openCatalogItem(workspaceRoot, message.id, getAiToolDirectory());
  if (result.ok) {
    postHostMessage(webview, {
      type: HOST_TO_WEBVIEW_MESSAGE_TYPES.openResult,
      ok: true,
      id: result.id,
    });
    return;
  }

  postHostMessage(webview, {
    type: HOST_TO_WEBVIEW_MESSAGE_TYPES.openResult,
    ok: false,
    id: result.id,
    error: result.error,
  });
}

async function replyToOpenLiveActivation(
  webview: Webview,
  options: HostMessageAdapterOptions,
  id: string,
): Promise<void> {
  const skillFilePath = options.liveFeed.getSkillFilePath(id);
  if (skillFilePath === undefined) {
    postHostMessage(webview, {
      type: HOST_TO_WEBVIEW_MESSAGE_TYPES.openResult,
      ok: false,
      id,
      error: UNKNOWN_LIVE_ACTIVATION_ERROR,
    });
    return;
  }

  try {
    await options.openSkillDocument(skillFilePath);
    postHostMessage(webview, {
      type: HOST_TO_WEBVIEW_MESSAGE_TYPES.openResult,
      ok: true,
      id,
    });
  } catch (error: unknown) {
    postHostMessage(webview, {
      type: HOST_TO_WEBVIEW_MESSAGE_TYPES.openResult,
      ok: false,
      id,
      error: error instanceof Error ? error.message : String(error),
    });
  }
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
      void replyWithCatalog(webview, options);
      return;
    }

    if (message.type === WEBVIEW_TO_HOST_MESSAGE_TYPES.toggleEnabled) {
      void replyToToggleEnabled(
        webview,
        options.getWorkspaceRoot,
        options.getAiToolDirectory,
        message,
      );
      return;
    }

    if (message.type === WEBVIEW_TO_HOST_MESSAGE_TYPES.openItem) {
      void replyToOpenItem(webview, options.getWorkspaceRoot, options.getAiToolDirectory, message);
      return;
    }

    if (message.type === WEBVIEW_TO_HOST_MESSAGE_TYPES.selectWorkspaceFolder) {
      options.selectWorkspaceFolder(message.id);
      postWorkspaceFolders(webview, options.getWorkspaceFoldersSnapshot());
      void replyWithCatalog(webview, options);
      return;
    }

    if (message.type === WEBVIEW_TO_HOST_MESSAGE_TYPES.setLiveWatching) {
      options.liveFeed.setWatching(message.watching);
      return;
    }

    if (message.type === WEBVIEW_TO_HOST_MESSAGE_TYPES.resetLiveFeed) {
      options.liveFeed.reset();
      return;
    }

    if (message.type === WEBVIEW_TO_HOST_MESSAGE_TYPES.openLiveActivation) {
      void replyToOpenLiveActivation(webview, options, message.id);
      return;
    }

    if (message.type === WEBVIEW_TO_HOST_MESSAGE_TYPES.openSettings)
      options.executeCommand(OPEN_NATIVE_SETTINGS_COMMAND, `@ext:${options.extensionId}`);
  });

  const configurationSubscription = options.subscribeToConfigurationChanges((event) => {
    if (!event.affectsConfiguration(SKILLDEX_CONFIGURATION_SECTION)) return;
    postSettings(webview, options.readSettings());
  });

  const liveFeedSubscription = options.liveFeed.onDidChange((snapshot) => {
    postLiveFeed(webview, snapshot);
  });

  const sendSessionStart = (): void => {
    sendHostReady();
    if (handshakeCompleted) return;
    postSettings(webview, options.readSettings());
    postWorkspaceFolders(webview, options.getWorkspaceFoldersSnapshot());
    postLiveFeed(webview, options.liveFeed.getSnapshot());
  };

  sendSessionStart();
  retryIntervalId = setInterval(() => {
    attempts += 1;
    if (handshakeCompleted || attempts >= HANDSHAKE_RETRY_ATTEMPTS) {
      clearHandshakeRetry(retryIntervalId);
      retryIntervalId = undefined;
      return;
    }
    sendSessionStart();
  }, HANDSHAKE_RETRY_INTERVAL_MS);

  return {
    dispose: () => {
      subscription.dispose();
      configurationSubscription.dispose();
      liveFeedSubscription.dispose();
      clearHandshakeRetry(retryIntervalId);
      retryIntervalId = undefined;
    },
  };
}

function clearHandshakeRetry(retryIntervalId: ReturnType<typeof setInterval> | undefined): void {
  if (retryIntervalId === undefined) return;
  clearInterval(retryIntervalId);
}
