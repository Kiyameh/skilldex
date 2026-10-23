import type { Disposable, FileSystemWatcher, Uri, WorkspaceFolder } from "vscode";
import type { CatalogPayload } from "../shared/index.js";
import { RULES_DIRECTORY, SKILLS_DIRECTORY } from "./catalog-paths.js";
import { discoverCatalog } from "./discover-catalog.js";

export const CATALOG_LIVE_SYNC_DEBOUNCE_MS = 250;

export const RULES_WATCH_GLOB = `${RULES_DIRECTORY.split(/[/\\]/).join("/")}/**`;
export const SKILLS_WATCH_GLOB = `${SKILLS_DIRECTORY.split(/[/\\]/).join("/")}/**`;

export type CatalogSink = (catalog: CatalogPayload) => void;

export type CreateFileSystemWatcher = (base: Uri, globPattern: string) => FileSystemWatcher;

export type DiscoverCatalogFn = (workspaceRoot: string) => Promise<CatalogPayload>;

export interface CatalogLiveSyncOptions {
  getWorkspaceFolder: () => WorkspaceFolder | undefined;
  createFileSystemWatcher: CreateFileSystemWatcher;
  discoverCatalog?: DiscoverCatalogFn;
  debounceMs?: number;
}

export interface CatalogLiveSync extends Disposable {
  setCatalogSink: (sink: CatalogSink) => void;
  clearCatalogSink: () => void;
}

export function startCatalogLiveSync(options: CatalogLiveSyncOptions): CatalogLiveSync {
  const runDiscovery = options.discoverCatalog ?? discoverCatalog;
  const debounceMs = options.debounceMs ?? CATALOG_LIVE_SYNC_DEBOUNCE_MS;

  const watchers: FileSystemWatcher[] = [];
  const eventSubscriptions: Disposable[] = [];
  let catalogSink: CatalogSink | undefined;
  let debounceTimer: ReturnType<typeof setTimeout> | undefined;
  let refreshGeneration = 0;
  let disposed = false;

  const workspaceFolder = options.getWorkspaceFolder();
  if (workspaceFolder !== undefined) {
    const rulesWatcher = options.createFileSystemWatcher(
      workspaceFolder.uri,
      RULES_WATCH_GLOB,
    );
    const skillsWatcher = options.createFileSystemWatcher(
      workspaceFolder.uri,
      SKILLS_WATCH_GLOB,
    );
    watchers.push(rulesWatcher, skillsWatcher);

    for (const watcher of watchers) {
      eventSubscriptions.push(
        watcher.onDidCreate(() => scheduleRefresh()),
        watcher.onDidChange(() => scheduleRefresh()),
        watcher.onDidDelete(() => scheduleRefresh()),
      );
    }
  }

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
    dispose: () => {
      if (disposed) return;
      disposed = true;

      if (debounceTimer !== undefined) {
        clearTimeout(debounceTimer);
        debounceTimer = undefined;
      }

      refreshGeneration += 1;
      catalogSink = undefined;

      for (const subscription of eventSubscriptions) subscription.dispose();
      eventSubscriptions.length = 0;

      for (const watcher of watchers) watcher.dispose();
      watchers.length = 0;
    },
  };
}
