import { afterEach, describe, expect, it, vi } from "vitest";
import type { Disposable, FileSystemWatcher, Uri, WorkspaceFolder } from "vscode";
import type { CatalogPayload } from "../shared/index.js";
import {
  CATALOG_LIVE_SYNC_DEBOUNCE_MS,
  startCatalogLiveSync,
  type CreateFileSystemWatcher,
} from "./catalog-live-sync.js";

interface FakeWatcher {
  watcher: FileSystemWatcher;
  emitCreate: () => void;
  emitChange: () => void;
  emitDelete: () => void;
  disposed: boolean;
}

function createFakeWatcher(): FakeWatcher {
  const createListeners: Array<() => void> = [];
  const changeListeners: Array<() => void> = [];
  const deleteListeners: Array<() => void> = [];
  let disposed = false;

  const subscribe = (listeners: Array<() => void>, listener: () => void): Disposable => {
    listeners.push(listener);
    return {
      dispose: () => {
        const index = listeners.indexOf(listener);
        if (index >= 0) listeners.splice(index, 1);
      },
    };
  };

  const watcher = {
    onDidCreate: (listener: () => void) => subscribe(createListeners, listener),
    onDidChange: (listener: () => void) => subscribe(changeListeners, listener),
    onDidDelete: (listener: () => void) => subscribe(deleteListeners, listener),
    dispose: () => {
      disposed = true;
      createListeners.length = 0;
      changeListeners.length = 0;
      deleteListeners.length = 0;
    },
  } as unknown as FileSystemWatcher;

  return {
    watcher,
    emitCreate: () => {
      for (const listener of createListeners) listener();
    },
    emitChange: () => {
      for (const listener of changeListeners) listener();
    },
    emitDelete: () => {
      for (const listener of deleteListeners) listener();
    },
    get disposed() {
      return disposed;
    },
  };
}

function createWorkspaceFolder(fsPath = "/tmp/skilldex-workspace"): WorkspaceFolder {
  return {
    uri: { fsPath, scheme: "file" } as Uri,
    name: "skilldex-workspace",
    index: 0,
  };
}

const EMPTY_CATALOG: CatalogPayload = { skills: [], rules: [] };

describe("startCatalogLiveSync", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("does not register watchers when there is no workspace folder", () => {
    const createFileSystemWatcher = vi.fn<CreateFileSystemWatcher>();

    const sync = startCatalogLiveSync({
      getWorkspaceFolder: () => undefined,
      createFileSystemWatcher,
    });

    expect(createFileSystemWatcher).not.toHaveBeenCalled();
    sync.dispose();
  });

  it("registers watchers for rules and skills globs", () => {
    const fakeWatchers: FakeWatcher[] = [];
    const createFileSystemWatcher = vi.fn<CreateFileSystemWatcher>(() => {
      const fake = createFakeWatcher();
      fakeWatchers.push(fake);
      return fake.watcher;
    });

    const folder = createWorkspaceFolder();
    const sync = startCatalogLiveSync({
      getWorkspaceFolder: () => folder,
      createFileSystemWatcher,
    });

    expect(createFileSystemWatcher).toHaveBeenCalledTimes(2);
    expect(createFileSystemWatcher.mock.calls[0]?.[1]).toBe(".cursor/rules/**");
    expect(createFileSystemWatcher.mock.calls[1]?.[1]).toBe(".cursor/skills/**");
    expect(fakeWatchers).toHaveLength(2);
    sync.dispose();
    expect(fakeWatchers.every((entry) => entry.disposed)).toBe(true);
  });

  it("watches the configured directory and follows it when reattaching", () => {
    const createFileSystemWatcher = vi.fn<CreateFileSystemWatcher>(
      () => createFakeWatcher().watcher,
    );
    let directory = ".cursor";
    const sync = startCatalogLiveSync({
      getWorkspaceFolder: () => createWorkspaceFolder(),
      createFileSystemWatcher,
      getAiToolDirectory: () => directory,
      discoverCatalog: vi.fn().mockResolvedValue(EMPTY_CATALOG),
    });

    expect(createFileSystemWatcher.mock.calls[0]?.[1]).toBe(".cursor/rules/**");
    expect(createFileSystemWatcher.mock.calls[1]?.[1]).toBe(".cursor/skills/**");

    directory = ".agents";
    sync.reattach();

    expect(createFileSystemWatcher.mock.calls[2]?.[1]).toBe(".agents/rules/**");
    expect(createFileSystemWatcher.mock.calls[3]?.[1]).toBe(".agents/skills/**");
    sync.dispose();
  });

  it("coalesces burst events into a single discovery after debounce", async () => {
    vi.useFakeTimers();
    const fakeWatchers: FakeWatcher[] = [];
    const createFileSystemWatcher: CreateFileSystemWatcher = () => {
      const fake = createFakeWatcher();
      fakeWatchers.push(fake);
      return fake.watcher;
    };

    const discoverCatalog = vi.fn().mockResolvedValue(EMPTY_CATALOG);
    const sink = vi.fn();
    const folder = createWorkspaceFolder();

    const sync = startCatalogLiveSync({
      getWorkspaceFolder: () => folder,
      createFileSystemWatcher,
      discoverCatalog,
      debounceMs: CATALOG_LIVE_SYNC_DEBOUNCE_MS,
    });
    sync.setCatalogSink(sink);

    fakeWatchers[0]?.emitCreate();
    fakeWatchers[0]?.emitChange();
    fakeWatchers[1]?.emitDelete();

    expect(discoverCatalog).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(CATALOG_LIVE_SYNC_DEBOUNCE_MS);
    await vi.waitFor(() => {
      expect(discoverCatalog).toHaveBeenCalledTimes(1);
    });
    expect(discoverCatalog).toHaveBeenCalledWith(folder.uri.fsPath);
    expect(sink).toHaveBeenCalledWith(EMPTY_CATALOG);

    sync.dispose();
  });

  it("does not push when no catalog sink is set", async () => {
    vi.useFakeTimers();
    const fakeWatchers: FakeWatcher[] = [];
    const createFileSystemWatcher: CreateFileSystemWatcher = () => {
      const fake = createFakeWatcher();
      fakeWatchers.push(fake);
      return fake.watcher;
    };

    const discoverCatalog = vi.fn().mockResolvedValue(EMPTY_CATALOG);
    const folder = createWorkspaceFolder();

    const sync = startCatalogLiveSync({
      getWorkspaceFolder: () => folder,
      createFileSystemWatcher,
      discoverCatalog,
    });

    fakeWatchers[0]?.emitChange();
    await vi.advanceTimersByTimeAsync(CATALOG_LIVE_SYNC_DEBOUNCE_MS);
    await vi.waitFor(() => {
      expect(discoverCatalog).toHaveBeenCalledTimes(1);
    });

    sync.dispose();
  });

  it("stops scheduling refreshes after dispose", async () => {
    vi.useFakeTimers();
    const fakeWatchers: FakeWatcher[] = [];
    const createFileSystemWatcher: CreateFileSystemWatcher = () => {
      const fake = createFakeWatcher();
      fakeWatchers.push(fake);
      return fake.watcher;
    };

    const discoverCatalog = vi.fn().mockResolvedValue(EMPTY_CATALOG);
    const sink = vi.fn();
    const folder = createWorkspaceFolder();

    const sync = startCatalogLiveSync({
      getWorkspaceFolder: () => folder,
      createFileSystemWatcher,
      discoverCatalog,
    });
    sync.setCatalogSink(sink);
    sync.dispose();

    fakeWatchers[0]?.emitChange();
    await vi.advanceTimersByTimeAsync(CATALOG_LIVE_SYNC_DEBOUNCE_MS);

    expect(discoverCatalog).not.toHaveBeenCalled();
    expect(sink).not.toHaveBeenCalled();
  });

  it("discards stale refresh results when a newer generation starts", async () => {
    vi.useFakeTimers();
    const fakeWatchers: FakeWatcher[] = [];
    const createFileSystemWatcher: CreateFileSystemWatcher = () => {
      const fake = createFakeWatcher();
      fakeWatchers.push(fake);
      return fake.watcher;
    };

    let resolveFirst!: (catalog: CatalogPayload) => void;
    let resolveSecond!: (catalog: CatalogPayload) => void;
    const firstCatalog: CatalogPayload = {
      skills: [],
      rules: [{ id: "old", kind: "rule", path: "/old", enabled: true }],
    };
    const secondCatalog: CatalogPayload = {
      skills: [],
      rules: [{ id: "new", kind: "rule", path: "/new", enabled: true }],
    };

    const discoverCatalog = vi
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise<CatalogPayload>((resolve) => {
            resolveFirst = resolve;
          }),
      )
      .mockImplementationOnce(
        () =>
          new Promise<CatalogPayload>((resolve) => {
            resolveSecond = resolve;
          }),
      );

    const sink = vi.fn();
    const folder = createWorkspaceFolder();
    const sync = startCatalogLiveSync({
      getWorkspaceFolder: () => folder,
      createFileSystemWatcher,
      discoverCatalog,
      debounceMs: CATALOG_LIVE_SYNC_DEBOUNCE_MS,
    });
    sync.setCatalogSink(sink);

    fakeWatchers[0]?.emitChange();
    await vi.advanceTimersByTimeAsync(CATALOG_LIVE_SYNC_DEBOUNCE_MS);
    expect(discoverCatalog).toHaveBeenCalledTimes(1);

    fakeWatchers[0]?.emitChange();
    await vi.advanceTimersByTimeAsync(CATALOG_LIVE_SYNC_DEBOUNCE_MS);
    expect(discoverCatalog).toHaveBeenCalledTimes(2);

    resolveSecond(secondCatalog);
    await Promise.resolve();
    expect(sink).toHaveBeenCalledWith(secondCatalog);

    resolveFirst(firstCatalog);
    await Promise.resolve();
    expect(sink).toHaveBeenCalledTimes(1);
    expect(sink).not.toHaveBeenCalledWith(firstCatalog);

    sync.dispose();
  });

  it("reattaches to the folder the getter returns and drops an in-flight discovery", async () => {
    vi.useFakeTimers();
    const fakeWatchers: FakeWatcher[] = [];
    const createFileSystemWatcher: CreateFileSystemWatcher = () => {
      const fake = createFakeWatcher();
      fakeWatchers.push(fake);
      return fake.watcher;
    };

    let folder = createWorkspaceFolder("/tmp/folder-a");
    let resolveStale: ((catalog: CatalogPayload) => void) | undefined;
    const staleCatalog: CatalogPayload = {
      skills: [],
      rules: [{ id: "stale", kind: "rule", path: "/tmp/folder-a/old.mdc", enabled: true }],
    };
    const freshCatalog: CatalogPayload = {
      skills: [],
      rules: [{ id: "fresh", kind: "rule", path: "/tmp/folder-b/new.mdc", enabled: true }],
    };
    const discoverCatalog = vi
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise<CatalogPayload>((resolve) => {
            resolveStale = resolve;
          }),
      )
      .mockResolvedValue(freshCatalog);
    const sink = vi.fn();

    const sync = startCatalogLiveSync({
      getWorkspaceFolder: () => folder,
      createFileSystemWatcher,
      discoverCatalog,
      debounceMs: CATALOG_LIVE_SYNC_DEBOUNCE_MS,
    });
    sync.setCatalogSink(sink);

    fakeWatchers[0]?.emitChange();
    await vi.advanceTimersByTimeAsync(CATALOG_LIVE_SYNC_DEBOUNCE_MS);
    expect(discoverCatalog).toHaveBeenCalledTimes(1);
    expect(discoverCatalog).toHaveBeenCalledWith("/tmp/folder-a");

    const previousWatchers = fakeWatchers.slice(0, 2);
    folder = createWorkspaceFolder("/tmp/folder-b");
    sync.reattach();

    expect(previousWatchers.every((entry) => entry.disposed)).toBe(true);
    expect(fakeWatchers).toHaveLength(4);

    resolveStale?.(staleCatalog);
    await Promise.resolve();
    expect(sink).not.toHaveBeenCalledWith(staleCatalog);

    await vi.waitFor(() => {
      expect(sink).toHaveBeenCalledWith(freshCatalog);
    });
    expect(discoverCatalog).toHaveBeenCalledWith("/tmp/folder-b");

    const callsBeforeLaterChange = discoverCatalog.mock.calls.length;
    fakeWatchers[2]?.emitChange();
    await vi.advanceTimersByTimeAsync(CATALOG_LIVE_SYNC_DEBOUNCE_MS);
    await vi.waitFor(() => {
      expect(discoverCatalog.mock.calls.length).toBeGreaterThan(callsBeforeLaterChange);
    });
    expect(discoverCatalog).toHaveBeenLastCalledWith("/tmp/folder-b");

    sync.dispose();
  });

  it("clears the catalog sink without disposing watchers", () => {
    const fakeWatchers: FakeWatcher[] = [];
    const createFileSystemWatcher: CreateFileSystemWatcher = () => {
      const fake = createFakeWatcher();
      fakeWatchers.push(fake);
      return fake.watcher;
    };

    const sync = startCatalogLiveSync({
      getWorkspaceFolder: () => createWorkspaceFolder(),
      createFileSystemWatcher,
    });
    sync.setCatalogSink(vi.fn());
    sync.clearCatalogSink();

    expect(fakeWatchers.every((entry) => !entry.disposed)).toBe(true);
    sync.dispose();
  });
});
