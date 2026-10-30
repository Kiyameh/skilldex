import { useCallback, useEffect, useRef, useState } from "react";
import {
  HOST_TO_WEBVIEW_MESSAGE_TYPES,
  type CatalogItem,
  type CatalogPayload,
} from "../shared/index.js";
import {
  requestCatalog,
  requestOpenItem,
  requestOpenLiveActivation,
  requestToggleEnabled,
  subscribeToHostMessages,
} from "./host-message-bridge";
import type { HandshakeStatus } from "./use-host-handshake";

export interface UseCatalogResult {
  catalog: CatalogPayload | undefined;
  toggleError: string | undefined;
  openError: string | undefined;
  pendingToggleIds: ReadonlySet<string>;
  toggleItemEnabled: (item: CatalogItem, nextEnabled: boolean) => void;
  openItem: (item: CatalogItem) => void;
  openLiveActivation: (id: string) => void;
  resetForFolderChange: () => void;
  clearToggleError: () => void;
  clearOpenError: () => void;
}

function patchItemEnabled(
  catalog: CatalogPayload,
  itemId: string,
  enabled: boolean,
): CatalogPayload {
  const patchList = (items: CatalogItem[]): CatalogItem[] =>
    items.map((entry) => (entry.id === itemId ? { ...entry, enabled } : entry));

  return {
    skills: patchList(catalog.skills),
    rules: patchList(catalog.rules),
  };
}

function replaceCatalogItem(catalog: CatalogPayload, item: CatalogItem): CatalogPayload {
  const replaceInList = (items: CatalogItem[]): CatalogItem[] =>
    items.map((entry) => (entry.id === item.id ? item : entry));

  if (item.kind === "skill") return { skills: replaceInList(catalog.skills), rules: catalog.rules };

  return { skills: catalog.skills, rules: replaceInList(catalog.rules) };
}

export function useCatalog(handshakeStatus: HandshakeStatus): UseCatalogResult {
  const [catalog, setCatalog] = useState<CatalogPayload | undefined>(undefined);
  const [toggleError, setToggleError] = useState<string | undefined>(undefined);
  const [openError, setOpenError] = useState<string | undefined>(undefined);
  const [pendingToggleIds, setPendingToggleIds] = useState<ReadonlySet<string>>(() => new Set());
  const latestTargetByIdRef = useRef<Map<string, boolean>>(new Map());
  const actionEpochRef = useRef(0);
  const toggleEpochByIdRef = useRef<Map<string, number>>(new Map());
  const openEpochRef = useRef<number | null>(null);

  useEffect(() => {
    if (handshakeStatus !== "connected") return;

    requestCatalog();

    return subscribeToHostMessages((message) => {
      if (message.type === HOST_TO_WEBVIEW_MESSAGE_TYPES.catalog) {
        setCatalog({
          skills: message.skills,
          rules: message.rules,
        });
        setPendingToggleIds(new Set());
        latestTargetByIdRef.current.clear();
        toggleEpochByIdRef.current.clear();
        return;
      }

      if (message.type === HOST_TO_WEBVIEW_MESSAGE_TYPES.openResult) {
        if (openEpochRef.current !== actionEpochRef.current) return;
        if (message.ok) {
          setOpenError(undefined);
          return;
        }
        setOpenError(message.error);
        return;
      }

      if (message.type !== HOST_TO_WEBVIEW_MESSAGE_TYPES.toggleResult) return;

      const resultId = message.ok ? message.item.id : message.id;
      if (toggleEpochByIdRef.current.get(resultId) !== actionEpochRef.current) return;

      if (message.ok) {
        const latestTarget = latestTargetByIdRef.current.get(message.item.id);
        if (latestTarget !== message.item.enabled) return;

        latestTargetByIdRef.current.delete(message.item.id);
        setPendingToggleIds((previous) => {
          const next = new Set(previous);
          next.delete(message.item.id);
          return next;
        });
        setCatalog((previous) =>
          previous === undefined ? previous : replaceCatalogItem(previous, message.item),
        );
        return;
      }

      const latestTarget = latestTargetByIdRef.current.get(message.id);
      if (latestTarget !== message.enabled) return;

      latestTargetByIdRef.current.delete(message.id);
      setPendingToggleIds((previous) => {
        const next = new Set(previous);
        next.delete(message.id);
        return next;
      });
      setCatalog((previous) =>
        previous === undefined
          ? previous
          : patchItemEnabled(previous, message.id, !message.enabled),
      );
      setToggleError(message.error);
    });
  }, [handshakeStatus]);

  const resetForFolderChange = useCallback(() => {
    actionEpochRef.current += 1;
    latestTargetByIdRef.current.clear();
    toggleEpochByIdRef.current.clear();
    openEpochRef.current = null;
    setCatalog(undefined);
    setPendingToggleIds(new Set());
    setToggleError(undefined);
    setOpenError(undefined);
  }, []);

  const toggleItemEnabled = useCallback((item: CatalogItem, nextEnabled: boolean) => {
    latestTargetByIdRef.current.set(item.id, nextEnabled);
    toggleEpochByIdRef.current.set(item.id, actionEpochRef.current);
    setToggleError(undefined);
    setOpenError(undefined);
    setPendingToggleIds((previous) => new Set(previous).add(item.id));
    setCatalog((previous) =>
      previous === undefined ? previous : patchItemEnabled(previous, item.id, nextEnabled),
    );
    requestToggleEnabled(item.id, nextEnabled);
  }, []);

  const openItem = useCallback((item: CatalogItem) => {
    openEpochRef.current = actionEpochRef.current;
    setOpenError(undefined);
    setToggleError(undefined);
    requestOpenItem(item.id);
  }, []);

  const openLiveActivation = useCallback((id: string) => {
    openEpochRef.current = actionEpochRef.current;
    setOpenError(undefined);
    setToggleError(undefined);
    requestOpenLiveActivation(id);
  }, []);

  const clearToggleError = useCallback(() => {
    setToggleError(undefined);
  }, []);

  const clearOpenError = useCallback(() => {
    setOpenError(undefined);
  }, []);

  return {
    catalog,
    toggleError,
    openError,
    pendingToggleIds,
    toggleItemEnabled,
    openItem,
    openLiveActivation,
    resetForFolderChange,
    clearToggleError,
    clearOpenError,
  };
}
