import { describe, expect, it, vi } from "vitest";
import type { Disposable, Memento, Uri, WorkspaceFolder } from "vscode";
import {
  SELECTED_WORKSPACE_FOLDER_STATE_KEY,
  createSelectedWorkspaceFolder,
  type SelectedWorkspaceFolderChange,
} from "./selected-workspace-folder.js";

function createFolder(name: string, fsPath: string): WorkspaceFolder {
  const uri = {
    fsPath,
    scheme: "file",
    toString: () => `file://${fsPath}`,
  } as Uri;
  return { uri, name, index: 0 };
}

function createWorkspaceState(initial?: string): Memento & { values: Map<string, string> } {
  const values = new Map<string, string>();
  if (initial !== undefined) values.set(SELECTED_WORKSPACE_FOLDER_STATE_KEY, initial);

  const state = {
    values,
    keys: () => [...values.keys()],
    get: (key: string) => values.get(key),
    update: (key: string, value: string | undefined) => {
      if (value === undefined) values.delete(key);
      else values.set(key, value);
      return Promise.resolve();
    },
  };

  return state as Memento & { values: Map<string, string> };
}

describe("createSelectedWorkspaceFolder", () => {
  it("uses the first folder when nothing valid is stored and keeps snapshot order and fsPath", () => {
    const folders = [createFolder("zeta", "/tmp/zeta"), createFolder("alpha", "/tmp/alpha")];
    const selection = createSelectedWorkspaceFolder({
      getWorkspaceFolders: () => folders,
      workspaceState: createWorkspaceState("file:///tmp/missing"),
      onDidChangeWorkspaceFolders: () => ({ dispose: () => undefined }),
    });

    expect(selection.getSnapshot()).toEqual({
      folders: [
        { id: "file:///tmp/zeta", name: "zeta", path: "/tmp/zeta" },
        { id: "file:///tmp/alpha", name: "alpha", path: "/tmp/alpha" },
      ],
      selectedId: "file:///tmp/zeta",
    });
    expect(selection.getSnapshot().folders[0]?.path).toBe(folders[0]?.uri.fsPath);

    selection.dispose();
  });

  it("restores a stored folder that is still open", () => {
    const folders = [createFolder("zeta", "/tmp/zeta"), createFolder("alpha", "/tmp/alpha")];
    const selection = createSelectedWorkspaceFolder({
      getWorkspaceFolders: () => folders,
      workspaceState: createWorkspaceState("file:///tmp/alpha"),
      onDidChangeWorkspaceFolders: () => ({ dispose: () => undefined }),
    });

    expect(selection.getSnapshot().selectedId).toBe("file:///tmp/alpha");
    expect(selection.getSelectedFolder()?.uri.fsPath).toBe("/tmp/alpha");

    selection.dispose();
  });

  it("reports a null selection when no folder is open", () => {
    const selection = createSelectedWorkspaceFolder({
      getWorkspaceFolders: () => [],
      workspaceState: createWorkspaceState(),
      onDidChangeWorkspaceFolders: () => ({ dispose: () => undefined }),
    });

    expect(selection.getSnapshot()).toEqual({ folders: [], selectedId: null });
    expect(selection.getSelectedFolder()).toBeUndefined();

    selection.dispose();
  });

  it("ignores an unknown id", () => {
    const folders = [createFolder("alpha", "/tmp/alpha")];
    const onChange = vi.fn<(change: SelectedWorkspaceFolderChange) => void>();
    const workspaceState = createWorkspaceState();
    const selection = createSelectedWorkspaceFolder({
      getWorkspaceFolders: () => folders,
      workspaceState,
      onDidChangeWorkspaceFolders: () => ({ dispose: () => undefined }),
    });
    selection.onDidChange(onChange);

    selection.select("file:///tmp/missing");

    expect(selection.getSnapshot().selectedId).toBe("file:///tmp/alpha");
    expect(onChange).not.toHaveBeenCalled();
    expect(workspaceState.values.has(SELECTED_WORKSPACE_FOLDER_STATE_KEY)).toBe(false);

    selection.dispose();
  });

  it("keeps the current folder when another root is added", () => {
    const folders = [createFolder("alpha", "/tmp/alpha")];
    let onFoldersChanged: (() => void) | undefined;
    const onChange = vi.fn<(change: SelectedWorkspaceFolderChange) => void>();
    const selection = createSelectedWorkspaceFolder({
      getWorkspaceFolders: () => folders,
      workspaceState: createWorkspaceState("file:///tmp/alpha"),
      onDidChangeWorkspaceFolders: (listener) => {
        onFoldersChanged = listener;
        return { dispose: () => undefined };
      },
    });
    selection.onDidChange(onChange);

    folders.push(createFolder("beta", "/tmp/beta"));
    onFoldersChanged?.();

    expect(selection.getSnapshot()).toEqual({
      folders: [
        { id: "file:///tmp/alpha", name: "alpha", path: "/tmp/alpha" },
        { id: "file:///tmp/beta", name: "beta", path: "/tmp/beta" },
      ],
      selectedId: "file:///tmp/alpha",
    });
    expect(onChange).toHaveBeenCalledWith({ selectionChanged: false });

    selection.dispose();
  });

  it("falls back to the first remaining folder and notifies when the selected one is removed", () => {
    const folders = [createFolder("alpha", "/tmp/alpha"), createFolder("beta", "/tmp/beta")];
    let onFoldersChanged: (() => void) | undefined;
    const onChange = vi.fn<(change: SelectedWorkspaceFolderChange) => void>();
    const workspaceState = createWorkspaceState("file:///tmp/alpha");
    const subscription: Disposable = { dispose: vi.fn() };
    const selection = createSelectedWorkspaceFolder({
      getWorkspaceFolders: () => folders,
      workspaceState,
      onDidChangeWorkspaceFolders: (listener) => {
        onFoldersChanged = listener;
        return subscription;
      },
    });
    selection.onDidChange(onChange);

    folders.shift();
    onFoldersChanged?.();

    expect(selection.getSnapshot()).toEqual({
      folders: [{ id: "file:///tmp/beta", name: "beta", path: "/tmp/beta" }],
      selectedId: "file:///tmp/beta",
    });
    expect(selection.getSnapshot().folders[0]?.path).toBe("/tmp/beta");
    expect(workspaceState.values.get(SELECTED_WORKSPACE_FOLDER_STATE_KEY)).toBe("file:///tmp/beta");
    expect(onChange).toHaveBeenCalledWith({ selectionChanged: true });

    selection.dispose();
    expect(subscription.dispose).toHaveBeenCalledOnce();
  });
});
