import { afterEach, describe, expect, it, vi } from "vitest";
import type { Disposable, Webview } from "vscode";
import { HOST_TO_WEBVIEW_MESSAGE_TYPES, WEBVIEW_TO_HOST_MESSAGE_TYPES } from "../shared/index.js";
import { discoverCatalog } from "./discover-catalog.js";
import {
  startHostMessageHandling,
  type HostMessageAdapterOptions,
  type SkilldexConfigurationChangeEvent,
} from "./host-message-adapter.js";
import { createLiveActivationFeed } from "./live-activation-feed.js";
import { openCatalogItem } from "./open-catalog-item.js";
import { setItemEnabled } from "./set-item-enabled.js";

vi.mock("./set-item-enabled.js", () => ({
  setItemEnabled: vi.fn(),
}));

vi.mock("./open-catalog-item.js", () => ({
  openCatalogItem: vi.fn(),
}));

vi.mock("./discover-catalog.js", () => ({
  discoverCatalog: vi.fn(),
}));

const mockedSetItemEnabled = vi.mocked(setItemEnabled);
const mockedOpenCatalogItem = vi.mocked(openCatalogItem);
const mockedDiscoverCatalog = vi.mocked(discoverCatalog);

const DEFAULT_SETTINGS = {
  showSkills: true,
  showRules: true,
  showLiveArea: true,
};

const EMPTY_WORKSPACE_FOLDERS = { folders: [], selectedId: null };

function handlingOptions(
  overrides: Partial<HostMessageAdapterOptions> = {},
): HostMessageAdapterOptions {
  return {
    getWorkspaceRoot: () => undefined,
    getAiToolDirectory: () => ".cursor",
    getWorkspaceFoldersSnapshot: () => EMPTY_WORKSPACE_FOLDERS,
    selectWorkspaceFolder: () => undefined,
    readSettings: () => DEFAULT_SETTINGS,
    subscribeToConfigurationChanges: () => ({ dispose: () => undefined }),
    extensionId: "andoni.skilldex",
    executeCommand: () => undefined,
    liveFeed: createLiveActivationFeed(),
    openSkillDocument: async () => undefined,
    ...overrides,
  };
}

const INITIAL_LIVE_FEED_MESSAGE = {
  type: HOST_TO_WEBVIEW_MESSAGE_TYPES.liveFeed,
  watching: true,
  chips: [],
};

const SESSION_START_MESSAGES = [
  { type: HOST_TO_WEBVIEW_MESSAGE_TYPES.ready },
  { type: HOST_TO_WEBVIEW_MESSAGE_TYPES.settings, ...DEFAULT_SETTINGS },
  { type: HOST_TO_WEBVIEW_MESSAGE_TYPES.workspaceFolders, ...EMPTY_WORKSPACE_FOLDERS },
  INITIAL_LIVE_FEED_MESSAGE,
];

function readyMessageCount(posted: unknown[]): number {
  return posted.filter(
    (message) =>
      typeof message === "object" &&
      message !== null &&
      "type" in message &&
      message.type === HOST_TO_WEBVIEW_MESSAGE_TYPES.ready,
  ).length;
}

interface FakeWebview {
  webview: Webview;
  posted: unknown[];
  emit: (payload: unknown) => void;
}

function createFakeWebview(): FakeWebview {
  const listeners: Array<(payload: unknown) => unknown> = [];
  const posted: unknown[] = [];

  const emit = (payload: unknown): void => {
    for (const listener of listeners) listener(payload);
  };

  const webview = {
    postMessage: (message: unknown) => {
      posted.push(message);
      return Promise.resolve(true);
    },
    onDidReceiveMessage: (listener: (e: unknown) => unknown): Disposable => {
      listeners.push(listener);
      return {
        dispose: () => {
          const index = listeners.indexOf(listener);
          if (index >= 0) listeners.splice(index, 1);
        },
      };
    },
  } as unknown as Webview;

  return { webview, posted, emit };
}

const SAMPLE_ITEM = {
  id: ".cursor/skills/demo/SKILL.md",
  kind: "skill" as const,
  path: "/tmp/.cursor/skills/demo/SKILL.md",
  enabled: false,
  title: "demo-skill",
  characterCount: 1024,
};

describe("startHostMessageHandling", () => {
  afterEach(() => {
    vi.useRealTimers();
    mockedSetItemEnabled.mockReset();
    mockedOpenCatalogItem.mockReset();
    mockedDiscoverCatalog.mockReset();
  });

  it("posts host ready immediately and completes after webview ready", () => {
    const { webview, posted, emit } = createFakeWebview();
    const handling = startHostMessageHandling(webview, handlingOptions());

    expect(posted).toEqual(SESSION_START_MESSAGES);

    emit({ type: WEBVIEW_TO_HOST_MESSAGE_TYPES.ready });
    handling.dispose();
  });

  it("retries host ready until the webview replies", async () => {
    vi.useFakeTimers();
    const { webview, posted, emit } = createFakeWebview();
    const handling = startHostMessageHandling(webview, handlingOptions());

    expect(readyMessageCount(posted)).toBe(1);
    await vi.advanceTimersByTimeAsync(100);
    expect(readyMessageCount(posted)).toBeGreaterThan(1);
    expect(workspaceFoldersMessageCount(posted)).toBe(readyMessageCount(posted));

    emit({ type: WEBVIEW_TO_HOST_MESSAGE_TYPES.ready });
    const postedAfterHandshake = posted.length;
    await vi.advanceTimersByTimeAsync(500);
    expect(posted).toHaveLength(postedAfterHandshake);

    handling.dispose();
  });

  it("does not complete handshake on catalog request", () => {
    const { webview, posted, emit } = createFakeWebview();
    const handling = startHostMessageHandling(webview, handlingOptions());

    emit({ type: WEBVIEW_TO_HOST_MESSAGE_TYPES.catalogRequest });
    expect(posted[0]).toEqual({ type: HOST_TO_WEBVIEW_MESSAGE_TYPES.ready });
    expect(
      posted.some(
        (message) =>
          typeof message === "object" &&
          message !== null &&
          "type" in message &&
          message.type === HOST_TO_WEBVIEW_MESSAGE_TYPES.catalog,
      ),
    ).toBe(true);

    handling.dispose();
  });

  it("replies with an empty catalog when workspace root is missing", async () => {
    const { webview, posted, emit } = createFakeWebview();
    const handling = startHostMessageHandling(webview, handlingOptions());

    emit({ type: WEBVIEW_TO_HOST_MESSAGE_TYPES.catalogRequest });
    await vi.waitFor(() => {
      expect(posted).toContainEqual({
        type: HOST_TO_WEBVIEW_MESSAGE_TYPES.catalog,
        skills: [],
        rules: [],
      });
    });

    handling.dispose();
  });

  it("ignores payloads that are not webview-to-host messages", () => {
    const { webview, posted, emit } = createFakeWebview();
    const handling = startHostMessageHandling(webview, handlingOptions());

    emit({ type: "unknown" });
    emit(null);
    expect(posted).toEqual(SESSION_START_MESSAGES);

    handling.dispose();
  });

  it("replies with toggle failure when workspace root is missing", async () => {
    const { webview, posted, emit } = createFakeWebview();
    const handling = startHostMessageHandling(webview, handlingOptions());

    emit({
      type: WEBVIEW_TO_HOST_MESSAGE_TYPES.toggleEnabled,
      id: SAMPLE_ITEM.id,
      enabled: false,
    });

    await vi.waitFor(() => {
      expect(posted).toContainEqual({
        type: HOST_TO_WEBVIEW_MESSAGE_TYPES.toggleResult,
        ok: false,
        id: SAMPLE_ITEM.id,
        enabled: false,
        error: "No workspace folder is open",
      });
    });
    expect(mockedSetItemEnabled).not.toHaveBeenCalled();

    handling.dispose();
  });

  it("replies with toggle success when setItemEnabled succeeds", async () => {
    mockedSetItemEnabled.mockResolvedValue({ ok: true, item: SAMPLE_ITEM });
    const { webview, posted, emit } = createFakeWebview();
    const handling = startHostMessageHandling(
      webview,
      handlingOptions({
        getWorkspaceRoot: () => "/tmp/workspace",
      }),
    );

    emit({
      type: WEBVIEW_TO_HOST_MESSAGE_TYPES.toggleEnabled,
      id: SAMPLE_ITEM.id,
      enabled: false,
    });

    await vi.waitFor(() => {
      expect(posted).toContainEqual({
        type: HOST_TO_WEBVIEW_MESSAGE_TYPES.toggleResult,
        ok: true,
        item: SAMPLE_ITEM,
      });
    });
    expect(mockedSetItemEnabled).toHaveBeenCalledWith(
      "/tmp/workspace",
      SAMPLE_ITEM.id,
      false,
      ".cursor",
    );

    handling.dispose();
  });

  it("replies with toggle failure when setItemEnabled fails", async () => {
    mockedSetItemEnabled.mockResolvedValue({ ok: false, error: "EACCES" });
    const { webview, posted, emit } = createFakeWebview();
    const handling = startHostMessageHandling(
      webview,
      handlingOptions({
        getWorkspaceRoot: () => "/tmp/workspace",
      }),
    );

    emit({
      type: WEBVIEW_TO_HOST_MESSAGE_TYPES.toggleEnabled,
      id: SAMPLE_ITEM.id,
      enabled: true,
    });

    await vi.waitFor(() => {
      expect(posted).toContainEqual({
        type: HOST_TO_WEBVIEW_MESSAGE_TYPES.toggleResult,
        ok: false,
        id: SAMPLE_ITEM.id,
        enabled: true,
        error: "EACCES",
      });
    });

    handling.dispose();
  });

  it("replies with open failure when workspace root is missing", async () => {
    const { webview, posted, emit } = createFakeWebview();
    const handling = startHostMessageHandling(webview, handlingOptions());

    emit({
      type: WEBVIEW_TO_HOST_MESSAGE_TYPES.openItem,
      id: SAMPLE_ITEM.id,
    });

    await vi.waitFor(() => {
      expect(posted).toContainEqual({
        type: HOST_TO_WEBVIEW_MESSAGE_TYPES.openResult,
        ok: false,
        id: SAMPLE_ITEM.id,
        error: "No workspace folder is open",
      });
    });
    expect(mockedOpenCatalogItem).not.toHaveBeenCalled();

    handling.dispose();
  });

  it("replies with open success when openCatalogItem succeeds", async () => {
    mockedOpenCatalogItem.mockResolvedValue({ ok: true, id: SAMPLE_ITEM.id });
    const { webview, posted, emit } = createFakeWebview();
    const handling = startHostMessageHandling(
      webview,
      handlingOptions({
        getWorkspaceRoot: () => "/tmp/workspace",
      }),
    );

    emit({
      type: WEBVIEW_TO_HOST_MESSAGE_TYPES.openItem,
      id: SAMPLE_ITEM.id,
    });

    await vi.waitFor(() => {
      expect(posted).toContainEqual({
        type: HOST_TO_WEBVIEW_MESSAGE_TYPES.openResult,
        ok: true,
        id: SAMPLE_ITEM.id,
      });
    });
    expect(mockedOpenCatalogItem).toHaveBeenCalledWith("/tmp/workspace", SAMPLE_ITEM.id, ".cursor");

    handling.dispose();
  });

  it("replies with open failure when openCatalogItem fails", async () => {
    mockedOpenCatalogItem.mockResolvedValue({
      ok: false,
      id: SAMPLE_ITEM.id,
      error: "ENOENT",
    });
    const { webview, posted, emit } = createFakeWebview();
    const handling = startHostMessageHandling(
      webview,
      handlingOptions({
        getWorkspaceRoot: () => "/tmp/workspace",
      }),
    );

    emit({
      type: WEBVIEW_TO_HOST_MESSAGE_TYPES.openItem,
      id: SAMPLE_ITEM.id,
    });

    await vi.waitFor(() => {
      expect(posted).toContainEqual({
        type: HOST_TO_WEBVIEW_MESSAGE_TYPES.openResult,
        ok: false,
        id: SAMPLE_ITEM.id,
        error: "ENOENT",
      });
    });

    handling.dispose();
  });

  it("posts a settings snapshot at session start and again when skilldex settings change without discovering the catalog", () => {
    let currentSettings = DEFAULT_SETTINGS;
    const readSettings = vi.fn(() => currentSettings);
    const disposeConfiguration = vi.fn();
    let onConfigurationChange: ((event: SkilldexConfigurationChangeEvent) => void) | undefined;
    const { webview, posted } = createFakeWebview();
    const handling = startHostMessageHandling(
      webview,
      handlingOptions({
        getWorkspaceRoot: () => "/tmp/workspace",
        readSettings,
        subscribeToConfigurationChanges: (listener) => {
          onConfigurationChange = listener;
          return { dispose: disposeConfiguration };
        },
      }),
    );

    expect(posted[0]).toEqual({ type: HOST_TO_WEBVIEW_MESSAGE_TYPES.ready });
    expect(posted).toContainEqual({
      type: HOST_TO_WEBVIEW_MESSAGE_TYPES.settings,
      ...DEFAULT_SETTINGS,
    });

    onConfigurationChange?.({
      affectsConfiguration: (section) => section !== "skilldex",
    });
    expect(posted.filter(isSettingsMessage)).toHaveLength(1);

    currentSettings = {
      showSkills: false,
      showRules: true,
      showLiveArea: false,
    };
    onConfigurationChange?.({
      affectsConfiguration: (section) => section === "skilldex",
    });
    expect(posted).toContainEqual({
      type: HOST_TO_WEBVIEW_MESSAGE_TYPES.settings,
      showSkills: false,
      showRules: true,
      showLiveArea: false,
    });
    expect(mockedDiscoverCatalog).not.toHaveBeenCalled();

    handling.dispose();
    expect(disposeConfiguration).toHaveBeenCalledOnce();
  });

  it("sends the injected workspace folders and uses the chosen root for catalog, toggle, and open", async () => {
    const first = { id: "file:///tmp/first", name: "first", path: "/tmp/first" };
    const second = { id: "file:///tmp/second", name: "second", path: "/tmp/second" };
    const folders = [first, second];
    let selectedId: string | null = first.id;
    mockedDiscoverCatalog.mockResolvedValue({ skills: [], rules: [] });
    mockedSetItemEnabled.mockResolvedValue({ ok: true, item: SAMPLE_ITEM });
    mockedOpenCatalogItem.mockResolvedValue({ ok: true, id: SAMPLE_ITEM.id });

    const { webview, posted, emit } = createFakeWebview();
    const handling = startHostMessageHandling(
      webview,
      handlingOptions({
        getWorkspaceRoot: () => folders.find((folder) => folder.id === selectedId)?.path,
        getWorkspaceFoldersSnapshot: () => ({ folders, selectedId }),
        selectWorkspaceFolder: (id) => {
          if (!folders.some((folder) => folder.id === id)) return;
          selectedId = id;
        },
      }),
    );

    expect(posted[0]).toEqual({ type: HOST_TO_WEBVIEW_MESSAGE_TYPES.ready });
    expect(posted).toContainEqual({
      type: HOST_TO_WEBVIEW_MESSAGE_TYPES.workspaceFolders,
      folders,
      selectedId: first.id,
    });

    emit({
      type: WEBVIEW_TO_HOST_MESSAGE_TYPES.selectWorkspaceFolder,
      id: second.id,
    });

    await vi.waitFor(() => {
      expect(mockedDiscoverCatalog).toHaveBeenCalledWith(second.path, ".cursor");
    });
    expect(posted).toContainEqual({
      type: HOST_TO_WEBVIEW_MESSAGE_TYPES.workspaceFolders,
      folders,
      selectedId: second.id,
    });

    emit({
      type: WEBVIEW_TO_HOST_MESSAGE_TYPES.toggleEnabled,
      id: SAMPLE_ITEM.id,
      enabled: false,
    });
    await vi.waitFor(() => {
      expect(mockedSetItemEnabled).toHaveBeenCalledWith(
        second.path,
        SAMPLE_ITEM.id,
        false,
        ".cursor",
      );
    });

    emit({
      type: WEBVIEW_TO_HOST_MESSAGE_TYPES.openItem,
      id: SAMPLE_ITEM.id,
    });
    await vi.waitFor(() => {
      expect(mockedOpenCatalogItem).toHaveBeenCalledWith(second.path, SAMPLE_ITEM.id, ".cursor");
    });

    handling.dispose();
  });

  it("keeps the current root when the selected folder id is not open", async () => {
    const first = { id: "file:///tmp/first", name: "first", path: "/tmp/first" };
    const folders = [first];
    let selectedId: string | null = first.id;
    mockedDiscoverCatalog.mockResolvedValue({ skills: [], rules: [] });
    mockedSetItemEnabled.mockResolvedValue({ ok: true, item: SAMPLE_ITEM });

    const { webview, posted, emit } = createFakeWebview();
    const handling = startHostMessageHandling(
      webview,
      handlingOptions({
        getWorkspaceRoot: () => folders.find((folder) => folder.id === selectedId)?.path,
        getWorkspaceFoldersSnapshot: () => ({ folders, selectedId }),
        selectWorkspaceFolder: (id) => {
          if (!folders.some((folder) => folder.id === id)) return;
          selectedId = id;
        },
      }),
    );

    emit({
      type: WEBVIEW_TO_HOST_MESSAGE_TYPES.selectWorkspaceFolder,
      id: "file:///tmp/closed",
    });

    await vi.waitFor(() => {
      expect(mockedDiscoverCatalog).toHaveBeenCalledWith(first.path, ".cursor");
    });
    expect(selectedId).toBe(first.id);
    expect(posted).toContainEqual({
      type: HOST_TO_WEBVIEW_MESSAGE_TYPES.workspaceFolders,
      folders,
      selectedId: first.id,
    });

    emit({
      type: WEBVIEW_TO_HOST_MESSAGE_TYPES.toggleEnabled,
      id: SAMPLE_ITEM.id,
      enabled: false,
    });
    await vi.waitFor(() => {
      expect(mockedSetItemEnabled).toHaveBeenCalledWith(
        first.path,
        SAMPLE_ITEM.id,
        false,
        ".cursor",
      );
    });

    handling.dispose();
  });

  it("uses the configured ai tool directory for catalog, toggle, and open", async () => {
    mockedDiscoverCatalog.mockResolvedValue({ skills: [], rules: [] });
    mockedSetItemEnabled.mockResolvedValue({ ok: true, item: SAMPLE_ITEM });
    mockedOpenCatalogItem.mockResolvedValue({ ok: true, id: SAMPLE_ITEM.id });
    const { webview, emit } = createFakeWebview();
    const handling = startHostMessageHandling(
      webview,
      handlingOptions({
        getWorkspaceRoot: () => "/tmp/workspace",
        getAiToolDirectory: () => ".agents",
      }),
    );

    emit({ type: WEBVIEW_TO_HOST_MESSAGE_TYPES.catalogRequest });
    await vi.waitFor(() => {
      expect(mockedDiscoverCatalog).toHaveBeenCalledWith("/tmp/workspace", ".agents");
    });

    emit({
      type: WEBVIEW_TO_HOST_MESSAGE_TYPES.toggleEnabled,
      id: SAMPLE_ITEM.id,
      enabled: false,
    });
    await vi.waitFor(() => {
      expect(mockedSetItemEnabled).toHaveBeenCalledWith(
        "/tmp/workspace",
        SAMPLE_ITEM.id,
        false,
        ".agents",
      );
    });

    emit({
      type: WEBVIEW_TO_HOST_MESSAGE_TYPES.openItem,
      id: SAMPLE_ITEM.id,
    });
    await vi.waitFor(() => {
      expect(mockedOpenCatalogItem).toHaveBeenCalledWith(
        "/tmp/workspace",
        SAMPLE_ITEM.id,
        ".agents",
      );
    });

    handling.dispose();
  });

  it("opens native settings filtered to the extension", () => {
    const executeCommand = vi.fn();
    const { webview, emit } = createFakeWebview();
    const handling = startHostMessageHandling(
      webview,
      handlingOptions({
        extensionId: "andoni.skilldex",
        executeCommand,
      }),
    );

    emit({ type: WEBVIEW_TO_HOST_MESSAGE_TYPES.openSettings });

    expect(executeCommand).toHaveBeenCalledWith(
      "workbench.action.openSettings",
      "@ext:andoni.skilldex",
    );

    handling.dispose();
  });

  it("publishes the live feed after each activation, stop, resume and reset", () => {
    const liveFeed = createLiveActivationFeed();
    const { webview, posted, emit } = createFakeWebview();
    const handling = startHostMessageHandling(webview, handlingOptions({ liveFeed }));
    emit({ type: WEBVIEW_TO_HOST_MESSAGE_TYPES.ready });
    posted.length = 0;

    liveFeed.addActivation("maquetado", "repo", "/repo/.cursor/skills/maquetado/SKILL.md");
    emit({ type: WEBVIEW_TO_HOST_MESSAGE_TYPES.setLiveWatching, watching: false });
    emit({ type: WEBVIEW_TO_HOST_MESSAGE_TYPES.resetLiveFeed });
    emit({ type: WEBVIEW_TO_HOST_MESSAGE_TYPES.setLiveWatching, watching: true });

    expect(posted).toEqual([
      {
        ...INITIAL_LIVE_FEED_MESSAGE,
        chips: [
          {
            id: expect.any(String) as unknown,
            name: "maquetado",
            workspaceName: "repo",
            activatedAt: expect.any(String) as unknown,
          },
        ],
      },
      {
        ...INITIAL_LIVE_FEED_MESSAGE,
        watching: false,
        chips: [
          {
            id: expect.any(String) as unknown,
            name: "maquetado",
            workspaceName: "repo",
            activatedAt: expect.any(String) as unknown,
          },
        ],
      },
      { ...INITIAL_LIVE_FEED_MESSAGE, watching: false },
      INITIAL_LIVE_FEED_MESSAGE,
    ]);

    handling.dispose();
  });

  it("opens the skill document stored for a live chip", async () => {
    const liveFeed = createLiveActivationFeed();
    const skillFilePath = "/repo/.cursor/skills/maquetado/SKILL.md";
    liveFeed.addActivation("maquetado", "repo", skillFilePath);
    const chipId = liveFeed.getSnapshot().chips[0]?.id ?? "";
    const openSkillDocument = vi.fn(async () => undefined);
    const { webview, posted, emit } = createFakeWebview();
    const handling = startHostMessageHandling(
      webview,
      handlingOptions({ liveFeed, openSkillDocument }),
    );
    emit({ type: WEBVIEW_TO_HOST_MESSAGE_TYPES.ready });
    posted.length = 0;

    emit({ type: WEBVIEW_TO_HOST_MESSAGE_TYPES.openLiveActivation, id: chipId });

    await vi.waitFor(() => {
      expect(openSkillDocument).toHaveBeenCalledWith(skillFilePath);
    });
    expect(posted).toContainEqual({
      type: HOST_TO_WEBVIEW_MESSAGE_TYPES.openResult,
      ok: true,
      id: chipId,
    });

    emit({ type: WEBVIEW_TO_HOST_MESSAGE_TYPES.openLiveActivation, id: "missing" });
    expect(posted).toContainEqual({
      type: HOST_TO_WEBVIEW_MESSAGE_TYPES.openResult,
      ok: false,
      id: "missing",
      error: "Unknown live activation",
    });
    expect(openSkillDocument).toHaveBeenCalledTimes(1);

    handling.dispose();
  });

  it("stops publishing the live feed after dispose", () => {
    const liveFeed = createLiveActivationFeed();
    const { webview, posted } = createFakeWebview();
    startHostMessageHandling(webview, handlingOptions({ liveFeed })).dispose();
    posted.length = 0;

    liveFeed.addActivation("maquetado", "repo", "/repo/.cursor/skills/maquetado/SKILL.md");

    expect(posted).toEqual([]);
  });

  it("reports each published catalog so live chips can use card names", async () => {
    const catalog = { skills: [SAMPLE_ITEM], rules: [] };
    mockedDiscoverCatalog.mockResolvedValue(catalog);
    const onCatalogPublished = vi.fn();
    const { webview, emit } = createFakeWebview();
    const handling = startHostMessageHandling(
      webview,
      handlingOptions({ getWorkspaceRoot: () => "/tmp", onCatalogPublished }),
    );

    emit({ type: WEBVIEW_TO_HOST_MESSAGE_TYPES.catalogRequest });

    await vi.waitFor(() => {
      expect(onCatalogPublished).toHaveBeenCalledWith(catalog);
    });
    handling.dispose();
  });
});

function workspaceFoldersMessageCount(posted: unknown[]): number {
  return posted.filter(
    (message) =>
      typeof message === "object" &&
      message !== null &&
      "type" in message &&
      message.type === HOST_TO_WEBVIEW_MESSAGE_TYPES.workspaceFolders,
  ).length;
}

function isSettingsMessage(message: unknown): boolean {
  return (
    typeof message === "object" &&
    message !== null &&
    "type" in message &&
    message.type === HOST_TO_WEBVIEW_MESSAGE_TYPES.settings
  );
}
