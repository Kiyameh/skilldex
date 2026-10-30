import { useEffect, useState } from "react";
import {
  HOST_TO_WEBVIEW_MESSAGE_TYPES,
  type WorkspaceFolderSnapshotEntry,
} from "../shared/index.js";
import { requestSelectWorkspaceFolder, subscribeToHostMessages } from "./host-message-bridge";

export interface UseWorkspaceFoldersResult {
  folders: WorkspaceFolderSnapshotEntry[];
  selectedId: string | null;
  selectFolder: (id: string) => void;
}

export function useWorkspaceFolders(): UseWorkspaceFoldersResult {
  const [folders, setFolders] = useState<WorkspaceFolderSnapshotEntry[]>([]);
  const [confirmedId, setConfirmedId] = useState<string | null>(null);
  const [optimisticId, setOptimisticId] = useState<string | null>(null);

  useEffect(() => {
    return subscribeToHostMessages((message) => {
      if (message.type !== HOST_TO_WEBVIEW_MESSAGE_TYPES.workspaceFolders) return;
      setFolders(message.folders);
      setConfirmedId(message.selectedId);
      setOptimisticId(null);
    });
  }, []);

  const selectFolder = (id: string): void => {
    setOptimisticId(id);
    requestSelectWorkspaceFolder(id);
  };

  return {
    folders,
    selectedId: optimisticId ?? confirmedId,
    selectFolder,
  };
}
