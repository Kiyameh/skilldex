import type { Disposable, Memento, WorkspaceFolder } from "vscode";
import type { WorkspaceFolderSnapshot } from "../shared/index.js";

export const SELECTED_WORKSPACE_FOLDER_STATE_KEY = "skilldex.selectedWorkspaceFolder";

export interface SelectedWorkspaceFolderChange {
  selectionChanged: boolean;
}

export interface SelectedWorkspaceFolder {
  getSnapshot: () => WorkspaceFolderSnapshot;
  getSelectedFolder: () => WorkspaceFolder | undefined;
  select: (id: string) => void;
  onDidChange: (listener: (change: SelectedWorkspaceFolderChange) => void) => Disposable;
  dispose: () => void;
}

export interface SelectedWorkspaceFolderOptions {
  getWorkspaceFolders: () => readonly WorkspaceFolder[];
  workspaceState: Memento;
  onDidChangeWorkspaceFolders: (listener: () => void) => Disposable;
}

export function createSelectedWorkspaceFolder(
  options: SelectedWorkspaceFolderOptions,
): SelectedWorkspaceFolder {
  const stored = options.workspaceState.get(SELECTED_WORKSPACE_FOLDER_STATE_KEY);
  let selectedUri = typeof stored === "string" ? stored : undefined;
  let lastEffectiveId = effectiveSelectedId();
  let disposed = false;
  const listeners = new Set<(change: SelectedWorkspaceFolderChange) => void>();

  const folderSubscription = options.onDidChangeWorkspaceFolders(() => {
    publishFolderChange();
  });

  function folderId(folder: WorkspaceFolder): string {
    return folder.uri.toString();
  }

  function effectiveSelectedId(): string | null {
    const folders = options.getWorkspaceFolders();
    if (folders.length === 0) return null;
    if (selectedUri !== undefined && folders.some((folder) => folderId(folder) === selectedUri))
      return selectedUri;
    const firstFolder = folders[0];
    if (firstFolder === undefined) return null;
    return folderId(firstFolder);
  }

  function notify(change: SelectedWorkspaceFolderChange): void {
    if (disposed) return;
    for (const listener of listeners) listener(change);
  }

  function persistSelection(id: string): void {
    selectedUri = id;
    void options.workspaceState.update(SELECTED_WORKSPACE_FOLDER_STATE_KEY, id);
  }

  function publishFolderChange(): void {
    if (disposed) return;
    const nextId = effectiveSelectedId();
    const selectionChanged = nextId !== lastEffectiveId;
    if (selectionChanged && nextId !== null) persistSelection(nextId);
    lastEffectiveId = nextId;
    notify({ selectionChanged });
  }

  return {
    getSnapshot: () => {
      const folders = options.getWorkspaceFolders();
      const selectedId = effectiveSelectedId();
      return {
        folders: folders.map((folder) => ({
          id: folderId(folder),
          name: folder.name,
          path: folder.uri.fsPath,
        })),
        selectedId,
      };
    },
    getSelectedFolder: () => {
      const selectedId = effectiveSelectedId();
      if (selectedId === null) return undefined;
      return options.getWorkspaceFolders().find((folder) => folderId(folder) === selectedId);
    },
    select: (id: string) => {
      if (disposed) return;
      const folders = options.getWorkspaceFolders();
      if (!folders.some((folder) => folderId(folder) === id)) return;
      if (effectiveSelectedId() === id) return;
      persistSelection(id);
      lastEffectiveId = id;
      notify({ selectionChanged: true });
    },
    onDidChange: (listener) => {
      listeners.add(listener);
      return {
        dispose: () => {
          listeners.delete(listener);
        },
      };
    },
    dispose: () => {
      if (disposed) return;
      disposed = true;
      folderSubscription.dispose();
      listeners.clear();
    },
  };
}
