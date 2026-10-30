import type { WorkspaceFolderSnapshotEntry } from "../shared/index.js";

export function workspaceFolderOptionLabel(
  folder: WorkspaceFolderSnapshotEntry,
  folders: readonly WorkspaceFolderSnapshotEntry[],
): string {
  const duplicated = folders.filter((entry) => entry.name === folder.name).length > 1;
  if (!duplicated) return folder.name;

  const parent = parentDirectoryName(folder.path);
  if (parent === "") return folder.path;
  return `${folder.name} (${parent})`;
}

function parentDirectoryName(folderPath: string): string {
  const normalized = folderPath.replaceAll("\\", "/").replace(/\/+$/u, "");
  const nameSeparator = normalized.lastIndexOf("/");
  if (nameSeparator < 0) return "";

  const parent = normalized.slice(0, nameSeparator);
  if (parent === "") return "";

  const parentSeparator = parent.lastIndexOf("/");
  return parentSeparator < 0 ? parent : parent.slice(parentSeparator + 1);
}
