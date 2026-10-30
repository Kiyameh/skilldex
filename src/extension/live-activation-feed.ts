import type { Disposable } from "vscode";
import type { LiveFeedSnapshot } from "../shared/index.js";

export const INITIAL_LIVE_FEED: LiveFeedSnapshot = { watching: true, chips: [] };

export function addActivation(
  feed: LiveFeedSnapshot,
  id: string,
  name: string,
  workspaceName: string,
  activatedAt: string,
): LiveFeedSnapshot {
  if (!feed.watching) return feed;
  return { watching: true, chips: [{ id, name, workspaceName, activatedAt }, ...feed.chips] };
}

export function setFeedWatching(feed: LiveFeedSnapshot, watching: boolean): LiveFeedSnapshot {
  if (feed.watching === watching) return feed;
  return { watching, chips: feed.chips };
}

export function resetFeed(feed: LiveFeedSnapshot): LiveFeedSnapshot {
  return { watching: feed.watching, chips: [] };
}

export type LiveFeedListener = (snapshot: LiveFeedSnapshot) => void;

export interface LiveActivationFeed {
  getSnapshot: () => LiveFeedSnapshot;
  addActivation: (name: string, workspaceName: string, skillFilePath: string) => void;
  getSkillFilePath: (id: string) => string | undefined;
  setWatching: (watching: boolean) => void;
  reset: () => void;
  onDidChange: (listener: LiveFeedListener) => Disposable;
}

export function createLiveActivationFeed(): LiveActivationFeed {
  let snapshot = INITIAL_LIVE_FEED;
  let nextActivationNumber = 1;
  const skillFilePaths = new Map<string, string>();
  const listeners = new Set<LiveFeedListener>();

  const update = (next: LiveFeedSnapshot): void => {
    if (next === snapshot) return;
    snapshot = next;
    for (const listener of listeners) listener(snapshot);
  };

  return {
    getSnapshot: () => snapshot,
    addActivation: (name, workspaceName, skillFilePath) => {
      if (!snapshot.watching) return;
      const id = `activation-${nextActivationNumber++}`;
      skillFilePaths.set(id, skillFilePath);
      update(addActivation(snapshot, id, name, workspaceName, new Date().toISOString()));
    },
    getSkillFilePath: (id) => skillFilePaths.get(id),
    setWatching: (watching) => update(setFeedWatching(snapshot, watching)),
    reset: () => {
      skillFilePaths.clear();
      update(resetFeed(snapshot));
    },
    onDidChange: (listener) => {
      listeners.add(listener);
      return { dispose: () => listeners.delete(listener) };
    },
  };
}
