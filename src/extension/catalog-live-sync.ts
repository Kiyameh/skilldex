import type { Disposable, FileSystemWatcher, Uri, WorkspaceFolder } from "vscode";
import type { CatalogPayload } from "../shared/index.js";
import { DEFAULT_AI_TOOL_DIRECTORY, rulesWatchGlob, skillsWatchGlob } from "./catalog-paths.js";
import { discoverCatalog } from "./discover-catalog.js";

export const CATALOG_LIVE_SYNC_DEBOUNCE_MS = 250;

export type CatalogSink = (catalog: CatalogPayload) => void;

export type CreateFileSystemWatcher = (base: Uri, globPattern: string) => FileSystemWatcher;

export type DiscoverCatalogFn = (workspaceRoot: string) => Promise<CatalogPayload>;

export interface CatalogLiveSyncOptions {
  getWorkspaceFolder: () => WorkspaceFolder | undefined;
  createFileSystemWatcher: CreateFileSystemWatcher;
  getAiToolDirectory?: () => string;
  discoverCatalog?: DiscoverCatalogFn;
  debounceMs?: number;
}

export interface CatalogLiveSync extends Disposable {
  setCatalogSink: (sink: CatalogSink) => void;
  clearCatalogSink: () => void;
  reattach: () => void;
}

export function startCatalogLiveSync(options: CatalogLiveSyncOptions): CatalogLiveSync {
  const aiToolDirectory = (): string => options.getAiToolDirectory?.() ?? DEFAULT_AI_TOOL_DIRECTORY;
  const runDiscovery =
    options.discoverCatalog ??
    ((workspaceRoot: string) => discoverCatalog(workspaceRoot, aiToolDirectory()));
  const debounceMs = options.debounceMs ?? CATALOG_LIVE_SYNC_DEBOUNCE_MS;

  const watchers: FileSystemWatcher[] = [];
  const eventSubscriptions: Disposable[] = [];
  let catalogSink: CatalogSink | undefined;
  let debounceTimer: ReturnType<typeof setTimeout> | undefined;
  let refreshGeneration = 0;
  let disposed = false;

  function detachWatchers(): void {
    for (const subscription of eventSubscriptions) subscription.dispose();
    eventSubscriptions.length = 0;

    for (const watcher of watchers) watcher.dispose();
    watchers.length = 0;
  }

  function attachWatchers(): void {
    const workspaceFolder = options.getWorkspaceFolder();
    if (workspaceFolder === undefined) return;

    const directory = aiToolDirectory();
    const rulesWatcher = options.createFileSystemWatcher(
      workspaceFolder.uri,
      rulesWatchGlob(directory),
    );
    const skillsWatcher = options.createFileSystemWatcher(
      workspaceFolder.uri,
      skillsWatchGlob(directory),
    );
    const attached = [rulesWatcher, skillsWatcher];
    watchers.push(...attached);

    for (const watcher of attached) {
      eventSubscriptions.push(
        watcher.onDidCreate(() => scheduleRefresh()),
        watcher.onDidChange(() => scheduleRefresh()),
        watcher.onDidDelete(() => scheduleRefresh()),
      );
    }
  }

  function invalidateInFlightRefresh(): void {
    if (debounceTimer !== undefined) {
      clearTimeout(debounceTimer);
      debounceTimer = undefined;
    }
    refreshGeneration += 1;
  }

  async function publishSelectedCatalog(): Promise<void> {
    if (disposed) return;

    const folder = options.getWorkspaceFolder();
    if (folder === undefined) return;

    const generation = ++refreshGeneration;
    const catalog = await runDiscovery(folder.uri.fsPath);
    if (disposed || generation !== refreshGeneration) return;

    catalogSink?.(catalog);
  }

  attachWatchers();

  function scheduleRefresh(): void {
    if (disposed) return;

    if (debounceTimer !== undefined) clearTimeout(debounceTimer);

    debounceTimer = setTimeout(() => {
      debounceTimer = undefined;
      void runRefresh();
    }, debounceMs);
  }

  async function runRefresh(): Promise<void> {
    if (disposed) return;

    const folder = options.getWorkspaceFolder();
    if (folder === undefined) return;

    const generation = ++refreshGeneration;
    const catalog = await runDiscovery(folder.uri.fsPath);

    if (disposed || generation !== refreshGeneration) return;

    catalogSink?.(catalog);
  }

  return {
    setCatalogSink: (sink: CatalogSink) => {
      if (disposed) return;
      catalogSink = sink;
    },
    clearCatalogSink: () => {
      catalogSink = undefined;
    },
    reattach: () => {
      if (disposed) return;
      invalidateInFlightRefresh();
      detachWatchers();
      attachWatchers();
      void publishSelectedCatalog();
    },
    dispose: () => {
      if (disposed) return;
      disposed = true;

      if (debounceTimer !== undefined) {
        clearTimeout(debounceTimer);
        debounceTimer = undefined;
      }

      refreshGeneration += 1;
      catalogSink = undefined;
      detachWatchers();
    },
  };
}
