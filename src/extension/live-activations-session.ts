import path from "node:path";
import type { Disposable } from "vscode";
import type { CatalogItem } from "../shared/index.js";
import { createLiveActivationFeed, type LiveActivationFeed } from "./live-activation-feed.js";
import { startLiveActivationIntake, type WatchFiles } from "./live-activation-intake.js";
import { resolveLiveChipName } from "./resolve-live-chip-name.js";

export interface LiveActivationsSessionOptions {
  spoolPath: string;
  projectsDirectory: string;
  workspacePaths: string[];
  openFolderPaths: string[];
  watchFiles: WatchFiles;
}

export interface LiveActivationsSession extends Disposable {
  feed: LiveActivationFeed;
  setCatalogSkills: (skills: CatalogItem[]) => void;
  whenSettled: () => Promise<void>;
}

export function startLiveActivationsSession(
  options: LiveActivationsSessionOptions,
): LiveActivationsSession {
  const feed = createLiveActivationFeed();
  let catalogSkills: CatalogItem[] = [];

  const intake = startLiveActivationIntake({
    ...options,
    onSkillActivated: (skillFilePath, workspaceDirectory) => {
      feed.addActivation(
        resolveLiveChipName(skillFilePath, catalogSkills),
        path.basename(workspaceDirectory),
        skillFilePath,
      );
    },
  });

  return {
    feed,
    setCatalogSkills: (skills) => {
      catalogSkills = skills;
    },
    whenSettled: () => intake.whenSettled(),
    dispose: () => intake.dispose(),
  };
}
