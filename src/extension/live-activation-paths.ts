import path from "node:path";

const CURSOR_HOME_DIRECTORY_NAME = ".cursor";
const CURSOR_PROJECTS_DIRECTORY_NAME = "projects";
const LIVE_ACTIVATIONS_DIRECTORY_NAME = "live-activations";
const SKILL_READ_SPOOL_FILE_NAME = "skill-reads.jsonl";

export interface LiveActivationPaths {
  cursorDirectory: string;
  projectsDirectory: string;
  spoolPath: string;
}

export function resolveLiveActivationPaths(
  homeDirectory: string,
  globalStorageDirectory: string,
): LiveActivationPaths {
  const cursorDirectory = path.join(homeDirectory, CURSOR_HOME_DIRECTORY_NAME);
  return {
    cursorDirectory,
    projectsDirectory: path.join(cursorDirectory, CURSOR_PROJECTS_DIRECTORY_NAME),
    spoolPath: path.join(
      globalStorageDirectory,
      LIVE_ACTIVATIONS_DIRECTORY_NAME,
      SKILL_READ_SPOOL_FILE_NAME,
    ),
  };
}
