import type { CatalogItem, CatalogPayload } from "./catalog.js";

export const HOST_TO_WEBVIEW_MESSAGE_TYPES = {
  ready: "host/ready",
  catalog: "host/catalog",
  toggleResult: "host/toggleResult",
  openResult: "host/openResult",
  settings: "host/settings",
  workspaceFolders: "host/workspaceFolders",
  liveFeed: "host/liveFeed",
} as const;

export const WEBVIEW_TO_HOST_MESSAGE_TYPES = {
  ready: "webview/ready",
  catalogRequest: "webview/catalogRequest",
  toggleEnabled: "webview/toggleEnabled",
  openItem: "webview/openItem",
  openSettings: "webview/openSettings",
  selectWorkspaceFolder: "webview/selectWorkspaceFolder",
  setLiveWatching: "webview/setLiveWatching",
  resetLiveFeed: "webview/resetLiveFeed",
  openLiveActivation: "webview/openLiveActivation",
} as const;

export interface SkilldexSettings {
  showSkills: boolean;
  showRules: boolean;
  showLiveArea: boolean;
}

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

export type HostOpenResultSuccessMessage = {
  type: (typeof HOST_TO_WEBVIEW_MESSAGE_TYPES)["openResult"];
  ok: true;
  id: string;
};

export type HostOpenResultFailureMessage = {
  type: (typeof HOST_TO_WEBVIEW_MESSAGE_TYPES)["openResult"];
  ok: false;
  id: string;
  error: string;
};

export type HostOpenResultMessage = HostOpenResultSuccessMessage | HostOpenResultFailureMessage;

export type HostSettingsMessage = {
  type: (typeof HOST_TO_WEBVIEW_MESSAGE_TYPES)["settings"];
  showSkills: boolean;
  showRules: boolean;
  showLiveArea: boolean;
};

export type WorkspaceFolderSnapshotEntry = {
  id: string;
  name: string;
  path: string;
};

export type WorkspaceFolderSnapshot = {
  folders: WorkspaceFolderSnapshotEntry[];
  selectedId: string | null;
};

export type HostWorkspaceFoldersMessage = {
  type: (typeof HOST_TO_WEBVIEW_MESSAGE_TYPES)["workspaceFolders"];
  folders: WorkspaceFolderSnapshotEntry[];
  selectedId: string | null;
};

export type LiveFeedChip = {
  id: string;
  name: string;
  workspaceName: string;
  activatedAt: string;
};

export type LiveFeedSnapshot = {
  watching: boolean;
  chips: LiveFeedChip[];
};

export type HostLiveFeedMessage = {
  type: (typeof HOST_TO_WEBVIEW_MESSAGE_TYPES)["liveFeed"];
  watching: boolean;
  chips: LiveFeedChip[];
};

export type HostToWebviewMessage =
  | HostReadyMessage
  | HostCatalogMessage
  | HostToggleResultMessage
  | HostOpenResultMessage
  | HostSettingsMessage
  | HostWorkspaceFoldersMessage
  | HostLiveFeedMessage;

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

export type WebviewOpenItemMessage = {
  type: (typeof WEBVIEW_TO_HOST_MESSAGE_TYPES)["openItem"];
  id: string;
};

export type WebviewOpenSettingsMessage = {
  type: (typeof WEBVIEW_TO_HOST_MESSAGE_TYPES)["openSettings"];
};

export type WebviewSelectWorkspaceFolderMessage = {
  type: (typeof WEBVIEW_TO_HOST_MESSAGE_TYPES)["selectWorkspaceFolder"];
  id: string;
};

export type WebviewSetLiveWatchingMessage = {
  type: (typeof WEBVIEW_TO_HOST_MESSAGE_TYPES)["setLiveWatching"];
  watching: boolean;
};

export type WebviewResetLiveFeedMessage = {
  type: (typeof WEBVIEW_TO_HOST_MESSAGE_TYPES)["resetLiveFeed"];
};

export type WebviewOpenLiveActivationMessage = {
  type: (typeof WEBVIEW_TO_HOST_MESSAGE_TYPES)["openLiveActivation"];
  id: string;
};

export type WebviewToHostMessage =
  | WebviewReadyMessage
  | WebviewCatalogRequestMessage
  | WebviewToggleEnabledMessage
  | WebviewOpenItemMessage
  | WebviewOpenSettingsMessage
  | WebviewSelectWorkspaceFolderMessage
  | WebviewSetLiveWatchingMessage
  | WebviewResetLiveFeedMessage
  | WebviewOpenLiveActivationMessage;
